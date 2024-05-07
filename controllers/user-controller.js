const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    // console.log(email, password, name);
    // res.send("OK");
    // Перевірка що поля існують
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: "Користувач вже існує" });
      }

      // Хешуємо пароль, створюємо безпеку
      const hashedPassword = await bcrypt.hash(password, 10);

      // Генерація аватарів
      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      // Cтворення користувача
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    try {
      // Пошук користувача
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: "Невірний логін або пароль" });
      }

      // Перевірка пароля
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Невірний логін або пароль" });
      }

      // Генерація токену
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Користувача не знайдено" });
      }

      // Перевіряем, підписан цей користувач на іншого користувача
      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    // Перевірка на те що користувач оновлює свою інформацію
    if (id !== req.user.userId) {
      return res.status(403).json({ error: "Немає доступу" });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ error: "Пошта вже використовується" });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });
      res.json(user);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },
  current: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(400).json({ error: "Не вдалося знайти користувача" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },
};

module.exports = UserController;

const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  likePost: async (req, res) => {
    // res.send('likepost');

    const { postId } = req.body;

    const userId = req.user.userId;

    // Перевіркаб що публікація існує
    if (!postId) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    try {
      // Перевірка на існування лайку
      const existingLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if (existingLike) {
        return res
          .status(400)
          .json({ error: "Ви вже поставили лайк цій публікації" });
      }

      const like = await prisma.like.create({
        data: { postId, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },

  unlikePost: async (req, res) => {
    // res.send('unlikepost');
    const { id } = req.params;

    const userId = req.user.userId;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Ви вже поставили дилайк цій публікації" });
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existingLike) {
        return res
          .status(400)
          .json({ error: "Не можна ставити дизлайк цій публікації" });
      }

      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      });

      res.json(like);
    } catch (error) {
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },
};

module.exports = LikeController;

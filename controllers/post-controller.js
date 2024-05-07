const { prisma } = require("../prisma/prisma-client");

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Error in createPost:", error);

      res.status(500).json({ error: "There was an error creating the post" });
    }
  },
  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc", // 'desc' тобто нові пости будуть перші у списку
        },
      });

      // Перевірка чи стоїть лайк користувача, який пеоеглядає пости
      const postsWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postsWithLikeInfo);
    } catch (err) {
      res.status(500).json({ error: "Виникла помилка при отримані постів" });
    }
  },
  getPostById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        }, // Include related posts
      });

      if (!post) {
        return res.status(404).json({ error: "Пост не знайдено" });
      }

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      res.json(postWithLikeInfo);
    } catch (error) {
      res.status(500).json({ error: "Виникла помилка при отримані поста" });
    }
  },
  deletePost: async (req, res) => {
    const { id } = req.params;

    // Перевірка, що користувач видаляє свій пост
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Пост знайдено" });
    }

    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: "Немає доступу" });
    }

    // Видалення усього, що пов'язано з публікацією за допомоги транзакцій призма - видалення з декількох баз даних
    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Щось пішло не так" });
    }
  },
};

module.exports = PostController;

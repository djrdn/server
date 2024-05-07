const { prisma } = require("../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    // res.send('create comment');
    try {
      const { postId, content } = req.body;
      const userId = req.user.userId;

      if (!postId || !content) {
        return res.status(400).json({ error: "Всі поля обов'язкові" });
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Не вдалося створити коментар" });
    }
  },

  deleteComment: async (req, res) => {
    // res.send('delete comment');

    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Перевірка, що коментар існує
      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return res.status(404).json({ error: "Коментар не знайдено" });
      }

      // Перевірка, що користувач є власником цього коментарю
      if (comment.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Ви не авторизовані для видалення цього коментаря" });
      }

      // Видалення коментаря
      await prisma.comment.delete({ where: { id } });

      res.json(comment);
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Не удалось удалить комментарий" });
    }
  },
};

module.exports = CommentController;

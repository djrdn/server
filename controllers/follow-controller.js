const { prisma } = require("../prisma/prisma-client");

const FollowController = {
  followUser: async (req, res) => {
    //res.send('followuser')
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId) {
      return res
        .status(500)
        .json({ message: "Ви не можете підписатися самі на себе" });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followerId: userId,
            },
            {
              followingId,
            },
          ],
        },
      });

      if (existingSubscription) {
        return res.status(400).json({ message: "Ви вже підписані" });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: "Підписка створена" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Помилка сервера" });
    }
  },
  unfollowUser: async (req, res) => {
    //res.send('unfollowuser')

    const { followingId } = req.body;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: followingId }],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: "Запис не знайдено" });
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      });

      res.status(200).json({ message: "Відписка виконана" });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Помилка сервера" });
    }
  },
};

module.exports = FollowController;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { UserController } = require("../controllers");
const { PostController } = require("../controllers");
const { CommentController } = require("../controllers");
const { LikeController } = require("../controllers");
const { FollowController } = require("../controllers");
const { authenticateToken } = require("../middleware/auth");

const uploadDestination = "uploads"; // multer будет всё сохранять сюда

// Показуємо де зберігати файли
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

// Роути для користувача
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put("/users/:id", authenticateToken, uploads.single('avatar'), UserController.updateUser);

// Роути для постів
router.post("/posts", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/posts/:id", authenticateToken, PostController.getPostById);
router.delete("/posts/:id", authenticateToken, PostController.deletePost);

// Роути для коментарів
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  CommentController.deleteComment
);

// Роути для лайків
router.post("/likes", authenticateToken, LikeController.likePost);
router.delete("/likes/:id", authenticateToken, LikeController.unlikePost);

// Роути для підписки та відписки
router.post("/follow", authenticateToken, FollowController.followUser);
router.delete("/unfollow/:id", authenticateToken, FollowController.unfollowUser);

module.exports = router;

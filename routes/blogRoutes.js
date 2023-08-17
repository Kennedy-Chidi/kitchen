const express = require("express");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");
const { upload, deleteFile } = require("../config/multer");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    upload.single("banner"),
    blogController.createBlog,
    blogController.getBlogs
  )
  .get(blogController.getBlogs);

router
  .route("/:id")
  .patch(
    authController.protect,
    upload.single("banner"),
    blogController.updateBlog,
    deleteFile,
    blogController.getBlogs
  )
  .delete(
    authController.protect,
    // authController.restrictTo("room"),
    blogController.deleteBlog,
    deleteFile,
    blogController.getBlogs
  );

module.exports = router;

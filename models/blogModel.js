const mongoose = require("mongoose");
const validator = require("validator");

const blogSchema = new mongoose.Schema({
  category: String,
  title: String,
  subtitle: String,
  banner: String,
  bannerUrl: String,
  time: Number,
  author: String,
  content: String,
  blogType: String,

  status: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Number,
    default: new Date().getTime(),
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;

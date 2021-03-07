const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Comment", CommentSchema);

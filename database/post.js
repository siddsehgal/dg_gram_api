const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Posts = new Schema({
  id: ObjectId,
  content: String,
  datePublished: String,
  userId: String,
   
});



module.exports = Posts;
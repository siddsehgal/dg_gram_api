const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Chats = new Schema({
  id: ObjectId,
  users: [{ id: String, }],
  chatData: [{
    msgId: String,
    msg: String,
    msgBy: String,
    date: Object,
  }],
});



module.exports = Chats;
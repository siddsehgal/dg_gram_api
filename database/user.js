const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    userId: {type: String, unique: true},
    name: String,
    email: {type: String, unique: true},
    password: String,
    joinDate: String,
    followers: [{
        followerId: String,
    }],
    following: [{
        followingId: String,
    }],
    posts: [{
        postId: String,
    }],
    verified: Boolean,

});

const Users = mongoose.model('User', user);

module.exports = Users;
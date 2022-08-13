const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verifyEmail = new Schema({
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

module.exports = mongoose.model('VerifyEmail', verifyEmail);
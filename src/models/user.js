const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    username : { type : String, unique : true },
    email : { type : String, unique : true },
    password : { type : String },
    name : { type : String },
    avatar : { type : String },
    gmailUserId : { type : String },
    online: { type: Boolean },
    status : { type : Boolean },
    refUser : { type : String },
},{
    timestamps: true
});

const User = new mongoose.model('User', userSchema);
module.exports = User;
const mongoose = require("mongoose");
const validator = require("validator");

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    username : { type : String },
    name: { type: String },
    avatar: { type: String },
    token : { type : String },
    available: { type: Boolean },
    isConnect: { type: Boolean },
    connectUsername: { type: String },
},{
    timestamps: true
});

const Token = new mongoose.model('Token', tokenSchema);
module.exports = Token;
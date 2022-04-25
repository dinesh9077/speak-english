const mongoose = require("mongoose");
const validator = require("validator");

const roomSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    username : { type : String },
    name: { type: String },
    avatar: { type: String },
    token : { type : String },
    roomName : { type : String },
    available: { type: Boolean },
    isConnect: { type: Boolean },
    connectUserId: { type: String },
    connectUsername: { type: String },
    connectName: { type: String },
    connectAvatar: { type: String },
    connectToken: { type: String },
},{ 
    timestamps: true
});

const Room = new mongoose.model('Room', roomSchema);
module.exports = Room;
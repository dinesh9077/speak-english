const mongoose = require("mongoose");
const validator = require("validator");

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    username : { type : String },
    connectUserId: { type: mongoose.Schema.Types.ObjectId },
    connectUsername : { type : String },
    connectName: { type: String },
    connectAvatar: { type: String },
    type : { type : String },
},{
    timestamps: true
});

const History = new mongoose.model('History', historySchema);
module.exports = History;
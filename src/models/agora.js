const mongoose = require("mongoose");

const agoraSchema = new mongoose.Schema({
    appId: { type: String }, //975826e708144327a987d81314927ce9
    appCertificate : { type : String }, //b4d04ddfd42c44e084a3cb46893fcc1d
},{
    timestamps: true
});

const Agora = new mongoose.model('Agora', agoraSchema);
module.exports = Agora;

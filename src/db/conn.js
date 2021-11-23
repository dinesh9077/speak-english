const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://abhi_codes:Anikesh16@cluster-speack-english.mnxy2.mongodb.net/speackEnglishDB?retryWrites=true&w=majority";

mongoose.connect(
    mongoURI,
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
 }).then(() => {
    console.log("Connection is successful...");
}).catch((e) => {
    console.log(e.message);
})

module.exports = mongoURI;
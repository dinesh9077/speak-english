const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const History = require("../models/history");

router.post("/callHistory", async(req,res) => {

    var username = req.body.username;

    try {

        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "Username not found..!"});
        }

        const historyDetails = await History.find({username: username}).sort({$natural: - 1}).limit(5);;

        return res.send({success: true, data: historyDetails});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

module.exports = router;
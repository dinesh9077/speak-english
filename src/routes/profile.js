const express = require("express");
const router = new express.Router();
const User = require("../models/user");

router.post("/user/profile", async(req,res) => {

    var username = req.body.username;

    try {

        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "Username not found..!"});
        }

        return res.send({success: true, data: userDetails});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


module.exports = router;
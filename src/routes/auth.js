const express = require("express");
const router = new express.Router();
const User = require("../models/user");

//login Api
router.post("/auth/login", async(req,res) => {
    try {
        var email = req.body.email;
        var gmailUserId = req.body.gmailUserId;
        var name = req.body.name;
        var avatar = req.body.avatar;
        const userDetails = await User.findOne({email: email});

        if (!gmailUserId) {
            return res.status(400).json({success: false, message: "Please send gmail user id..!"});
        }

        //set login
        if (userDetails) {
            var pass = email + gmailUserId;
            if (pass == userDetails.password) {
                return res.status(200).json({success: true, message : "Login Successfully", userData : userDetails});
            }
            return res.status(400).json({success: false, message: "Email Already Registered."});
        } else {
            //set singup
            var newUsername = name.substring(0, 5).toLowerCase() + gmailUserId.substring(0, 4).toLowerCase();
            var newPass = email + gmailUserId;
            const user = new User({
                username: newUsername.replace(" ", ""),
                email: email,
                password: newPass,
                name: name,
                avatar: avatar,
                status: true,
                refUser: ""
            });
            const addUser = await user.save();
            return res.status(200).json({success: true, message: "User Registartion Successfully.", userData: addUser});
        }
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


module.exports = router;
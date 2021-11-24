const express = require("express");
const router = new express.Router();
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const User = require("../models/user");
const Token = require("../models/token");

const appID = "975826e708144327a987d81314927ce9";
const appCertificate = "b4d04ddfd42c44e084a3cb46893fcc1d";

router.post("/joinCall", async(req,res) => {
    try {
        var username = req.body.username;
        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        const onlineUsers = await Token.find({available: true, isConnect: false});

        return res.status(200).json({success: true, data: onlineUsers});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
})

//online - offline status
router.post("/online", async(req,res) => {
    try {
        var username = req.body.username;
        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        if (userDetails.online) {
            const updateUser = await User.findByIdAndUpdate(userDetails._id, {online: false}, {new:true});
            return res.status(200).json({success: true, message: "Offline Successfully.", data: updateUser});
        }

        const updateUser = await User.findByIdAndUpdate(userDetails._id, {online: true}, {new:true});
        return res.status(200).json({success: true, message: "Online Successfully.", data: updateUser});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

//genrate token
router.post("/callNow", async(req, res) => {
    try {
        var username = req.body.username;
        let uid = req.body.uid;
        let role = RtcRole.SUBSCRIBER;
        let expireTime = req.body.expireTime;

        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }
        const channel = username;

        if(!uid || uid == '') {
            uid = 0;
        }

        if (req.body.role == 'publisher') {
          role = RtcRole.PUBLISHER;
        }

        if (!expireTime || expireTime == '') {
            expireTime = 3600;
        } else {
            expireTime = parseInt(expireTime, 10);
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const privilegeExpireTime = currentTime + expireTime;

        const preTokenDetails = await Token.findOne({username: username, available: true});

        if (preTokenDetails) {
            await Token.findByIdAndUpdate(preTokenDetails._id, {available: false}, {new:true});
        } 

        const genratedToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channel, uid, role, privilegeExpireTime);

        const token = new Token({
            userId: userDetails._id,
            username: userDetails.username,
            name: userDetails.name,
            avatar: userDetails.avatar,
            token: genratedToken,
            available: true,
            isConnect: false,
        });

        const addToken = await token.save();

        return res.status(200).json({success: true, data: addToken});

        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

module.exports = router;
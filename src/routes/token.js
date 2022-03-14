const express = require("express");
const router = new express.Router();
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const User = require("../models/user");
const Token = require("../models/token");
const History = require("../models/history");
const Agora = require("../models/agora");

// const appID = "975826e708144327a987d81314927ce9";
// const appCertificate = "b4d04ddfd42c44e084a3cb46893fcc1d";

router.post("/availableOnblineUsers", async(req,res) => {
    try {
        
        const findOnlineUsers = await User.find({online: true});
        return res.status(200).json({success: true, data: findOnlineUsers})

    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
})

router.post("/connectCall", async(req,res) => {
    try {
        var username = req.body.username;
        var connectUsername = req.body.connectUsername;

        const userDetails = await User.findOne({username: username});
        const connectUserDetails = await User.findOne({username: connectUsername});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "Username not found..!"});
        }
        if (!connectUserDetails) {
            return res.status(400).json({success: false, message: "Connect username not found..!"});
        }

        const onlineToken = await Token.findOne({username : connectUserDetails.username, available: true});
        if (onlineToken) {
            if (onlineToken.isConnect) {
                return res.status(400).json({success: false, message: "User Already Connected..!"});
            }
            const updateToken = await Token.findByIdAndUpdate(onlineToken._id, {isConnect: true}, {new:true});
        }
        
        const incomingCall = new History({
            userId: userDetails._id,
            username: userDetails.username,
            connectUserId: connectUserDetails._id,
            connectUsername: connectUserDetails.username,
            connectName: connectUserDetails.name,
            connectAvatar: connectUserDetails.avatar,
            type: "Incoming",
        });
        await incomingCall.save();

        const outgoingCall = new History({
            userId: connectUserDetails._id,
            username: connectUserDetails.username,
            connectUserId: userDetails._id,
            connectUsername: userDetails.username,
            connectName: userDetails.name,
            connectAvatar: userDetails.avatar,
            type: "Outgoing",
        });
        await outgoingCall.save();
        

        return res.status(200).json({success: true, message: "Connect successfully."});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

router.post("/disconnectCall", async(req,res) => {
    try {
        var username = req.body.username;

        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "Username not found..!"});
        }

        const onlineToken = await Token.findOne({username : userDetails.username, available: true});
        if (onlineToken) {
            const updateToken = await Token.findByIdAndUpdate(onlineToken._id, {isConnect: true}, {new:true});
        }   
        
        return res.status(200).json({success: true, message: "Disconnect successfully."});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

router.post("/joinCall", async(req,res) => {
    try {
        var username = req.body.username;
        var onlineUserList = [];
        var callNowUserList = [];
        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        // const onlineUsers = await Token.find({available: true, isConnect: false});

        // for (let i = 0; i < onlineUsers.length; i++) {
        //     const newUsername = onlineUsers[i].username;
        //     if (newUsername != username) {
        //         onlineUserList.push(onlineUsers[i]);
        //     }
        // }

        const callNowUsers = await Token.find({available: true, isConnect: false, connectUsername: username});

        if (callNowUsers.length == 0) {
            return res.status(400).json({success: false, message: "No users are available..!"});
        }

         for (let i = 0; i < callNowUsers.length; i++) {
            const newUsername = callNowUsers[i].username;
            if (newUsername != username) {
                callNowUserList.push(callNowUsers[i]);
            }
        }

        return res.status(200).json({success: true, data: callNowUserList});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

//online - offline status
router.post("/online", async(req,res) => {
    try {
        var username = req.body.username;
        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        if (userDetails.online) {
            const updateUser = await User.findByIdAndUpdate(userDetails._id, {online: false}, {new: true});

            const preTokenDetails = await Token.findOne({username: username, available: true});
            if (preTokenDetails) {
                await Token.findByIdAndUpdate(preTokenDetails._id, {available: false}, {new: true});
            } 

            return res.status(200).json({success: true, message: "Offline Successfully.", data: updateUser});
        }

        const updateUser = await User.findByIdAndUpdate(userDetails._id, {online: true}, {new: true});
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

        var onlineUserData;

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

        const agoraData = await Agora.findOne();

        if (!agoraData) {
            return res.status(400).json({success: false, message: "Please Add Agora Service from Admin"});
        }

        const onlineUsers = await User.find({online: true});

        if (onlineUsers.length == 0) {
            return res.status(400).json({success: false, message: "No users are online..!"});
        }

        for (let i = 0; i < onlineUsers.length; i++) {
            const newUsername = onlineUsers[i].username;
            if (newUsername != username) {
                onlineUserData = onlineUsers[0];
            }
        }

        const genratedToken = RtcTokenBuilder.buildTokenWithUid(agoraData.appId, agoraData.appCertificate, channel, uid, role, privilegeExpireTime);

        const token = new Token({
            userId: userDetails._id,
            username: userDetails.username,
            name: userDetails.name,
            avatar: userDetails.avatar,
            token: genratedToken,
            available: true,
            isConnect: false,
            connectUsername: onlineUserData.username,
        });

        const addToken = await token.save();

        const updateUser = await User.findByIdAndUpdate(onlineUserData._id, {online: false}, {new:true});

        return res.status(200).json({success: true, data: addToken});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

module.exports = router;
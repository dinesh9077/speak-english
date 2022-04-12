const express = require("express");
const router = new express.Router();
const { generateToken04 } = require('../zegoServer/zegoServerAssistant');
const Token = require("../models/token");
const User = require("../models/user");
const Agora = require("../models/agora");


//
//
const appID = 1131077641; // type: number
const secret = 'a86bab6d85c6f5ee14e75681b8234a67';// type: 32 byte length string
const userId = 'abhi002';// type: string
const effectiveTimeInSeconds = 3600; //type: number; unit: s
const payloadObject = {
    room_id: 'AbhiCodesRoom001',
    privilege: {
        1: 1,   // loginRoom: 1 pass , 0 not pass
        2: 0   // publishStream: 1 pass , 0 not pass
    },
    stream_id_list: null
}; // 
const payload = JSON.stringify(payloadObject);

router.post("/generateToken04", async(req,res) => {
    try {
        const token = generateToken04(appID, userId, secret, effectiveTimeInSeconds, payload); 
        console.log('token:',token);

        return res.status(200).json({success: true, token: token});
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


//online - offline status with zego
router.post("/onlineZego", async(req,res) => {
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

        const channel = username;
        console.log(`Online user Room : ${channel}`);

        const newPayloadObject = {
            room_id: channel,
            privilege: {
                1: 1,   // loginRoom: 1 pass , 0 not pass
                2: 0   // publishStream: 1 pass , 0 not pass
            },
            stream_id_list: null
        }; // 
        const newPayload = JSON.stringify(newPayloadObject);

        const genratedToken = generateToken04(appID, username, secret, effectiveTimeInSeconds, newPayload);;


        const updateUser = await User.findByIdAndUpdate(userDetails._id, {online: true}, {new: true});
        return res.status(200).json({
            success: true, 
            message: "Online Successfully.", 
            data: updateUser, 
            token: genratedToken,
            roomId: channel,
        });
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


//genrate token
router.post("/callNowZego", async(req, res) => {
    try {
        var username = req.body.username;
        let uid = req.body.uid;
        let expireTime = req.body.expireTime;

        var onlineUserData;

        const userDetails = await User.findOne({username: username});
        if (!userDetails) {
            return res.status(400).json({success: false, message: "Username not found..!"});
        }

        if(!uid || uid == '') {
            uid = 0;
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

        var onlineUsers = await User.find({online: true});

        if (onlineUsers.length == 0) {
            return res.status(400).json({success: false, message: "No users are online..!"});
        }

        for (let i = 0; i < onlineUsers.length; i++) {
            const newUsername = onlineUsers[i].username;

            if (username == newUsername) {
                onlineUsers.splice(i, 1)
            }

            onlineUserData = onlineUsers[Math.floor(Math.random()*onlineUsers.length)];
        }

        if (!onlineUserData) {
            return res.status(400).json({success: false, message: "No users are online..!"});
        }

        const channel = onlineUserData.username;
        console.log(`Online user Room : ${channel}`);

        const newPayloadObject = {
            room_id: channel,
            privilege: {
                1: 1,   // loginRoom: 1 pass , 0 not pass
                2: 0   // publishStream: 1 pass , 0 not pass
            },
            stream_id_list: null
        }; // 
        const newPayload = JSON.stringify(newPayloadObject);

        const genratedToken = generateToken04(appID, username, secret, effectiveTimeInSeconds, newPayload);;

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
const express = require("express");
const router = new express.Router();
const { generateToken04 } = require('../zegoServer/zegoServerAssistant');
const User = require("../models/user");
const Room = require("../models/room");



const appID = 1131077641; // type: number
const secret = 'a86bab6d85c6f5ee14e75681b8234a67';// type: 32 byte length string
const effectiveTimeInSeconds = 3600; //type: number; unit: s



router.post("/newCallNowZego", async(req,res) => {
    try {

        var username = req.body.username;
        var availableUserList = [];
        const userDetails = await User.findOne({username: username});

        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        const onlineAvailableUser = await User.find({online: true, connected: false});

        for (let i = 0; i < onlineAvailableUser.length; i++) {
            const element = onlineAvailableUser[i];
            if (element['username'] != username) {
                availableUserList.push(element);
            }
        }

        //no user are available
        if (availableUserList.length == 0) {

            var roomId = username + "Room";

            //create zego token with room id
            const newPayloadObject = {
                room_id: roomId,
                privilege: {
                    1: 1,   // loginRoom: 1 pass , 0 not pass
                    2: 0   // publishStream: 1 pass , 0 not pass
                },
                stream_id_list: null
            };
            const newPayload = JSON.stringify(newPayloadObject);

            const genratedToken = generateToken04(appID, username, secret, effectiveTimeInSeconds, newPayload);

            const updateUserRoomIdToken = await User.findByIdAndUpdate(userDetails._id, {
                zegoToken: genratedToken, 
                roomId: roomId,
                online: true, 
                connected: false,
            }, {new: true});

            //add in ROOM collection
            const addRoom = new Room({
                userId: userDetails._id,
                username: userDetails.username,
                name: userDetails.name,
                avatar: userDetails.avatar,
                token: genratedToken,
                roomName: roomId,
                available: true,
                isConnect: false,
            });
            await addRoom.save();
            

            return res.status(200).json({
                success: true, 
                message: "User online successfully.", 
                newUser: true,
                data: updateUserRoomIdToken,
                room : addRoom,
            });
        }

        //-------------------- Connect available room ------------------//
        const availableUserDetails = availableUserList[Math.floor(Math.random()*availableUserList.length)];

        const updateRoomUser = await User.findByIdAndUpdate(availableUserDetails._id, {
            online: true, 
            connected: true,
        }, {new: true});

        //create zego token with room id
        const newPayloadObject = {
            room_id: availableUserDetails.roomId,
            privilege: {
                1: 1,   // loginRoom: 1 pass , 0 not pass
                2: 0   // publishStream: 1 pass , 0 not pass
            },
            stream_id_list: null
        };
        const newPayload = JSON.stringify(newPayloadObject);

        const genratedToken = generateToken04(appID, username, secret, effectiveTimeInSeconds, newPayload);

        const updateCurrentUser = await User.findByIdAndUpdate(userDetails._id, {
            zegoToken: genratedToken, 
            roomId: availableUserDetails.roomId,
            online: true, 
            connected: true,
        },{new: true});

        //update in ROOM collection
        const userRoomDetails = await Room.findOne({username: availableUserDetails.username, available: true, isConnect: false});
       
        if (userRoomDetails) {
            await Room.findByIdAndUpdate(userRoomDetails._id, {
                isConnect: true,
                connectUserId: userDetails._id,
                connectUsername: userDetails.username,
                connectName: userDetails.name,
                connectAvatar: userDetails.avatar,
                connectToken: genratedToken,
            },{new: true});
        }

        const roomDetails = await Room.findById(userRoomDetails._id);

        return res.status(200).json({
            success: true, 
            message: "User available.", 
            newUser: false,
            data: updateCurrentUser,
            room: roomDetails,
        });
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


router.post("/checkRoomIsAvailable", async(req,res) => {
    try {
        var roomId = req.body.roomId;
        const roomDetails = await Room.findById(roomId);

        if (!roomDetails) {
            return res.status(400).json({success: false, message: "room not found..!"});
        }

        if (roomDetails.available) {
            return res.status(200).json({
                success: true, 
                message: "Room available.", 
                data: roomDetails,
            });
        }


        return res.status(200).json({
            success: false, 
            message: "Room not available..!", 
            data: roomDetails,
        });

       
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


router.post("/newCallEndZego", async(req,res) => {
    try {
        
        var roomId = req.body.roomId;
        var username = req.body.username;

        const roomDetails = await Room.findById(roomId);

        if (!roomDetails) {
            return res.status(400).json({success: false, message: "room not found..!"});
        }

        const userDetails = await User.findOne({username: username});

        if (!userDetails) {
            return res.status(400).json({success: false, message: "username not found..!"});
        }

        const updateRoom = await Room.findByIdAndUpdate(roomDetails._id, {
            available: false,
            isConnect: false,
        },{new: true});

        const updateUserRoomIdToken = await User.findByIdAndUpdate(userDetails._id, {
            zegoToken: "", 
            roomId: "",
            online: false, 
            connected: false,
        }, {new: true});

        return res.status(200).json({
            success: true, 
            message: "Call Disconnect Successfully", 
            data: updateRoom,
        });


    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


module.exports = router;
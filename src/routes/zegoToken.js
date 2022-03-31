const express = require("express");
const router = new express.Router();
const { generateToken04 } = require('../zegoServer/zegoServerAssistant');


const appID = 1; // type: number
const secret = 'fa94dd0f974cf2e293728a526b028271';// type: 32 byte length string
const userId = 'demo';// type: string
const effectiveTimeInSeconds = 3600; //type: number; unit: s
const payloadObject = {
    room_id: 'demo',
    privilege: {
        1: 1,   // loginRoom: 1 pass , 0 not pass
        2: 0   // publishStream: 1 pass , 0 not pass
    },
    stream_id_list: null
}; // 
const payload = JSON.stringify(payloadObject);

router.post("/generateToken04", async(req,res) => {
    try {

        const token =  generateToken04(appID, userId, secret, effectiveTimeInSeconds, payload);
        console.log('token:',token);

        return res.status(200).json({success: true, token: token});
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
})

module.exports = router;
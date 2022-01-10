const express = require("express");
const router = new express.Router();
const Agora = require("../models/agora");

router.post("/admin/agoraServiceUpdate", async(req,res) => {

    var id = req.body.id;
    var appId = req.body.appId;
    var appCertificate = req.body.appCertificate;

    try {
        if (!appId) {
            return res.status(400).json({success: false, message: "Please enter app id."});
        }
        if (!appCertificate) {
            return res.status(400).json({success: false, message: "Please enter app certificate."});
        }
        const agoraDetails = await Agora.findById(id);
        if (!agoraDetails) {
            return res.status(400).json({success: false, message: "Data not found"});
        }

        const updateAgoraService = await Agora.findByIdAndUpdate(id, {appId: appId, appCertificate: appCertificate}, {new:true});
        return res.status(200).json({success: true, message: "Agora Service Update Successfully.", data: updateAgoraService});

    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

router.post("/admin/getAgoraService", async(req,res) => {
    try {
        const agoraData = await Agora.findOne();
        return res.status(200).json({success: true, data: agoraData});

    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});


router.post("/admin/addAgoraService", async(req,res) => {
    var appId = req.body.appId;
    var appCertificate = req.body.appCertificate;

    try {
        if (!appId) {
            return res.status(400).json({success: false, message: "Please enter app id."});
        }
        if (!appCertificate) {
            return res.status(400).json({success: false, message: "Please enter app certificate."});
        }

        const agoraData = await Agora.find();
        if (agoraData.length != 0) {
            return res.status(400).json({success: false, message: "Agora Serivced Already Add..!, Please remove and Add new."});
        }

        const agora = new Agora({
            appId: appId,
            appCertificate: appCertificate,
        });
        const addAgoraSerive = await agora.save();
        return res.status(200).json({success: true, message: "Agora Service Add Successfully.", data: addAgoraSerive});
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

module.exports = router;
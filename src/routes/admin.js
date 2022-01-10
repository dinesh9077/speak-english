const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const History = require("../models/history");

router.post("/admin/Dashboard", async(req,res) => {
    try {

        const userCount = await User.countDocuments({});
        const historyCount = await History.countDocuments({});

        return res.status(200).json({
            usercount: userCount,
            totalCalls: historyCount / 2,
        });
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
})

module.exports = router;
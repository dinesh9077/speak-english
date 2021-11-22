const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Token = require("../models/token");

//genrate token
router.post("/genrateToken", async(req, res) => {
    try {
        
    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
})

module.exports = router;
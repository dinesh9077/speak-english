const express = require("express");
const router = new express.Router();
const User = require("../models/user");

//create new user
router.post("/user", async(req,res) => {
    console.log(req.body);
    try {
        const user = new User(req.body);
        const createUser = await user.save();
        return res.status(200).send(createUser);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
});

//get all user
router.get("/user", async(req,res) => {
    try {
        const userData = await User.find().sort({$natural: - 1});
        return res.send(userData);
    } catch (e) {
        return res.status(500).send(e);
    }
});

//update user
router.patch("/user/:id", async(req,res) => {
    try {
        const _id = req.params.id;  
        const updateUser = await User.findByIdAndUpdate(_id, req.body, {new:true});
        return res.send(updateUser);
    } catch (e) {
        return res.status(500).send(e);
    }
});

//delete user
router.delete("/user/:id", async(req,res) => {
    try {
        const _id = req.params.id;
        const deleteUser = await User.findByIdAndDelete(_id);
        if (!_id) {
            return res.status(404).send(e);
        }
        return res.send(deleteUser);
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.post("/user/updateStatus", async(req,res) => {
    try {
        
        var userId = req.body.userId;
        var status = req.body.status;
        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return res.status(400).json({success: false, message: "User doesn't exists..!"});
        }

        const updateUser = await User.findByIdAndUpdate(userId, {status: status}, {new:true});
        return res.status(200).json({success: true, message: "User status update successfully.", data: updateUser})

    } catch (error) {
        return res.status(400).json({success: false, message: error.message});
    }
});

module.exports = router;
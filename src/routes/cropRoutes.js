const express = require("express");

const router = express.Router();

const Crop = require("../models/Crop");

router.post("/add",async(req,res)=>{

const crop = new Crop(req.body);

await crop.save();

res.json(crop);

});

router.get("/",async(req,res)=>{

const crops = await Crop.find();

res.json(crops);

});

module.exports = router;
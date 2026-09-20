const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db/db');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.resolve(__dirname,"../public/upload"));
  },
  filename:function(req,file,cb){
    const name = Date.now()+"_"+file.originalname;
    cb(null,name);
  }
});
const upload = multer({storage});

function authMid(req,res,next){
  const token = req.headers.token;
  if(!token) return res.json({code:401});
  try{ req.user = jwt.verify(token,process.env.JWT_SECRET); next(); }catch{ return res.json({code:401}); }
}

router.post("/sticker",authMid,upload.single("img"),async(req,res)=>{
  const userId = req.user.userId;
  const fileUrl = "/upload/"+req.file.filename;
  await pool.execute("INSERT INTO user_stickers(user_id,file_url) VALUES (?,?)",[userId,fileUrl]);
  res.json({code:200,data:{url:fileUrl}});
});

router.get("/mystickers",authMid,async(req,res)=>{
  const userId = req.user.userId;
  const [rows]=await pool.execute("SELECT * FROM user_stickers WHERE user_id=? ORDER BY id DESC",[userId]);
  res.json({code:200,data:rows});
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register',async (req,res)=>{
  const {username,password}=req.body;
  try{
    const hashPwd = await bcrypt.hash(password,10);
    await pool.execute("INSERT INTO users(username,password) VALUES (?,?)",[username,hashPwd]);
    res.json({code:200,msg:"注册成功"});
  }catch(e){
    res.json({code:500,msg:"用户名已存在或错误"});
  }
});

router.post('/login',async (req,res)=>{
  const {username,password}=req.body;
  const [rows]=await pool.execute("SELECT * FROM users WHERE username=?",[username]);
  if(rows.length===0) return res.json({code:400,msg:"账号不存在"});
  const user = rows[0];
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.json({code:400,msg:"密码错误"});
  const token = jwt.sign({userId:user.id,username:user.username},process.env.JWT_SECRET,{expiresIn:"7d"});
  res.json({code:200,data:{token,username,userId:user.id}});
});

module.exports = router;

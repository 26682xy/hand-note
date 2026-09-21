const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const jwt = require('jsonwebtoken');

function authMid(req,res,next){
  const token = req.headers.token;
  if(!token) return res.json({code:401,msg:"未登录"});
  try{
    const payload = jwt.verify(token,process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch{
    return res.json({code:401,msg:"登录已过期"});
  }
}

//保存/更新手账画布
router.post('/save',authMid,async (req,res)=>{
  const {title,canvasHeight,canvasItems,notebookId}=req.body;
  const userId = req.user.userId;
  if(notebookId){
    await pool.execute("UPDATE notebooks SET title=?,canvas_height=?,canvas_items=? WHERE id=? AND user_id=?",
      [title,canvasHeight,JSON.stringify(canvasItems),notebookId,userId]);
    res.json({code:200,msg:"更新成功"});
  }else{
    const [r]=await pool.execute("INSERT INTO notebooks(user_id,title,canvas_height,canvas_items) VALUES (?,?,?,?)",
      [userId,title,canvasHeight,JSON.stringify(canvasItems)]);
    res.json({code:200,data:{id:r.insertId},msg:"保存成功"});
  }
});


//获取用户全部手账本列表
router.get("/list",authMid,async(req,res)=>{
  // ✅在这里添加关闭缓存的响应头
  res.set({
    'Cache-Control':'no-cache, no-store, must-revalidate',
    'Pragma':'no-cache',
    'Expires':'0'
  })

  const userId = req.user.userId;
  const [list]=await pool.execute("SELECT id,title,created_at FROM notebooks WHERE user_id=? ORDER BY id DESC",[userId]);
  res.json({code:200,data:list});
});


//获取单条手账详情
router.get("/detail/:id",authMid,async(req,res)=>{
  const nid = req.params.id;
  const userId = req.user.userId;
  const [rows]=await pool.execute("SELECT * FROM notebooks WHERE id=? AND user_id=?",[nid,userId]);
  if(rows.length===0) return res.json({code:404,msg:"记录不存在"});
  const d = rows[0];
  d.canvas_items = JSON.parse(d.canvas_items);
  res.json({code:200,data:d});
});

// notebookRoute.js 末尾添加
router.delete("/:id", authMid, async (req,res)=>{
  try{
    const nid = req.params.id;
    const userId = req.user.userId;
    // 必须同时匹配id和所属用户，防止越权删除
    const [result] = await pool.execute(
      "DELETE FROM notebooks WHERE id=? AND user_id=?",
      [nid, userId]
    )
    // 如果影响行数0，说明这条记录不属于该用户/不存在
    if(result.affectedRows === 0){
      return res.json({code:404,msg:"手账不存在或无权删除"})
    }
    res.json({code:200,msg:"删除成功"})
  }catch(err){
    console.error("删除手账错误",err);
    res.json({code:500,msg:"删除失败"})
  }
})


module.exports = router;

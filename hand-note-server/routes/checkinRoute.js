const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authMid } = require('../middleware/auth');

/**
 * @POST /api/checkin/do
 * 打卡（支持补打历史日期） body:{checkDate:"2026‑09‑20"}
 */
router.post("/do",authMid,async (req,res)=>{
  const {checkDate} = req.body;
  if(!checkDate) return res.json({code:400,msg:"缺少checkDate"});
  const userId = req.user.userId;
  try{
    await db.execute(`INSERT IGNORE INTO user_checkin_record(user_id,check_date) VALUES (?,?)`,[userId,checkDate]);
    res.json({code:200,msg:"打卡成功"});
  }catch(e){
    console.error(e);
    res.json({code:500,msg:"打卡失败"});
  }
})
/**
 * @POST /api/checkin/cancel
 * 取消打卡 body:{checkDate:"2026‑09‑20"}
 */
router.post("/cancel",authMid,async (req,res)=>{
  const {checkDate} = req.body;
  if(!checkDate) return res.json({code:400,msg:"缺少checkDate"});
  const userId = req.user.userId;
  try{
    await db.execute(`DELETE FROM user_checkin_record WHERE user_id=? AND check_date=?`,[userId,checkDate]);
    res.json({code:200,msg:"已取消打卡"});
  }catch(e){
    console.error(e);
    res.json({code:500,msg:"取消失败"});
  }
})
/**
 * @GET /api/checkin/month?year=2026&month=9
 * 获取某月已打卡日期列表
 */
router.get("/month",authMid,async (req,res)=>{
  const {year,month} = req.query;
  if(!year||!month) return res.json({code:400,msg:"参数缺失"});
  const start = `${year}-${String(month).padStart(2,'0')}-01`;
  const endDate = new Date(year, month, 0);
  const end = `${year}-${String(month).padStart(2,'0')}-${endDate.getDate()}`;
  const userId = req.user.userId;
  try{
    const [rows] = await db.execute(`SELECT check_date FROM user_checkin_record WHERE user_id=? AND check_date BETWEEN ? AND ?`,[userId,start,end]);
    const list = rows.map(r=>r.check_date);
    res.json({code:200,data:list});
  }catch(e){
    console.error(e);
    res.json({code:500,msg:"查询失败"});
  }
})
module.exports = router;

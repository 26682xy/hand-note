const express = require('express');
const router = express.Router();
const db = require('../db/db');

// token简单校验中间件（和userRoute保持一致逻辑）
function authCheck(req,res,next){
  const token = req.headers.token;
  if(!token){
    return res.json({code:401,msg:"未登录"});
  }
  // token这里直接存userId，前端userStore.token存userId（简单方案，项目小不用jwt）
  req.userId = Number(token);
  if(!req.userId){
    return res.json({code:401,msg:"登录失效"});
  }
  next();
}

/**
 * @POST /api/checkin/do
 * 打卡（支持补打历史日期） body:{checkDate:"2026‑09‑20"}
 */
router.post("/do",authCheck,async (req,res)=>{
  const {checkDate} = req.body;
  if(!checkDate) return res.json({code:400,msg:"缺少checkDate"});
  try{
    await db.query(`INSERT IGNORE INTO user_checkin_record(user_id,check_date) VALUES (?,?)`,[req.userId,checkDate]);
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
router.post("/cancel",authCheck,async (req,res)=>{
  const {checkDate} = req.body;
  if(!checkDate) return res.json({code:400,msg:"缺少checkDate"});
  try{
    await db.query(`DELETE FROM user_checkin_record WHERE user_id=? AND check_date=?`,[req.userId,checkDate]);
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
router.get("/month",authCheck,async (req,res)=>{
  const {year,month} = req.query;
  if(!year||!month) return res.json({code:400,msg:"参数缺失"});
  const start = `${year}-${String(month).padStart(2,'0')}-01`;
  const endDate = new Date(year, month, 0);
  const end = `${year}-${String(month).padStart(2,'0')}-${endDate.getDate()}`;
  try{
    const [rows] = await db.query(`SELECT check_date FROM user_checkin_record WHERE user_id=? AND check_date BETWEEN ? AND ?`,[req.userId,start,end]);
    const list = rows.map(r=>r.check_date);
    res.json({code:200,data:list});
  }catch(e){
    console.error(e);
    res.json({code:500,msg:"查询失败"});
  }
})

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// ========== 环境变量启动校验（防止忘记配置.env） ==========
const requiredEnv = ['JWT_SECRET','DB_HOST','DB_USER','DB_NAME'];
for(const key of requiredEnv){
  if(!process.env[key]){
    console.error(`[启动失败] 缺失环境变量 ${key}，请检查 .env 文件`);
    process.exit(1);
  }
}

// 开发环境全开cors；生产改为指定域名
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://你的域名.com"] 
    : true,
  credentials:true
}));

app.use(express.json());
app.use("/",express.static(path.resolve(__dirname,"public")));

// 业务路由
const userRoute = require('./routes/userRoute');
const noteRoute = require('./routes/notebookRoute');
const upRoute = require('./routes/uploadRoute');
const checkinRoute = require('./routes/checkinRoute');

app.use("/api/user",userRoute);
app.use("/api/notebook",noteRoute);
app.use("/api/upload",upRoute);
app.use("/api/checkin",checkinRoute);

// ========= 全局异常捕获，放在所有路由之后 =========
app.use((err, req, res, next)=>{
  console.error("服务异常：",err);
  res.status(500).json({code:500,msg:"服务器内部错误"});
})

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
  console.log("server running at http://127.0.0.1:"+PORT);
});

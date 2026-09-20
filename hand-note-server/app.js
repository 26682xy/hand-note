require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use("/",express.static(path.resolve(__dirname,"public")));

const userRoute = require('./routes/userRoute');
const noteRoute = require('./routes/notebookRoute');
const upRoute = require('./routes/uploadRoute');

app.use("/api/user",userRoute);
app.use("/api/notebook",noteRoute);
app.use("/api/upload",upRoute);

// 删除手账
app.delete('/api/notebook/:id', async (req,res)=>{
    try{
      const nid = req.params.id;
      await db.query("DELETE FROM notebook WHERE id = ?",[nid]);
      res.json({code:200,msg:"删除成功"})
    }catch(err){
      res.json({code:500,msg:"删除失败"})
    }
  })
  

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
  console.log("server running at http://127.0.0.1:"+PORT);
});

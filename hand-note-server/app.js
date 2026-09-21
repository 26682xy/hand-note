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
  

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>{
  console.log("server running at http://127.0.0.1:"+PORT);
});

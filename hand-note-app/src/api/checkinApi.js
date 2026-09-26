import axios from "axios";
// 和其他api保持同样baseURL与拦截器
const api = axios.create({baseURL:"/api"});
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem("token");
  if(t) cfg.headers.token = t;
  return cfg;
})

export async function reqDoCheckin(checkDate){
  const res = await api.post("/checkin/do", { checkDate });
  return res.data;
}

export async function reqCancelCheckin(checkDate){
  const res = await api.post("/checkin/cancel", { checkDate });
  return res.data;
}

export async function reqGetMonthCheckin(year,month){
  const res = await api.get("/checkin/month", { params:{ year, month } });
  return res.data;
}

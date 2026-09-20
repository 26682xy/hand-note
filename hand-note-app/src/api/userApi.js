import axios from "axios";
const api = axios.create({baseURL:"/api"});
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem("token");
  if(t) cfg.headers.token = t;
  return cfg;
})
export async function reqLogin(data){
  return await api.post("/user/login",data);
}
export async function reqRegister(data){
  return await api.post("/user/register",data);
}

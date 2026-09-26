import axios from "axios";
import router from "@/router";

const api = axios.create({baseURL:"/api"});
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem("token");
  if(t) cfg.headers.token = t;
  return cfg;
})

// =========解决问题2：统一拦截401未登录/token过期，跳登录页=========
api.interceptors.response.use(
  resp=>{
    return resp;
  },
  async error=>{
    const resp = error.response;
    if(resp && resp.data && resp.data.code ===401){
      //清除本地token，跳转登录
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      await router.push("/login");
    }
    return Promise.reject(error);
  }
)

export async function reqSaveNotebook(payload){
  return api.post("/notebook/save",payload);
}
export async function reqNotebookList(){
  return api.get("/notebook/list");
}
export async function reqNotebookDetail(id){
  return api.get(`/notebook/detail/${id}`);
}
export async function reqUploadSticker(formData){
  return api.post("/upload/sticker",formData);
}
export async function reqMyStickerList(){
  return api.get("/upload/mystickers");
}
// 删除手账【修复】使用带拦截器的api实例，自动携带token
export async function reqDeleteNotebook(notebookId){
  return await api({
    method:"DELETE",
    url:"/notebook/" + notebookId
  })
}

//============新增首页画布接口============
export async function reqSaveHomeCanvas(canvasList){
  return api.post("/notebook/save-home-canvas",{canvasList})
}
export async function reqGetHomeCanvas(){
  return api.get("/notebook/get-home-canvas")
}

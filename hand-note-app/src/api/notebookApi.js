import axios from "axios";
const api = axios.create({baseURL:"/api"});
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem("token");
  if(t) cfg.headers.token = t;
  return cfg;
})
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

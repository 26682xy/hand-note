import {defineStore} from "pinia";
import {reqGetHomeCanvas, reqSaveHomeCanvas} from "@/api/notebookApi";
import {useUserStore} from "./user";
const GRID =32;
const STORAGE_KEY = "handnote_home_temp_canvas";
export const useHomeTempCanvasStore = defineStore("homeTempCanvas",{
  state:()=>({
    curTmpCanvasId:null,
    tmpCanvasList:[],
    loading:false //标记是否正在从后端加载
  }),
  actions:{
    //从localStorage加载临时画布
    loadLocalStorage(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw){
          const arr = JSON.parse(raw);
          if(Array.isArray(arr) && arr.length>0){
            this.tmpCanvasList = arr;
            // ✅修复：读取本地画布后，如果没有选中id，自动选中第一个画布
            if(!this.curTmpCanvasId){
              this.curTmpCanvasId = this.tmpCanvasList[0].id;
            }
          }
        }
      }catch(e){
        console.warn("读取本地临时画布失败",e);
      }
    },
    saveLocalStorage(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tmpCanvasList));
    },

    //【新增】登录后，把本地localStorage的画布同步上传数据库
    async syncLocalToServer(){
      const userStore = useUserStore();
      if(!userStore.token || this.tmpCanvasList.length===0) return;
      try{
        await reqSaveHomeCanvas(this.tmpCanvasList);
      }catch(err){
        console.warn("同步本地画布到服务端失败(网络?)",err);
      }
    },

    //【新增】优先拉取后端数据库首页画布；没有登录降级localStorage
    async loadFromServerOrLocal(){
      const userStore = useUserStore();
      this.loading = true;
      try{
        if(userStore.token){
          //已登录，请求后端
          const res = await reqGetHomeCanvas();
          if(res.data.code===200 && res.data.data){
            //后端有数据，使用服务端数据
            this.tmpCanvasList = res.data.data;
            if(this.tmpCanvasList.length>0 && !this.curTmpCanvasId){
              this.curTmpCanvasId = this.tmpCanvasList[0].id;
            }
          }else{
            //后端无记录，读取本地，并同步上传服务端
            this.loadLocalStorage();
            await this.syncLocalToServer();
          }
        }else{
          //未登录只用本地
          this.loadLocalStorage();
        }
      }catch(err){
        console.warn("拉取首页服务端画布失败，降级localStorage",err);
        this.loadLocalStorage();
      }finally{
        this.loading = false;
      }
    },

    removeTempCanvas(removeId){
      const idx = this.tmpCanvasList.findIndex(x=>x.id===removeId);
      if(idx===-1) return;
      this.tmpCanvasList.splice(idx,1);
      // ✅修复：删除当前激活tab，做数组判空，防止数组为空时报错
      if(this.curTmpCanvasId === removeId){
        if(this.tmpCanvasList.length > 0){
          this.curTmpCanvasId = this.tmpCanvasList[0].id;
        }else{
          this.curTmpCanvasId = null;
        }
      }
      this.persistSave();
    },

    async initIfEmpty(){
      //优先从后端加载
      await this.loadFromServerOrLocal();

      if(this.tmpCanvasList.length===0){
        const id = "tmp_"+Date.now();
        this.tmpCanvasList.push({
          id,
          title:"临时画布1",
          height:window.innerHeight,
          items:[]
        })
        this.curTmpCanvasId = id;
        await this.persistSave();
      }
    },

    getCurrent(){
      return this.tmpCanvasList.find(c=>c.id===this.curTmpCanvasId);
    },
    newTempCanvas(){
      const newId = "tmp_"+Date.now();
      this.tmpCanvasList.push({
        id:newId,
        title:`临时画布${this.tmpCanvasList.length+1}`,
        height:window.innerHeight,
        items:[]
      })
      this.curTmpCanvasId = newId;
      this.persistSave();
    },

    // =========解决问题3：persistSave登录状态同时保存后端+本地=========
    async persistSave(){
      //永远写本地存储（离线兜底）
      this.saveLocalStorage();
      const userStore = useUserStore();
      //登录则调用后端接口保存首页画布
      if(userStore.token){
        try{
          await reqSaveHomeCanvas(this.tmpCanvasList);
        }catch(err){
          console.warn("保存首页画布到服务端失败，已保存在本地",err);
        }
      }
    },

    //【新增】登出调用：清空首页画布
    clearCanvasStore(){
      this.tmpCanvasList = [];
      this.curTmpCanvasId = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  }
})

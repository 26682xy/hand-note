import {defineStore} from "pinia";
const GRID =32;
const STORAGE_KEY = "handnote_home_temp_canvas";

export const useHomeTempCanvasStore = defineStore("homeTempCanvas",{
  state:()=>({
    curTmpCanvasId:null,
    tmpCanvasList:[]
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
          }
        }
      }catch(e){
        console.warn("读取本地临时画布失败",e);
      }
    },
    saveLocalStorage(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tmpCanvasList));
    },
    initIfEmpty(){
      this.loadLocalStorage();
      if(this.tmpCanvasList.length===0){
        const id = "tmp_"+Date.now();
        this.tmpCanvasList.push({
          id,
          title:"临时画布1",
          height:window.innerHeight,
          items:[]
        })
        this.curTmpCanvasId = id;
        this.saveLocalStorage();
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
      this.saveLocalStorage();
    },
    // 更新画布之后调用保存本地（HomePage页面每次修改元素后执行saveLocalStorage）
    persistSave(){
      this.saveLocalStorage();
    }
  }
})

import {defineStore} from "pinia";
const GRID =32;
export const useHomeTempCanvasStore = defineStore("homeTempCanvas",{
  state:()=>({
    curTmpCanvasId:null,
    tmpCanvasList:[]
  }),
  actions:{
    initIfEmpty(){
      if(this.tmpCanvasList.length===0){
        const id = "tmp_"+Date.now();
        this.tmpCanvasList.push({
          id,
          title:"临时画布1",
          height:window.innerHeight,
          items:[]
        })
        this.curTmpCanvasId = id;
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
    }
  }
})

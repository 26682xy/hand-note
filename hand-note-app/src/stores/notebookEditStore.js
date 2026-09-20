import {defineStore} from "pinia";
export const useNotebookEditStore = defineStore("notebookEdit",{
  state:()=>({
    notebookId:null,
    title:"",
    canvasHeight:window.innerHeight,
    items:[],
    isEditMode:false
  }),
  actions:{
    loadData(record){
      this.notebookId = record.id;
      this.title = record.title;
      this.canvasHeight = record.canvas_height;
      this.items = JSON.parse(JSON.stringify(record.canvas_items));
    },
    reset(){
      this.notebookId=null;
      this.title="";
      this.canvasHeight=window.innerHeight;
      this.items=[];
      this.isEditMode=false;
    }
  }
})

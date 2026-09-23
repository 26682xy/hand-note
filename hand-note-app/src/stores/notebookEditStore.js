import {defineStore} from "pinia";
export const useNotebookEditStore = defineStore("notebookEdit",{
  state:()=>({
    notebookId:null,
    title:"",
    canvasHeight:window.innerHeight,
    items:[],
    isEditMode:false,
    // 手账所属日期，用于打卡组件UI渲染
    noteDate: null
  }),
  actions:{
    loadData(record){
      this.notebookId = record.id;
      this.title = record.title;
      this.canvasHeight = record.canvas_height;
      this.items = JSON.parse(JSON.stringify(record.canvas_items));
      // 赋值手账日期
      this.noteDate = record.note_date;
      this.isEditMode = false;
    },
    reset(){
      this.notebookId=null;
      this.title="";
      this.canvasHeight=window.innerHeight;
      this.items=[];
      this.isEditMode=false;
      this.noteDate = null;
    }
  }
})

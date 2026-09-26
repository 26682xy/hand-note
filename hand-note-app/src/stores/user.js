import {defineStore} from "pinia";
import {reqGetMonthCheckin} from "@/api/checkinApi";
import {useHomeTempCanvasStore} from "./homeTempCanvas";

export const useUserStore = defineStore("user",{
  state:()=>({
    username:"",
    token:"",
    userId:null,
    // 全局打卡缓存 key:"2026‑09" →数组["2026‑09‑01","2026‑09‑05"]
    monthCheckinCache:{}
  }),
  actions:{
    setUser(info){
      this.username = info.username;
      this.token = info.token;
      this.userId = info.userId;
      localStorage.setItem("token",info.token);
      localStorage.setItem("username",info.username);
    },
    loadFromLocal(){
      this.username = localStorage.getItem("username")||"";
      this.token = localStorage.getItem("token")||"";
    },
    logout(){
      this.username="";
      this.token="";
      this.userId=null;
      this.monthCheckinCache = {};
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      //登出同时清空首页临时画布
      const canvasStore = useHomeTempCanvasStore();
      canvasStore.clearCanvasStore();
    },
    // 获取某月打卡，存入缓存
    async fetchMonthCheckin(year,month){
      const key = `${year}-${String(month).padStart(2,"0")}`;
      const res = await reqGetMonthCheckin(year,month);
      if(res.code===200){
        this.monthCheckinCache[key] = res.data;
      }
      return res;
    },
    // 从缓存判断某天是否打卡
    isDateChecked(year,month,day){
      const key = `${year}-${String(month).padStart(2,"0")}`;
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const arr = this.monthCheckinCache[key] || [];
      return arr.includes(dateStr);
    },
    // 缓存手动新增一条打卡
    cacheAddCheckin(checkDate){
      const [y,m] = checkDate.split("-");
      const key = `${y}-${m}`;
      if(!this.monthCheckinCache[key]) this.monthCheckinCache[key]=[];
      if(!this.monthCheckinCache[key].includes(checkDate)){
        this.monthCheckinCache[key].push(checkDate);
      }
    },
    // 缓存删除一条打卡
    cacheRemoveCheckin(checkDate){
      const [y,m] = checkDate.split("-");
      const key = `${y}-${m}`;
      if(!this.monthCheckinCache[key]) return;
      this.monthCheckinCache[key] = this.monthCheckinCache[key].filter(d=>d!==checkDate);
    }
  }
})

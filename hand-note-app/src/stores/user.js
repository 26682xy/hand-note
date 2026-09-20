import {defineStore} from "pinia";
export const useUserStore = defineStore("user",{
  state:()=>({
    username:"",
    token:"",
    userId:null
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
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
  }
})

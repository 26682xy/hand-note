<template>
    <div class="login-page">
      <div class="box">
        <h2>{{isRegister ? "注册账号":"用户登录"}}</h2>
        <input v-model="form.username" placeholder="用户名"/>
        <input v-model="form.password" type="password" placeholder="密码"/>
        <button @click="submit">{{isRegister?"提交注册":"登录"}}</button>
        <div class="switch-text" @click="isRegister=!isRegister">
          {{isRegister ? "已有账号？去登录":"没有账号？去注册"}}
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import {ref} from "vue";
  import {useRouter} from "vue-router";
  import {reqLogin,reqRegister} from "@/api/userApi";
  import {useUserStore} from "@/stores/user";
  
  const router = useRouter();
  const userStore = useUserStore();
  const isRegister = ref(false);
  const form = ref({username:"",password:""});
  
  async function submit(){
    if(isRegister.value){
      await reqRegister(form.value);
      alert("注册成功，请登录");
      isRegister.value=false;
    }else{
      const res = await reqLogin(form.value);
      if(res.data.code===200){
        userStore.setUser(res.data.data);
        router.push("/home");
      }else{
        alert(res.data.msg);
      }
    }
  }
  </script>
  <style scoped>
  .login-page{
    height:100vh;
    background:#f7f5f2;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .box{
    width:320px;
    background:#fff;
    padding:24px;
    border-radius:10px;
  }
  h2{text-align:center;margin-bottom:20px;}
  input{
    width:100%;
    box-sizing:border-box;
    margin-bottom:12px;
    padding:10px;
    border:1px solid #ccc;
    border-radius:6px;
  }
  button{
    width:100%;
    padding:10px;
    background:#5577dd;
    color:#fff;
    border:none;
    border-radius:6px;
  }
  .switch-text{
    margin-top:14px;
    text-align:center;
    color:#5577dd;
    cursor:pointer;
  }
  </style>
  
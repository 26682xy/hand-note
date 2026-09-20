<template>
    <div class="user-header">
      <span>{{username}}</span>
      <button @click="handleLogout">退出登录</button>
    </div>
  </template>
  <script setup>
  import {useUserStore} from "@/stores/user";
  import {useRouter} from "vue-router";
  const userStore = useUserStore();
  const router = useRouter();
  const username = userStore.username;
  function handleLogout(){
    userStore.logout();
    router.push("/login");
  }
  </script>
  <style scoped>
  .user-header{
    height:44px;
    background:#fff;
    display:flex;
    justify-content:flex-end;
    align-items:center;
    gap:16px;
    padding:0 16px;
    border-bottom:1px solid #ddd;
  }
  button{
    border:none;
    background:#dd6666;
    color:#fff;
    border-radius:6px;
    padding:4px 10px;
  }
  </style>
  
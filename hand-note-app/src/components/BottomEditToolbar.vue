<template>
    <div class="toolbar">
      <div class="tool-btn" @click="$emit('add-checkin')">打卡</div>
      <div class="tool-btn" @click="$emit('add-textbox')">文字框</div>
      <div class="tool-btn" @click="$emit('open-sticker-upload')">上传贴纸</div>
      <div class="tool-btn ok" @click="$emit('finish-edit')">✓完成</div>
    </div>
  </template>
  <script setup>
  </script>
  <style scoped>
  .toolbar{
    height:70px;
    background:#fff;
    border-top:1px solid #ddd;
    display:flex;
    align-items:center;
    justify-content:space-evenly;
  }
  .tool-btn{
    padding:8px 12px;
    background:#ececec;
    border-radius:8px;
    font-size:14px;
    cursor:pointer;
  }
  .tool-btn.ok{
    background:#38b069;
    color:#fff;
  }
  </style>
  
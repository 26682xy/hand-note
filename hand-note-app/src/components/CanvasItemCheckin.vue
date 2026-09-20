<template>
    <div class="checkin-item">
      <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
      <div
        class="check-circle"
        :style="{backgroundColor: item.done ? item.checkColor : '#bbbbbb'}"
        @click.stop="onCircleClick"
      ></div>
      <div class="check-name">{{ item.checkName }}</div>
    </div>
  </template>
  <script setup>
  const props = defineProps({
    item: Object,
    editMode: Boolean
  })
  const emit = defineEmits(["delete","clickCheck"])
  function onCircleClick(){
    emit("clickCheck")
  }
  </script>
  <style scoped>
  .checkin-item{
    position:absolute;
    width:72px;
    text-align:center;
  }
  .item-del{
    position:absolute;
    top:-10px;
    left:-10px;
    width:22px;height:22px;
    background:#dd4444;
    color:#fff;
    border-radius:50%;
    line-height:22px;
    font-size:14px;
    z-index:99;
    cursor:pointer;
  }
  .check-circle{
    width:48px;height:48px;
    border-radius:50%;
    margin:0 auto 4px;
    border:2px solid #999;
  }
  .check-name{
    font-size:12px;
    color:#333;
    word-break:break-all;
  }
  </style>
  
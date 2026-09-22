<template>
    <div class="sticker-item" :style="{width:60+'px',height:60+'px'}">
      <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
      <img v-if="item.imgUrl" :src="API_BASE + item.imgUrl" alt="" />
      <span v-else>⭐</span>
    </div>
  </template>
  <script setup>
  const props = defineProps({
    item: Object,
    editMode: Boolean
  })
  const emit = defineEmits(["delete"])
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  </script>
  <style scoped>
  .sticker-item{
    position:absolute;
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
  img{
    width:100%;
    height:100%;
    object-fit:contain;
  }
  </style>
  
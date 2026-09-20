<template>
    <div class="tab-wrap">
      <div v-for="c in list" :key="c.id"
        class="tab-item"
        :class="{active:activeId===c.id}"
      >
        <span @click="$emit('switch',c.id)">{{c.title}}</span>
        <span v-if="list.length>1" class="tab-close" @click.stop="onTabClose(c.id)">×</span>
      </div>
      <button class="add-tab-btn" @click="$emit('add')">+新建</button>
    </div>
    </template>
    <script setup>
    const props = defineProps({
      list:Array,
      activeId:String
    })
    const emit = defineEmits(["switch","add","closeTab"])
    function onTabClose(id){
      emit("closeTab",id)
    }
    </script>
    <style scoped>
    .tab-wrap{
      display:flex;
      gap:6px;
      background:#fff;
      padding:8px;
      overflow-x:auto;
    }
    .tab-item{
      display:flex;
      gap:6px;
      align-items:center;
      padding:4px 10px;
      border-radius:6px;
      background:#efefef;
      white-space:nowrap;
    }
    .tab-item.active{
      background:#5577dd;
      color:#fff;
    }
    .tab-close{
      font-size:16px;
      cursor:pointer;
      padding:0 3px;
    }
    .add-tab-btn{
      white-space:nowrap;
      border:none;
      background:#eee;
      border-radius:6px;
      padding:4px 10px;
    }
    </style>
    
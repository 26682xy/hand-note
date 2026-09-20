<template>
  <div class="textbox-item" :style="{width:item.w+'px',height:item.h+'px'}">
    <div class="item-del" v-if="item.editing" @click.stop="$emit('delete')">×</div>
    <div
      ref="textRef"
      class="text-content"
      :contenteditable="item.editing"
      @input="handleInput"
      @blur="handleBlur"
      @dblclick.stop="$emit('dblclick-item', item.uid)"
    >{{item.innerText}}</div>
    <div v-if="item.editing" class="resize-handle"></div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'
const textRef = ref(null)

const props = defineProps({
  item: Object,
})
const emit = defineEmits(["delete","updateText","dblclick-item","blur-edit"])

function handleInput(e){
  emit("updateText", props.item.uid, e.target.innerText)
}

function handleBlur(){
  emit("blur-edit", props.item.uid)
}

// 开启编辑时自动聚焦光标
watch(()=>props.item.editing, (val)=>{
  if(val){
    nextTick(()=>{
      textRef.value?.focus()
    })
  }
})
</script>
<style scoped>
.textbox-item{
  position:absolute;
  border:1px solid #aaa;
  background:#ffffffdd;
  padding:6px;
  min-width:80px;
  min-height:40px;
  overflow:hidden;
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
.text-content{
  width:100%;
  height:100%;
  outline:none;
}
.resize-handle{
  position:absolute;
  right:0;
  bottom:0;
  width:14px;height:14px;
  background:#888;
  cursor:nwse-resize;
}
</style>

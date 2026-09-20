<template>
  <div class="textbox-item" :style="{width:item.w+'px',height:item.h+'px'}">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
    <div
      ref="textRef"
      class="text-content"
      :contenteditable="!!item.editing"
      @input="handleInput"
      @blur="handleBlur"
      @dblclick.stop="$emit('dblClickText')"
    >{{item.innerText}}</div>
    <div
      v-if="editMode"
      class="resize-handle"
      @mousedown="startMouseResize($event)"
      @touchstart="startTouchResize($event)"
    ></div>
  </div>
</template>
<script setup>
import {ref,onMounted,onUnmounted,watch} from "vue";
const props = defineProps({
  item: Object,
  editMode: Boolean
})
const emit = defineEmits(["delete","updateText","resizeTextbox","dblClickText","blurTextbox"])

const textRef = ref(null)

// 进入编辑模式自动聚焦
watch(()=>props.item.editing, (val)=>{
  if(val){
    textRef.value?.focus()
  }
})

let isResizing = false;
let startW = 0;
let startH = 0;
let startClientX = 0;
let startClientY = 0;

function onMouseMove(e){
  if(!isResizing) return;
  const dw = e.clientX - startClientX;
  const dh = e.clientY - startClientY;
  const newW = Math.max(80, startW + dw);
  const newH = Math.max(40, startH + dh);
  emit("resizeTextbox",props.item.uid, newW, newH);
}

function onMouseUp(){
  isResizing = false;
  document.removeEventListener("mousemove",onMouseMove);
  document.removeEventListener("mouseup",onMouseUp);
  document.removeEventListener("touchmove",onTouchMove);
  document.removeEventListener("touchend",onTouchEnd);
}

function onTouchMove(e){
  if(!isResizing) return;
  e.preventDefault();
  const touch = e.touches[0];
  const dw = touch.clientX - startClientX;
  const dh = touch.clientY - startClientY;
  const newW = Math.max(80, startW + dw);
  const newH = Math.max(40, startH + dh);
  emit("resizeTextbox",props.item.uid, newW, newH);
}

function onTouchEnd(){
  isResizing = false;
}

function startMouseResize(evt){
  evt.stopPropagation();
  evt.preventDefault();
  isResizing=true;
  startW = props.item.w;
  startH = props.item.h;
  startClientX = evt.clientX;
  startClientY = evt.clientY;
  document.addEventListener("mousemove",onMouseMove);
  document.addEventListener("mouseup",onMouseUp);
}

function startTouchResize(evt){
  evt.stopPropagation();
  evt.preventDefault();
  isResizing=true;
  const t = evt.touches[0];
  startW = props.item.w;
  startH = props.item.h;
  startClientX = t.clientX;
  startClientY = t.clientY;
  document.addEventListener("touchmove",onTouchMove,{passive:false});
  document.addEventListener("touchend",onTouchEnd);
}

function handleInput(e){
  emit("updateText", props.item.uid, e.target.innerText)
}

function handleBlur(){
  emit("blurTextbox", props.item.uid)
}

onUnmounted(()=>{
  onMouseUp();
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
  width:20px;height:20px;
  background:#888;
  cursor:nwse-resize;
}
</style>

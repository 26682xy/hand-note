<template>
  <div class="textbox-item" :style="{width:item.w+'px',height:item.h+'px'}">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
    <div
      ref="textRef"
      class="text-content"
      :contenteditable="!!item.editing"
      @input="handleInput"
      @compositionend="handleInput"
      @blur="handleBlur"
      @dblclick.stop="$emit('dblClickText')"
      @touchstart.stop="onTextTouchStart"
      @touchmove.stop="onTextTouchMove"
      @touchend.stop="onTextTouchEnd"
      @touchcancel.stop="onTextTouchEnd"
    ></div>
    <div
      v-if="editMode"
      class="resize-handle"
      @mousedown="startMouseResize($event)"
      @touchstart="startTouchResize($event)"
    ></div>
  </div>
</template>
<script setup>
import {ref,onUnmounted,watch, nextTick, watchEffect} from "vue";
const props = defineProps({
  item: Object,
  editMode: Boolean
})
const emit = defineEmits(["delete","updateText","resizeTextbox","dblClickText","longPressText","blurTextbox"])
const textRef = ref(null)
function setCursorToEnd(el) {
  if (!el) return
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

// 修复：组件初始化 + item.innerText变更都会把文字同步到DOM，解决初次渲染空白
watchEffect(async ()=>{
  await nextTick()
  if(textRef.value && !props.item.editing){
    textRef.value.textContent = props.item.innerText ?? ""
  }
})

// 编辑状态切换
watch(()=>props.item.editing, async (val)=>{
  if(val){
    await nextTick()
    if(textRef.value){
      textRef.value.textContent = props.item.innerText ?? ""
      textRef.value.focus()
      setCursorToEnd(textRef.value)
    }
  }else{
    await nextTick()
    if(textRef.value){
      textRef.value.textContent = props.item.innerText ?? ""
    }
  }
})

// PC双击；移动端长按触发编辑
let longPressTimer = null;
let touchStartX = 0;
let touchStartY = 0;
const LONG_PRESS_DELAY = 600; // 长按600ms触发编辑
const MOVE_THRESHOLD = 10; //移动超过10px判定拖拽，取消长按
function clearLongPressTimer(){
  if(longPressTimer){
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}
function onTextTouchStart(e){
  clearLongPressTimer();
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  // 只有非编辑状态才开启长按计时器
  if(!props.item.editing){
    longPressTimer = setTimeout(()=>{
      emit("longPressText");
    }, LONG_PRESS_DELAY);
  }
}
function onTextTouchMove(e){
  const t = e.touches[0];
  const dx = Math.abs(t.clientX - touchStartX);
  const dy = Math.abs(t.clientY - touchStartY);
  //手指移动超过阈值，取消长按，交给父组件拖拽
  if(dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD){
    clearLongPressTimer();
  }
}
function onTextTouchEnd(){
  clearLongPressTimer();
}
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
  console.log('[handleInput] 输入触发，新文本：', e.target.textContent, '当前item.uid:', props.item.uid)
  emit("updateText", props.item.uid, e.target.textContent)
}
function handleBlur(){
  console.log('[handleBlur] 失去焦点，item.innerText=', props.item.innerText, 'uid=', props.item.uid)
  emit("blurTextbox", props.item.uid)
}
onUnmounted(()=>{
  clearLongPressTimer();
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
  /*禁止系统长按弹出复制菜单*/
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
/*编辑模式允许选中文本*/
.text-content[contenteditable="true"]{
  -webkit-user-select:text;
  user-select:text;
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

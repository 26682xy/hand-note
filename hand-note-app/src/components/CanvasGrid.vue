<template>
  <div class="canvas-wrap" ref="wrapRef">
    <div
      class="canvas"
      ref="canvasRef"
      :style="{height:canvasHeight+'px'}"
    >
      <template v-for="it in itemList" :key="it.uid">
        <div
          class="canvas-item-wrap"
          :style="{left:it.x+'px',top:it.y+'px'}"
          @mousedown="startDrag($event,it)"
          @touchstart="startTouchDrag($event,it)"
        >
          <CanvasItemCheckin
            v-if="it.type==='checkin'"
            :item="it"
            :editMode="editMode"
            @delete="$emit('deleteItem',it.uid)"
            @clickCheck="$emit('clickCheckin',it.uid)"
          />
          <CanvasItemTextbox
            v-if="it.type==='textbox'"
            :item="it"
            :editMode="editMode"
            @delete="$emit('deleteItem',it.uid)"
            @updateText="(...args) => { $emit('updateTextBoxText', ...args) }"
            @resizeTextbox="$emit('resizeTextbox', $event)"
            @dblClickText="handleDblClickTextItem(it.uid)"
            @longPressText="handleDblClickTextItem(it.uid)"
            @blurTextbox="handleBlurEditItem(it.uid)"
          />
          <CanvasItemSticker
            v-if="it.type==='sticker'"
            :item="it"
            :editMode="editMode"
            @delete="$emit('deleteItem',it.uid)"
          />
        </div>
      </template>
    </div>
    <div class="height-control" v-if="editMode">
      <button @click="$emit('addCanvasHeight')">+高度</button>
      <button @click="$emit('subCanvasHeight')">-高度</button>
    </div>
  </div>
</template>
<script setup>
import {ref} from "vue";
import CanvasItemCheckin from "./CanvasItemCheckin.vue";
import CanvasItemTextbox from "./CanvasItemTextbox.vue";
import CanvasItemSticker from "./CanvasItemSticker.vue";
const props = defineProps({
  itemList:{type:Array,default:()=>[]},
  canvasHeight:{type:Number,default:600},
  editMode:{type:Boolean,default:false}
})
const emit = defineEmits([
  "deleteItem","clickCheckin","updateTextBoxText",
  "addCanvasHeight","subCanvasHeight","itemMove","resizeTextbox"
])

const wrapRef = ref(null);
const canvasRef = ref(null);
const GRID = 32;
let dragItem = null;
let offsetX=0,offsetY=0;

function getCanvasOffset(){
  const rect = canvasRef.value.getBoundingClientRect();
  return rect;
}

// 双击文字框开启编辑
function handleDblClickTextItem(uid){
  // 关闭全部文本编辑状态
  props.itemList.forEach(it=>{
    if(it.type === "textbox"){
      it.editing = false
    }
  })
  const target = props.itemList.find(i=>i.uid === uid)
  if(target){
    target.editing = true
  }
}

// 文字框失去焦点关闭编辑
function handleBlurEditItem(uid){
  const target = props.itemList.find(i=>i.uid === uid)
  console.log('[handleBlurEditItem] 关闭编辑，uid=', uid, 'target.innerText=', target?.innerText)
  if(target){
    target.editing = false
  }
}

//鼠标拖拽
function startDrag(evt,item){
  if(!props.editMode) return;
  // 如果文字框正在编辑，禁止拖拽
  if(item.type === "textbox" && item.editing){
    return
  }
  evt.preventDefault();
  dragItem = item;
  const rect = evt.target.getBoundingClientRect();
  offsetX = evt.clientX - rect.left;
  offsetY = evt.clientY - rect.top;
  document.addEventListener("mousemove",onMouseMove);
  document.addEventListener("mouseup",stopDrag);
}

function onMouseMove(e){
  if(!dragItem) return;
  const crect = getCanvasOffset();
  let mx = e.clientX - crect.left - offsetX;
  let my = e.clientY - crect.top - offsetY;
  dragItem.x = Math.round(mx / GRID)*GRID;
  dragItem.y = Math.round(my / GRID)*GRID;
  emit("itemMove",dragItem);
}

//移动端触摸拖拽
function startTouchDrag(evt,item){
  if(!props.editMode) return;
  // 如果文字框正在编辑，禁止拖拽
  if(item.type === "textbox" && item.editing){
    return
  }
  evt.preventDefault();
  dragItem = item;
  const touch = evt.touches[0];
  const rect = evt.target.getBoundingClientRect();
  offsetX = touch.clientX - rect.left;
  offsetY = touch.clientY - rect.top;
  document.addEventListener("touchmove",onTouchMove,{passive:false});
  document.addEventListener("touchend",stopDrag);
}

function onTouchMove(evt){
  if(!dragItem) return;
  evt.preventDefault();
  const touch = evt.touches[0];
  const crect = getCanvasOffset();
  let mx = touch.clientX - crect.left - offsetX;
  let my = touch.clientY - crect.top - offsetY;
  dragItem.x = Math.round(mx / GRID)*GRID;
  dragItem.y = Math.round(my / GRID)*GRID;
  emit("itemMove",dragItem);
}

function stopDrag(){
  dragItem=null;
  document.removeEventListener("mousemove",onMouseMove);
  document.removeEventListener("mouseup",stopDrag);
  document.removeEventListener("touchmove",onTouchMove);
  document.removeEventListener("touchend",stopDrag);
}
</script>
<style scoped>
.canvas-wrap{
  width:100%;
  height:100%;
  overflow:auto;
  position:relative;
}
.canvas{
  position:relative;
  background-image:
    linear-gradient(#e9e7e2 1px, transparent 1px),
    linear-gradient(90deg,#e9e7e2 1px, transparent 1px);
  background-size:32px 32px;
}
.canvas-item-wrap{
  position:absolute;
}
.height-control{
  position:absolute;
  right:12px;
  bottom:12px;
  display:flex;
  gap:8px;
  z-index:90;
}
button{
  padding:6px 10px;
  border:none;
  border-radius:6px;
  background:#5577dd;
  color:#fff;
}
</style>

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
            :render-date="canvasRenderDate"
            @delete="$emit('deleteItem',it.uid)"
            @clickCheck="$emit('clickCheckin',it.uid)"
          />
          <!-- ✅增加 prop month-check-dates -->
          <CanvasItemMonthStat
            v-if="it.type==='monthStat'"
            :item="it"
            :editMode="editMode"
            :month-check-dates="getMonthCheckArr(it.statYear, it.statMonth)"
            @delete="$emit('deleteItem',it.uid)"
            @updateYm="handleUpdateMonthStatYm"
          />
          <CanvasItemTextbox
            v-if="it.type==='textbox'"
            :item="it"
            :editMode="editMode"
            @delete="$emit('deleteItem',it.uid)"
            @updateText="(...args) => { $emit('updateTextBoxText', ...args) }"
            @resizeTextbox="(...args) => { console.log('resizeTextbox 收到参数', args);$emit('resizeTextbox', ...args) }"
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
import {ref, watch} from "vue";
import CanvasItemCheckin from "./CanvasItemCheckin.vue";
import CanvasItemMonthStat from "./CanvasItemMonthStat.vue";
import CanvasItemTextbox from "./CanvasItemTextbox.vue";
import CanvasItemSticker from "./CanvasItemSticker.vue";
import {useUserStore} from "@/stores/user";

const props = defineProps({
  itemList:{type:Array,default:()=>[]},
  canvasHeight:{type:Number,default:600},
  editMode:{type:Boolean,default:false},
  canvasRenderDate:{
    type:String,
    default:undefined
  }
})
const emit = defineEmits([
  "deleteItem","clickCheckin","updateTextBoxText",
  "addCanvasHeight","subCanvasHeight","itemMove","resizeTextbox",
  "updateYm"
])
const userStore = useUserStore();

const wrapRef = ref(null);
const canvasRef = ref(null);
const GRID = 32;
let dragItem = null;
let offsetX=0,offsetY=0;

// 根据年月从pinia缓存拿到打卡日期数组
function getMonthCheckArr(y,m){
  if(!y||!m) return [];
  const key = `${y}-${String(m).padStart(2,"0")}`;
  return userStore.monthCheckinCache[key] || [];
}

// 接收子组件年月变更
function handleUpdateMonthStatYm(uid, year, month){
  const target = props.itemList.find(i=>i.uid === uid);
  if(target){
    target.statYear = year;
    target.statMonth = month;
  }
}

// 监听画布item列表，当有monthStat元素，父组件预加载对应月份打卡
watch(()=>props.itemList, async (list)=>{
  const statItems = list.filter(it=>it.type === "monthStat" && it.statYear && it.statMonth);
  for(const si of statItems){
    await userStore.fetchMonthCheckin(si.statYear, si.statMonth);
  }
},{deep:true});

function getCanvasOffset(){
  const rect = canvasRef.value.getBoundingClientRect();
  return rect;
}

function handleDblClickTextItem(uid){
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

function handleBlurEditItem(uid){
  const target = props.itemList.find(i=>i.uid === uid)
  if(target){
    target.editing = false
  }
}

function startDrag(evt,item){
  if(!props.editMode) return;
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

function startTouchDrag(evt,item){
  if(!props.editMode) return;
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

<template>
  <div class="home-page">
    <!-- 加载遮罩：拉取首页画布时显示 -->
    <div class="loading-mask" v-if="canvasStore.loading">
      <div class="loading-box">
        <div class="spinner"></div>
        <div class="loading-text">加载画布中…</div>
      </div>
    </div>

    <UserHeaderBar></UserHeaderBar>
    <TempCanvasSwitch
      :list="canvasStore.tmpCanvasList"
      :activeId="canvasStore.curTmpCanvasId"
      @switch="switchCanvas"
      @add="canvasStore.newTempCanvas"
      @closeTab="canvasStore.removeTempCanvas"
    ></TempCanvasSwitch>
    <div class="canvas-area">
      <CanvasGrid
        v-if="currentData && !canvasStore.loading"
        :itemList="currentData.items"
        :canvasHeight="currentData.height"
        :editMode="editMode"
        @deleteItem="onDeleteItem"
        @updateTextBoxText="updateTextBox"
        @addCanvasHeight="addHeight"
        @subCanvasHeight="subHeight"
        @itemMove="onItemMove"
        @resizeTextbox="handleResizeTextBox"
      />
    </div>
    <div class="top-action" v-if="!canvasStore.loading">
      <button class="reset-btn" @click="resetAllStatus">更新重置</button>
      <button v-if="!editMode" class="enter-edit" @click="enterEdit">+进入编辑</button>
      <button v-if="!editMode" class="save-btn" @click="openSaveModal">保存</button>
    </div>
    <!--底部工具栏-->
    <BottomEditToolbar
      v-if="editMode && !canvasStore.loading"
      @add-checkin="openCheckinModal"
      @add-month-stat="addMonthStat"
      @add-textbox="addTextBox"
      @open-sticker-upload="openStickerUploadModal"
      @finish-edit="exitEdit"
    />
    <div class="bottom-tab" v-if="!editMode && !canvasStore.loading">
      <span class="tab-item active">首页</span>
      <span class="tab-item" @click="$router.push('/notebook-list')">手账本</span>
    </div>
    <!--弹窗：新建打卡-->
    <div class="modal-mask" v-if="showCheckinModal && !canvasStore.loading" @click.self="showCheckinModal=false">
      <div class="modal">
        <h4>新建打卡项</h4>
        <input v-model="newCheck.name" placeholder="打卡名称" />
        <input type="color" v-model="newCheck.color" />
        <div class="modal-row">
          <button @click="showCheckinModal=false">取消</button>
          <button @click="confirmAddCheckin">确认</button>
        </div>
      </div>
    </div>
    <!--保存弹窗-->
    <div class="modal-mask" v-if="showSaveModal && !canvasStore.loading" @click.self="showSaveModal=false">
      <div class="modal">
        <h4>保存到手账本</h4>
        <input v-model="saveTitle" placeholder="手账标题" />
        <div class="modal-row">
          <button @click="showSaveModal=false">取消</button>
          <button @click="confirmSave">保存</button>
        </div>
      </div>
    </div>
    <!--贴纸上传弹窗-->
    <div class="modal-mask" v-if="showUploadModal && !canvasStore.loading" @click.self="showUploadModal=false">
      <div class="modal">
        <h4>上传图片贴纸</h4>
        <input type="file" ref="fileRef" accept="image/*" />
        <div class="modal-row">
          <button @click="showUploadModal=false">取消</button>
          <button @click="submitUpload">上传</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {ref,computed,onMounted} from "vue";
import {useHomeTempCanvasStore} from "@/stores/homeTempCanvas";
import {reqSaveNotebook,reqUploadSticker} from "@/api/notebookApi";
import UserHeaderBar from "@/components/UserHeaderBar.vue";
import TempCanvasSwitch from "@/components/TempCanvasSwitch.vue";
import BottomEditToolbar from "@/components/BottomEditToolbar.vue";
import CanvasGrid from "@/components/CanvasGrid.vue";
const canvasStore = useHomeTempCanvasStore();
const editMode = ref(false);
const showCheckinModal = ref(false);
const showSaveModal = ref(false);
const showUploadModal = ref(false);
const fileRef = ref(null);
const saveTitle = ref("");
const newCheck = ref({name:"",color:"#4299e1"});
const currentData = computed(()=>canvasStore.getCurrent())
// 获取今日日期字符串，用于保存手账note_date
function getTodayStr(){
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth()+1).padStart(2,"0");
  const d = String(t.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

onMounted(async ()=>{
  await canvasStore.initIfEmpty();
  if(canvasStore.tmpCanvasList.length > 0){
    canvasStore.curTmpCanvasId = canvasStore.tmpCanvasList[0].id
  }else{
    canvasStore.newTempCanvas()
  }
})
function switchCanvas(id){
  canvasStore.curTmpCanvasId = id;
}
function enterEdit(){editMode.value=true;}
function exitEdit(){editMode.value=false;}
function onDeleteItem(uid){
  const arr = currentData.value.items;
  const idx = arr.findIndex(i=>i.uid===uid);
  if(idx>-1) arr.splice(idx,1);
  canvasStore.persistSave();
}
function onItemMove(item){
  canvasStore.persistSave();
}
function handleResizeTextBox(uid,newW,newH){
  const it = currentData.value.items.find(x=>x.uid===uid);
  if(it){
    it.w = newW;
    it.h = newH;
    canvasStore.persistSave();
  }
}
function updateTextBox(uid,text){
  console.log('[HomePage updateTextBox] uid',uid,'text:', text)
  const it = currentData.value.items.find(x=>x.uid===uid);
  if(it) {
    console.log('修改前it.innerText=', it.innerText)
    it.innerText = text;
    console.log('修改后it.innerText=', it.innerText)
    canvasStore.persistSave();
  }
}
function addHeight(){
  const addH = Math.round(window.innerHeight /3);
  currentData.value.height += addH;
  canvasStore.persistSave();
}
function subHeight(){
  const minH = window.innerHeight;
  const subH = Math.round(window.innerHeight /3);
  currentData.value.height = Math.max(minH, currentData.value.height - subH);
  canvasStore.persistSave();
}
function resetAllStatus(){
  currentData.value.items.forEach(it=>{
    if(it.type==="textbox") it.innerText="";
  })
  canvasStore.persistSave();
}
function addMonthStat(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  currentData.value.items.push({
    uid,
    type:"monthStat",
    x:100,
    y:100,
    statTitle:"月度打卡统计"
  })
  canvasStore.persistSave();
}
function confirmAddCheckin(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  currentData.value.items.push({
    uid,
    type:"checkin",
    x:64,y:64,
    checkName:newCheck.value.name||"打卡项",
    checkColor:newCheck.value.color
  })
  showCheckinModal.value=false;
  canvasStore.persistSave();
}
function addTextBox(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  currentData.value.items.push({
    uid,type:"textbox",x:64,y:128,w:140,h:90,innerText:"在这里输入文字",editing: false
  })
  canvasStore.persistSave();
}
async function submitUpload(){
  const fd = new FormData();
  fd.append("img",fileRef.value.files[0]);
  const res = await reqUploadSticker(fd);
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  currentData.value.items.push({
    uid,type:"sticker",x:128,y:64,imgUrl:res.data.data.url
  })
  showUploadModal.value=false;
  canvasStore.persistSave();
}
function openCheckinModal(){
  newCheck.value.name="";
  showCheckinModal.value=true;
}
function openStickerUploadModal(){
  showUploadModal.value = true
}
function openSaveModal(){
  saveTitle.value="";
  showSaveModal.value=true;
}
async function confirmSave(){
  await reqSaveNotebook({
    title:saveTitle.value||"未命名手账",
    canvasHeight:currentData.value.height,
    canvasItems:currentData.value.items,
    notebookId:null,
    noteDate:getTodayStr()
  })
  alert("保存成功");
  showSaveModal.value=false;
}
</script>
<style scoped>
.home-page{
  height:100vh;
  display:flex;
  flex-direction:column;
  background:#f7f5f2;
}
.canvas-area{
  flex:1;
  overflow:hidden;
}
.top-action{
  position:absolute;
  top:52px;
  right:12px;
  z-index:80;
  display:flex;
  gap:8px;
}
.top-action button{
  padding:6px 10px;
  border:none;
  border-radius:6px;
  color:#fff;
}
.reset-btn{background:#dd9922;}
.enter-edit{background:#5577dd;}
.save-btn{background:#5577dd;}
.bottom-tab{
  height:70px;
  background:#fff;
  border-top:1px solid #ddd;
  display:flex;
  justify-content:space-around;
  align-items:center;
}
.tab-item{font-size:15px;color:#666;}
.tab-item.active{color:#5577dd;font-weight:bold;}
.modal-mask{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.45);
  z-index:200;
  display:flex;
  align-items:center;
  justify-content:center;
}
.modal{
  background:#fff;
  width:320px;
  padding:20px;
  border-radius:10px;
}
.modal h4{margin-bottom:12px;}
.modal input{width:100%;box-sizing:border-box;padding:7px;margin-bottom:10px;}
.modal-row{display:flex;gap:10px;justify-content:flex-end;margin-top:12px;}
.modal-row button{padding:6px 12px;border-radius:5px;border:1px solid #ccc;}

/* 加载遮罩样式 */
.loading-mask {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.85);
  z-index: 999;
  display:flex;
  align-items:center;
  justify-content:center;
}
.loading-box {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
}
.spinner {
  width:36px;
  height:36px;
  border:3px solid #e2e2e2;
  border-top-color:#5577dd;
  border-radius:50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  font-size:14px;
  color:#444;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

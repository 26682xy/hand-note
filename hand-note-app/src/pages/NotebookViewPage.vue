<template>
  <div class="view-page">
    <UserHeaderBar></UserHeaderBar>
    <div class="top-bar">
      <span @click="$router.push('/notebook-list')">←返回列表</span>
      <span>{{store.title}}</span>
      <div class="bar-btn-group">
        <button v-if="!store.isEditMode" @click="store.isEditMode=true">编辑</button>
        <button class="top-del-btn" @click="openDeleteConfirm">删除</button>
      </div>
    </div>

    <div class="canvas-area">
      <CanvasGrid
        :itemList="store.items"
        :canvasHeight="store.canvasHeight"
        :editMode="store.isEditMode"
        :canvas-render-date="store.noteDate"
        @deleteItem="onDeleteItem"
        @updateTextBoxText="updateTextBox"
        @addCanvasHeight="addHeight"
        @subCanvasHeight="subHeight"
        @itemMove="onItemMove"
        @resizeTextbox="handleResizeTextBox"
      />
    </div>

    <BottomEditToolbar
      v-if="store.isEditMode"
      @add-checkin="openCheckinModal"
      @add-month-stat="addMonthStat"
      @add-textbox="addTextBox"
      @open-sticker-upload="openStickerUploadModal"
      @finish-edit="saveAndExit"
    />
    <div class="bottom-empty" v-else style="height:70px"></div>

    <!--弹窗部分和首页一致-->
    <div class="modal-mask" v-if="showCheckinModal" @click.self="showCheckinModal=false">
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
    <div class="modal-mask" v-if="showUploadModal" @click.self="showUploadModal=false">
      <div class="modal">
        <h4>上传图片贴纸</h4>
        <input type="file" ref="fileRef" accept="image/*" />
        <div class="modal-row">
          <button @click="showUploadModal=false">取消</button>
          <button @click="submitUpload">上传</button>
        </div>
      </div>
    </div>
    <div class="modal-mask" v-if="showDelModal" @click.self="showDelModal=false">
      <div class="modal">
        <h4>确认删除本条手账？</h4>
        <p>删除后数据将无法恢复！</p>
        <div class="modal-row">
          <button @click="showDelModal=false">取消</button>
          <button class="confirm-del" @click="confirmPageDelete">确认删除</button>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import {ref,onMounted} from "vue";
import {useRoute,useRouter} from "vue-router";
import {useNotebookEditStore} from "@/stores/notebookEditStore";
import UserHeaderBar from "@/components/UserHeaderBar.vue";
import BottomEditToolbar from "@/components/BottomEditToolbar.vue";
import CanvasGrid from "@/components/CanvasGrid.vue";
import {reqNotebookDetail,reqSaveNotebook,reqUploadSticker,reqDeleteNotebook} from "@/api/notebookApi";

const route = useRoute();
const router = useRouter();
const store = useNotebookEditStore();

const showCheckinModal = ref(false);
const showUploadModal = ref(false);
const fileRef = ref(null);
const newCheck = ref({name:"",color:"#4299e1"});
const showDelModal = ref(false);

function openDeleteConfirm(){
  showDelModal.value=true;
}
async function confirmPageDelete(){
  await reqDeleteNotebook(store.notebookId);
  showDelModal.value=false;
  router.push("/notebook-list");
}

onMounted(async ()=>{
  const id = route.params.id;
  const res = await reqNotebookDetail(id);
  store.loadData(res.data.data);
})

async function saveAndExit(){
  await reqSaveNotebook({
    title:store.title,
    canvasHeight:store.canvasHeight,
    canvasItems:store.items,
    notebookId:store.notebookId,
    noteDate:store.noteDate
  })
  store.isEditMode = false;
  alert("保存更新完成");
}

function handleResizeTextBox([uid,newW,newH]){
  const it = store.items.find(x=>x.uid===uid);
  if(it){
    it.w = newW;
    it.h = newH;
  }
}
function addMonthStat(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  store.items.push({
    uid,
    type:"monthStat",
    x:100,
    y:100,
    statTitle:"月度打卡统计"
  })
}
function onDeleteItem(uid){
  const idx = store.items.findIndex(i=>i.uid===uid);
  if(idx>-1) store.items.splice(idx,1);
}
function onItemMove(item){}
function updateTextBox(uid,text){
  const it = store.items.find(x=>x.uid===uid);
  if(it) it.innerText = text;
}
function addHeight(){
  const addH = Math.round(window.innerHeight /3);
  store.canvasHeight += addH;
}
function subHeight(){
  const minH = window.innerHeight;
  const subH = Math.round(window.innerHeight /3);
  store.canvasHeight = Math.max(minH, store.canvasHeight - subH);
}
function openStickerUploadModal(){
  showUploadModal.value = true
}

function openCheckinModal(){
  newCheck.value.name="";
  showCheckinModal.value=true;
}
function confirmAddCheckin(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  store.items.push({
    uid,
    type:"checkin",
    x:64,y:64,
    checkName:newCheck.value.name||"打卡项",
    checkColor:newCheck.value.color
  })
  showCheckinModal.value=false;
}
function addTextBox(){
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  store.items.push({
    uid,type:"textbox",x:64,y:128,w:140,h:90,innerText:"在这里输入文字",editing: false
  })
}
async function submitUpload(){
  const fd = new FormData();
  fd.append("img",fileRef.value.files[0]);
  const res = await reqUploadSticker(fd);
  const uid = "item_"+Date.now()+"_"+Math.floor(Math.random()*9999);
  store.items.push({
    uid,type:"sticker",x:128,y:64,imgUrl:res.data.data.url
  })
  showUploadModal.value=false;
}
</script>
<style scoped>
.view-page{
  height:100vh;
  display:flex;
  flex-direction:column;
  background:#f7f5f2;
}
.top-bar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#fff;
  padding:10px 16px;
}
.bar-btn-group{
  display:flex;
  gap:8px;
}
.top-del-btn{
  background:#dd4444;
  color:#fff;
  border:none;
  border-radius:5px;
  padding:4px 10px;
}
.confirm-del{
  background:#dd4444;
  color:#fff;
  border:none;
}
.canvas-area{
  flex:1;
  overflow:hidden;
}
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
</style>

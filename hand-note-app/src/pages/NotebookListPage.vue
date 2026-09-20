<template>
    <div class="list-page">
      <UserHeaderBar></UserHeaderBar>
      <div class="page-nav">
        <span @click="$router.push('/home')">← 返回首页</span>
        <h3>我的手账本</h3>
      </div>
      <div class="list-wrap">
        <div v-if="listData.length===0" class="empty">暂无保存的手账记录</div>
        <div v-for="item in listData" :key="item.id" class="note-item">
          <div class="note-info" @click="openView(item.id)">
            {{item.title}}
          </div>
          <button class="del-btn" @click.stop="clickDelete(item)">删除</button>
        </div>
      </div>
  
      <!--删除确认弹窗-->
      <div class="modal-mask" v-if="showDelModal" @click.self="showDelModal=false">
        <div class="modal">
          <h4>确认删除这条手账？</h4>
          <p>删除后数据不可恢复！</p>
          <div class="modal-row">
            <button @click="showDelModal=false">取消</button>
            <button class="confirm-del" @click="confirmDelete">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import {ref,onMounted} from "vue";
  import {useRouter} from "vue-router";
  import {reqNotebookList,reqDeleteNotebook} from "@/api/notebookApi";
  import UserHeaderBar from "@/components/UserHeaderBar.vue";
  
  const router = useRouter();
  const listData = ref([]);
  const showDelModal = ref(false);
  const deleteTarget = ref(null);
  
  async function loadList(){
    const res = await reqNotebookList();
    listData.value = res.data.data;
  }
  function openView(id){
    router.push("/notebook-view/"+id)
  }
  function clickDelete(item){
    deleteTarget.value = item;
    showDelModal.value=true;
  }
  async function confirmDelete(){
    await reqDeleteNotebook(deleteTarget.value.id);
    showDelModal.value=false;
    await loadList();
  }
  onMounted(()=>loadList())
  </script>
  <style scoped>
  .list-page{
    min-height:100vh;
    background:#f7f5f2;
  }
  .page-nav{
    padding:12px 16px;
    background:#fff;
  }
  .list-wrap{
    padding:16px;
  }
  .note-item{
    background:#fff;
    padding:14px;
    border-radius:8px;
    margin-bottom:10px;
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .note-info{
    flex:1;
  }
  .del-btn{
    background:#dd4444;
    color:#fff;
    border:none;
    border-radius:5px;
    padding:5px 10px;
  }
  .empty{
    text-align:center;
    margin-top:60px;
    color:#777;
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
  .modal h4{margin-bottom:8px;}
  .modal p{font-size:13px;color:#666;margin-bottom:12px;}
  .modal-row{display:flex;gap:10px;justify-content:flex-end;margin-top:12px;}
  .confirm-del{
    background:#dd4444;
    color:#fff;
    border:none;
  }
  </style>
  
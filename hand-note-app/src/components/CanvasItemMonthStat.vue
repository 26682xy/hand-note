<template>
    <div class="month-stat-item">
      <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
      <div class="stat-title">{{ item.statTitle }}</div>
      <div class="stat-info">本月打卡：{{ checkedCount }} 天</div>
      <div class="dot-wrap">
        <div
          v-for="d of dayList"
          :key="d.dateStr"
          class="dot"
          :class="{checked: d.checked}"
        ></div>
      </div>
    </div>
  </template>
  <script setup>
  import {ref,computed,onMounted} from "vue";
  import {useUserStore} from "@/stores/user";
  const props = defineProps({
    item:Object,
    editMode:Boolean
  })
  const emit = defineEmits(["delete"]);
  const userStore = useUserStore();
  
  // 默认取当前年月，后续可以扩展支持切换月份
  const now = new Date();
  const curYear = ref(now.getFullYear());
  const curMonth = ref(now.getMonth()+1);
  
  const dayList = computed(()=>{
    const y = curYear.value;
    const m = curMonth.value;
    const totalDays = new Date(y,m,0).getDate();
    const arr = [];
    for(let i=1;i<=totalDays;i++){
      const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
      arr.push({
        day:i,
        dateStr,
        checked: userStore.isDateChecked(y,m,i)
      })
    }
    return arr;
  })
  const checkedCount = computed(()=>{
    return dayList.value.filter(x=>x.checked).length;
  })
  
  async function loadData(){
    await userStore.fetchMonthCheckin(curYear.value,curMonth.value);
  }
  
  onMounted(()=>{
    loadData();
  })
  </script>
  <style scoped>
  .month-stat-item{
    position:absolute;
    width:220px;
    background:#fff;
    border-radius:8px;
    padding:10px;
    box-shadow:0 1px 4px #00000022;
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
  .stat-title{
    font-size:14px;
    font-weight:bold;
    margin-bottom:4px;
  }
  .stat-info{
    font-size:13px;
    color:#555;
    margin-bottom:8px;
  }
  .dot-wrap{
    display:grid;
    grid-template-columns:repeat(7,1fr);
    gap:4px;
  }
  .dot{
    width:14px;height:14px;
    border-radius:50%;
    background:#bbbbbb;
  }
  .dot.checked{
    background:#38b069;
  }
  </style>
  
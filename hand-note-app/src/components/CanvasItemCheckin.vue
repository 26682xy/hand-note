<template>
  <div class="checkin-item">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
    <div
      class="check-circle"
      :style="{backgroundColor: currentItemChecked ? item.checkColor : '#bbbbbb'}"
      @click.stop="onCircleClick"
    ></div>
    <div class="check-name">{{ item.checkName }}</div>

    <!--仅用于取消打卡确认弹窗，不再有日期选择-->
    <div class="mask" v-if="showConfirmPopup" @click.self="showConfirmPopup=false">
      <div class="popup">
        <h5>确认取消今日打卡？</h5>
        <div class="btns">
          <button @click="showConfirmPopup=false">保留打卡</button>
          <button class="del-btn" @click="doCancelCheck">确认取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref,computed} from "vue";
import {useUserStore} from "@/stores/user";
import {reqDoCheckin,reqCancelCheckin} from "@/api/checkinApi";

const props = defineProps({
  item: Object,
  editMode: Boolean,
  // UI圆圈展示哪一天打卡状态：首页不传自动取今日；历史手账传入手账日期
  renderDate:{
    type: String,
    default: ()=>{
      const t = new Date();
      const y = t.getFullYear();
      const m = String(t.getMonth()+1).padStart(2,"0");
      const d = String(t.getDate()).padStart(2,"0");
      return `${y}-${m}-${d}`;
    }
  }
})
const emit = defineEmits(["delete"]);
const userStore = useUserStore();

// 弹窗：仅取消打卡确认
const showConfirmPopup = ref(false);

// 真实操作：固定今天，不能选历史日期
const todayObj = new Date();
const realToday = `${todayObj.getFullYear()}-${String(todayObj.getMonth()+1).padStart(2,"0")}-${String(todayObj.getDate()).padStart(2,"0")}`;
const [ty,tm,td] = realToday.split("-");
// 真实今天是否已经打卡（用于点击交互）
const isRealTodayChecked = computed(()=>{
  return userStore.isDateChecked(Number(ty),Number(tm),Number(td));
})

// UI圆圈展示状态：受 renderDate 控制（首页今日 / 历史手账日期）
const currentItemChecked = computed(()=>{
  if(!props.renderDate) return false;
  const [y,m,d] = props.renderDate.split("-");
  return userStore.isDateChecked(Number(y),Number(m),Number(d));
})

function onCircleClick(){
  if(props.editMode) return;
  // 真实今天未打卡 → 直接打卡
  if(!isRealTodayChecked.value){
    doCheck();
  }else{
    // 真实今天已打卡 → 弹出确认取消弹窗
    showConfirmPopup.value = true;
  }
}

// 打卡：固定打今天
async function doCheck(){
  await reqDoCheckin(realToday);
  userStore.cacheAddCheckin(realToday);
}
// 取消打卡：取消今天打卡
async function doCancelCheck(){
  await reqCancelCheckin(realToday);
  userStore.cacheRemoveCheckin(realToday);
  showConfirmPopup.value = false;
}
</script>

<style scoped>
.checkin-item{
  position:absolute;
  width:72px;
  text-align:center;
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
.check-circle{
  width:48px;height:48px;
  border-radius:50%;
  margin:0 auto 4px;
  border:2px solid #999;
  cursor:pointer;
}
.check-name{
  font-size:12px;
  color:#333;
  word-break:break-all;
}
.mask{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  z-index:300;
  display:flex;
  align-items:center;
  justify-content:center;
}
.popup{
  background:#fff;
  padding:16px;
  border-radius:8px;
}
.popup h5{margin-bottom:10px;}
.btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;}
.del-btn{background:#dd4444;color:#fff;border:none;}
</style>

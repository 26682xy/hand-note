<template>
  <div class="checkin-item">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
    <div
      class="check-circle"
      :style="{backgroundColor: localChecked ? item.checkColor : '#bbbbbb'}"
      @click.stop="onCircleClick"
    ></div>
    <div class="check-name">{{ item.checkName }}</div>
    <!--补打日期弹窗-->
    <div class="mask" v-if="showDatePopup" @click.self="showDatePopup=false">
      <div class="popup">
        <h5>选择打卡日期</h5>
        <input type="date" v-model-value="selDate" @input="selDate=$event.target.value" />
        <div class="btns">
          <button @click="showDatePopup=false">取消</button>
          <button v-if="!isSelDateChecked" @click="doCheck">打卡</button>
          <button v-if="isSelDateChecked" class="del-btn" @click="cancelCheck">取消打卡</button>
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
  editMode: Boolean
})
const emit = defineEmits(["delete"]);
const userStore = useUserStore();
const showDatePopup = ref(false);
const selDate = ref("");
// 简易：取今天做默认
const today = new Date();
const defaultDay = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

const isSelDateChecked = computed(()=>{
  if(!selDate.value) return false;
  const [y,m,d] = selDate.value.split("-");
  return userStore.isDateChecked(Number(y),Number(m),Number(d));
})

// 本组件UI显示只做交互入口；不维护自身done状态
const localChecked = ref(false);

function onCircleClick(){
  if(props.editMode) return;
  selDate.value = defaultDay;
  showDatePopup.value = true;
}

async function doCheck(){
  await reqDoCheckin(selDate.value);
  userStore.cacheAddCheckin(selDate.value);
  showDatePopup.value = false;
}
async function cancelCheck(){
  await reqCancelCheckin(selDate.value);
  userStore.cacheRemoveCheckin(selDate.value);
  showDatePopup.value = false;
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
.popup input{width:100%;margin-bottom:10px;}
.btns{display:flex;gap:8px;justify-content:flex-end;}
.del-btn{background:#dd4444;color:#fff;border:none;}
</style>

<template>
  <div class="month-stat-item">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>

    <div class="year-month-select" v-if="editMode">
      <select v-model.number="localYear" @change="onLocalYmChange">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
      </select>
      <select v-model.number="localMonth" @change="onLocalYmChange">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
      </select>
    </div>

    <div class="stat-title">{{ item.statTitle }}</div>
    <div class="stat-info">
      {{ localYear }}‑{{ String(localMonth).padStart(2,"0") }} 打卡：{{ checkedCount }} 天
    </div>
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
import { ref, computed, watch, onMounted } from "vue";

// ✅新增props：父组件传进来该月份的打卡日期字符串数组
const props = defineProps({
  item: Object,
  editMode: Boolean,
  monthCheckDates: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(["delete", "updateYm"]);

const localYear = ref(null);
const localMonth = ref(null);

const now = new Date();
const curSysYear = now.getFullYear();
const yearOptions = ref([]);
for(let i = curSysYear - 5; i <= curSysYear + 2; i++){
  yearOptions.value.push(i);
}

// 纯计算：根据传入的monthCheckDates渲染圆点，组件内部不访问pinia、不调接口
const dayList = computed(() => {
  const y = localYear.value;
  const m = localMonth.value;
  if(!y || !m) return [];
  const totalDays = new Date(y, m, 0).getDate();
  const arr = [];
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    arr.push({
      day: i,
      dateStr,
      checked: props.monthCheckDates.includes(dateStr)
    });
  }
  return arr;
});

const checkedCount = computed(() => {
  return dayList.value.filter(x => x.checked).length;
});

async function onLocalYmChange() {
  emit("updateYm", props.item.uid, localYear.value, localMonth.value);
}

onMounted(() => {
  const initY = props.item.statYear ?? curSysYear;
  const initM = props.item.statMonth ?? (now.getMonth() + 1);
  localYear.value = initY;
  localMonth.value = initM;

  if(props.item.statYear === undefined || props.item.statMonth === undefined){
    emit("updateYm", props.item.uid, initY, initM);
  }
});

// 外部item年月变更，同步本地
watch(
  () => ({ y: props.item.statYear, m: props.item.statMonth }),
  (newVal) => {
    if(newVal.y != null && newVal.m != null){
      localYear.value = newVal.y;
      localMonth.value = newVal.m;
    }
  },
  { deep:true }
);
</script>
<style scoped>
.month-stat-item {
  position: absolute;
  width: 240px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 4px #00000022;
}
.item-del {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 22px;
  height: 22px;
  background: #dd4444;
  color: #fff;
  border-radius: 50%;
  line-height: 22px;
  font-size: 14px;
  z-index: 99;
  cursor: pointer;
}
.year-month-select {
  display: flex;
  gap:6px;
  margin-bottom:6px;
}
.year-month-select select{
  flex:1;
  padding:2px 4px;
  font-size:12px;
}
.stat-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}
.stat-info {
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}
.dot-wrap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #bbbbbb;
}
.dot.checked {
  background: #38b069;
}
</style>

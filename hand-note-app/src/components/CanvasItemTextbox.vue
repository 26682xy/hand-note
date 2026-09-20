<template>
  <div class="textbox-item" :style="{width:item.w+'px',height:item.h+'px'}">
    <div class="item-del" v-if="editMode" @click.stop="$emit('delete')">×</div>
    <div
      ref="textRef"
      class="text-content"
      contenteditable
      @input="handleInput"
    >{{item.innerText}}</div>
    <div v-if="editMode" class="resize-handle"></div>
  </div>
</template>
<script setup>
const props = defineProps({
  item: Object,
  editMode: Boolean
})
const emit = defineEmits(["delete","updateText"])
function handleInput(e){
  emit("updateText", props.item.uid, e.target.innerText)
}
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
}
.resize-handle{
  position:absolute;
  right:0;
  bottom:0;
  width:14px;height:14px;
  background:#888;
  cursor:nwse-resize;
}
</style>

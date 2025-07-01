<template>
  <div v-html="displayText + `${ showCursor || adding ? `<span class='cursors'>_</span>`:'' }`"></div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  // 要显示的完整文本
  text: {
    type: String,
    required: true
  },
  // 打字速度（毫秒/字符）
  speed: {
    type: Number,
    default: 10
  },
  showCursor: {
    type: Boolean,
    default: false
  },
  break: {
    type: Boolean,
    default: false
  },
});
const emits = defineEmits(['update', 'ok'])

const displayText = ref('');
const adding = ref(false);
let timer = null;

// 更新显示的文本
const updateDisplayText = () => {
  if (displayText.value.length < props.text.length) {
    adding.value = true;
    displayText.value = props.text.substring(0, displayText.value.length + 1);
    emits('update')
    timer = setTimeout(updateDisplayText, props.speed);
  } else {
    adding.value = false;
    setTimeout(() =>{
      emits('ok')
    } ,600)
  }
};

// 增量更新
watch(() => props.text, (newText) => {
  // 如果新文本比当前显示的文本长，则继续打字
  if (newText.length > displayText.value.length) {
    clearTimeout(timer);
    updateDisplayText();
  }
});

// 停止回答
watch(() => props.break, (val) => {
  if (val) {
    displayText.value = props.text + ''
    clearTimeout(timer);
    adding.value = false;
    setTimeout(() =>{
      emits('ok')
    } ,600)
  }
});

// 初始化
updateDisplayText();

// 组件卸载时清理定时器
onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<style>

.cursors {
  font-weight: 700;
  vertical-align: baseline;
  animation: blink 1s infinite;
  color: #3a5ccc;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>  
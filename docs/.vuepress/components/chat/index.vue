<template>
  <div class="AI-page">
    <div class="AI-content">
      <div class="chat-list">
        <div class="ai-message">
          <div>测试测试测试测试</div>
        </div>
        <div class="question-message">
          <div>测试测试测试测试</div>
        </div>
      </div>
      <div class="chat-toolbar">
        <NInput size="large" placeholder="点击输入问题" clearable v-model:value="inputMsg" />
        <NIcon size="24" :color="inputMsg ? '#309BF5B3':'#309BF54C'" class="send-btn"><SendSharp /></NIcon>
      </div>
    </div>
    <div class="circle1"></div>
    <div class="circle2"></div>
    <div class="circle3"></div>
    <div class="circle4"></div>
  </div>
</template>
<script setup>
import { NInput, NInputGroup, NButton, NIcon } from 'naive-ui'
import { SendSharp } from '@vicons/ionicons5'
import {ref} from "vue";

const inputMsg = ref('')
</script>
<style scoped>
.AI-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
}
.AI-content {
  height: calc(100vh - 128px);
  max-height: 1000px;
  width: calc(100vh - 128px);
  max-width: 1000px;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 2rem;
  padding: 2rem;
  box-sizing: border-box;
  z-index: 2;
  backdrop-filter: blur(2rem);
  margin: auto;
}

.circle1,
.circle2,
.circle3,
.circle4 {
  background: white;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.3)
  );

  position: absolute;
  border-radius: 50%;
}

.circle1 {
  height: 20rem;
  width: 20rem;
  top: 10%;
  right: 5%;
}
.circle2 {
  height: 10rem;
  width: 10rem;
  bottom: 15%;
  left: 10%;
}
.circle3 {
  height: 15rem;
  width: 15rem;
  bottom: 0;
  left: 50%;
}
.circle4 {
  height: 10rem;
  width: 10rem;
  top: 0;
  right: 50%;
}

.chat-list {
  height: calc(100% - 60px);
}
.chat-list .ai-message > div, .chat-list .question-message > div {
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  margin-bottom: 12px;
}
.chat-list .ai-message > div {
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.3)
  );
  border-top-right-radius: 12px;
  border-top-left-radius: 4px;
  width: 100%;
}
.chat-list .question-message {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.chat-list .question-message > div {
  background: linear-gradient(
    to right bottom,
    rgb(48, 155, 245, 0.7),
    rgb(48, 155, 245, 0.3)
  );
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
  width: max-content;
  max-width: 100%;
  color: white;
}
.chat-toolbar {
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.99),
    rgba(255, 255, 255, 0.7)
  );
  height: 48px;
  margin-top: 12px;
  box-sizing: border-box;
  border-radius: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.chat-toolbar .send-btn {
  margin-left: 12px;
  margin-right: 12px;
}
</style>
<style>
.chat-toolbar .n-input {
  background: transparent;
  border: none;
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-box-shadow-focus: none !important;
}
.chat-toolbar .n-input--focus {
  background: transparent !important;
}
</style>
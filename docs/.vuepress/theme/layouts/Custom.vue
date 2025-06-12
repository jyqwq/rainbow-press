<template>
  <div class="custom-layout">
    <VPNav />
    <div class="custom-content">
      <div class="bg-filter">
        <canvas ref="canvas" width="32" height="32" />
      </div>
      <Content />
    </div>
  </div>
</template>
<script setup lang="ts">
// @ts-ignore
import { Content } from 'vuepress/client'
// @ts-ignore
import VPNav from 'vuepress-theme-plume/components/Nav/VPNav.vue'
// @ts-ignore
import { useHomeHeroTintPlate } from '../hooks/useCanvas.js'

import {ref} from "vue";

const canvas = ref<HTMLCanvasElement>()

useHomeHeroTintPlate(canvas,false)
</script>
<style scoped>
.custom-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.custom-content {
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
  margin: 64px auto 0;
  position: relative;
}
@media (max-width: 960px) {
  .custom-content {
    margin: unset !important;
  }
}

.bg-filter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}
.bg-filter canvas {
  width: 100%;
  height: 100%;
}
.bg-filter::after {
  --vp-home-hero-bg-filter: var(--vp-c-bg);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: "";
  background: linear-gradient(to bottom, var(--vp-home-hero-bg-filter) 0, transparent 45%, transparent 55%, var(--vp-home-hero-bg-filter) 140%);
  transition: --vp-home-hero-bg-filter var(--vp-t-color);
}
</style>
<style>
.custom-layout .vp-navbar:has(.top) .divider, .custom-layout .vp-navbar:has(.top) .divider-line {
  background-color: transparent !important;
}
</style>
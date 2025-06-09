// @ts-ignore
import { defineClientConfig } from 'vuepress/client'
import AIChat from "./components/chat/index.vue";
import Custom from './theme/layouts/Custom.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('AIChat', AIChat)
  },
  layouts: {
    Custom
  }
})

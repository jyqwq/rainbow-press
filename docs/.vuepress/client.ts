// @ts-ignore
import { defineClientConfig } from 'vuepress/client'
import naive from 'naive-ui'
import './styles/index.scss'
import AIChat from './components/chat/index.vue'
import Custom from './theme/layouts/Custom.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.use(naive)
    app.component('AIChat', AIChat)
  },
  layouts: {
    Custom
  }
})

import { defineClientConfig } from 'vuepress/client'
import AIChat from "./components/AIChat.vue";
// import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
// import CustomComponent from './theme/components/Custom.vue'

// import './theme/styles/custom.css'

export default defineClientConfig({
  enhance({ app }) {
    app.component('AIChat', AIChat)
    // app.component('CustomComponent', CustomComponent)
  },
})

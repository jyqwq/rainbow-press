import { defineThemeConfig } from 'vuepress-theme-plume'
import { navbar } from './navbar'
import { notes } from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: 'https://file.40017.cn/baoxian/health/health_public/images/rainbow_small.png',
  // your git repo url
  docsRepo: '',
  docsDir: 'docs',

  appearance: true,

  profile: {
    avatar: 'https://file.40017.cn/baoxian/health/health_public/images/rainbow_small.png',
    name: '纸上的彩虹',
    description: '彩虹の前端小窝',
    location: '江苏 · 苏州',
    organization: '同程旅行',
  },

  navbar,
  notes,
  social: [
    { icon: 'github', link: '/' },
  ],

} as any)

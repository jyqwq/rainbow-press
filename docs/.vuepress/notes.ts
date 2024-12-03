import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

const lifeNote = defineNoteConfig({
  dir: 'life',
  link: '/life',
  sidebar: ['写于第二份工作结束','写于第一份工作结束','迷茫的大学进行时','EFG，少年的电竞梦','你好，二十岁','花开半夏，高考结束后的那个夏天'],
})

export const notes = defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [lifeNote],
})

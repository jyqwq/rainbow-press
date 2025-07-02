<template>
  <div class="AI-page">
    <div class="AI-content">
      <div ref="aiCtx" class="chat-list">
        <template v-for="(msg,index) in aiMessageList" :key="index">
          <MessageTime
            :currTime="msg.time / 1000"
            :prevTime="
              aiMessageList[index - 1]?.time
                ? aiMessageList[index - 1]?.time / 1000
                : undefined
            "
          />
          <div v-if="msg.ai" class="ai-message">
            <div v-if="!msg.text && loadingSend">
              正在思考中...
            </div>
            <div v-if="!msg.text && !loadingSend">
              未获取到信息
            </div>
            <TypingEffect v-else-if="msg.text" :text="msg.text" :showCursor="!msg.ready" :break="msg.break" @update="updateAIText(index)" @ok="textAllShow(index)" />
          </div>
          <div v-else class="question-message">
            <div>{{ msg.text }}</div>
          </div>
        </template>

      </div>
      <div class="chat-toolbar">
        <NButton v-if="loadingSend" class="pause-btn" round color="#309BF5B3" @click="stopAnswer">
          <template #icon>
            <NIcon>
              <Stop />
            </NIcon>
          </template>
          停止回答
        </NButton>
        <NInput size="large" placeholder="点击输入问题" clearable v-model:value="prompt" @keydown.enter="sendAiText" />
        <NIcon size="24" :color="prompt ? '#309BF5B3':'#309BF54C'" class="send-btn" @click="sendAiText"><SendSharp /></NIcon>
      </div>
    </div>
    <div class="circle1"></div>
    <div class="circle2"></div>
    <div class="circle3"></div>
    <div class="circle4"></div>
  </div>
</template>
<script setup>
import { ref, nextTick, onUnmounted } from "vue"
import { createDiscreteApi } from 'naive-ui';
import { SendSharp, Stop } from '@vicons/ionicons5'
import MarkdownIt from 'markdown-it'
import MdLinkAttributes from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import MessageTime from "./MessageTime.vue"
import TypingEffect from "./TypingEffect.vue"

const url = `https://dashscope.aliyuncs.com/api/v1/apps/d428cc7d79ce4f13ae13bf86b194e80c/completion`;

const mdi = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})
mdi.use(MdLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })

let reader = null
let controller = null

const aiCtx = ref()
const prompt = ref(null)
const loadingSend = ref(false)
const aiMessageList = ref([])


const { message } = createDiscreteApi(['message'])

function highlightBlock(str, lang) {
  return `<pre class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-block-header__lang">${lang}</span>
                <span class="code-block-header__copy">复制代码</span>
            </div>
            <code class="hljs code-block-body ${lang}"><br>${str}</code>
          </pre>`
}


const throttleNextTick = (callback) => {
  let timer = null;
  let lastExecTime = 0;
  let lastArgs = null;

  const execute = () => {
    lastExecTime = Date.now();
    nextTick(() => {
      callback(...lastArgs);
    });
  };

  return function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    if (now - lastExecTime > 500) {
      clearTimeout(timer);
      timer = null;
      execute();
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        execute();
      }, 500 - (now - lastExecTime));
    }
  };
}

const scrollToBottom = () => {
  try {
    const { height } = aiCtx.value.getBoundingClientRect()
    aiCtx.value.scrollTo({
      top: aiCtx.value.scrollHeight - height,
      behavior: 'smooth',
    })
  } catch (e) {}
}

const sendAiText = (e) => {
  if (e?.keyCode === 13 && e?.shiftKey) return
  e?.preventDefault()
  e?.stopPropagation()
  if (!prompt.value || loadingSend.value) return
  const question = prompt.value + ''
  prompt.value = null
  callDashScope(question)
}

const callDashScope = async (text) => {
  loadingSend.value = true
  try {
    const currentTime = new Date().getTime()
    // AbortController 对象的作用是对一个或多个 Web 请求进行中止操作，像 fetch 请求、ReadableStream 以及第三方库的操作都可以取消。
    // 核心机制：借助 AbortSignal 来实现操作的中止。AbortController 会生成一个信号对象，该对象可被传递给请求，当调用 abort() 方法时，就会触发请求的取消操作。
    controller = new AbortController()
    aiMessageList.value.push({ ai: false, text, time: currentTime })
    aiMessageList.value.push({ ai: true, text: '', time: currentTime })
    scrollToBottom()
    const currentIndex = aiMessageList.value.length -1
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-dd0e8892eb0445149fd21fd9b1d6176c`,
          'X-DashScope-SSE': 'enable',
        },
        signal: controller.signal,
        body: JSON.stringify({
          input: {
            prompt: text
          },
          parameters: {
            'incremental_output' : 'true' // 增量输出
          },
        }),
      }
    )
    if (!response.ok) {
      message.error('AI返回错误')
      loadingSend.value = false
      return
    }

    // TextDecoder 是 JavaScript 中用于将二进制数据（如 ArrayBuffer 或 Uint8Array）解码为文本字符串的内置对象。它支持多种字符编码（如 UTF-8、ISO-8859-1、GBK 等），是处理网络响应、文件读取等二进制数据转换的标准工具。
    // 将二进制数据（如网络请求的 ArrayBuffer）转换为人类可读的字符串。默认使用 UTF-8，也支持其他常见编码（如 latin1、gbk、utf-16le 等）。
    // 流式解码：支持分块处理二进制数据（通过多次调用 decode 方法）。
    const decoder = new TextDecoder('UTF-8')
    // JavaScript 中用于处理 fetch 请求响应流的方法，它允许你以可控的方式逐块读取响应数据，而非一次性处理整个响应。这在处理大文件下载、实时数据流（如视频、SSE）或需要渐进式解析数据的场景中特别有用。
    // 获取一个 ReadableStreamDefaultReader 对象，用于逐块读取响应的二进制数据（Uint8Array）。
    reader = response.body.getReader()

    // 用于累计接收到的数据
    let accumulatedText = ''

    while (true) {
      // 读取数据块 流是一次性的，读取完成后无法再次读取
      const {done, value} = await reader.read();

      if (done) {
        console.log('流读取完成');
        // 中断fetch请求
        controller.abort()
        controller = null
        // 资源释放：释放读取器锁
        reader.releaseLock()
        reader = null

        renderToAI(accumulatedText, currentIndex, true)

        loadingSend.value = false
        break;
      }

      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true })
      // console.log('chunk:===>', chunk)
      // 累加并渲染数据
      const newText = extractText(chunk)
      // console.log('newText:===>', newText)

      if (newText) {
        accumulatedText += newText
        renderToAI(accumulatedText, currentIndex)
      }
    }
  } catch (e) {
    loadingSend.value = false
    console.log(e);
    if (e.name === 'AbortError') return
    message.error('系统错误')
  }
}

const stopAnswer = () => {
  controller?.abort()
  controller = null
  reader?.releaseLock()
  reader = null
  loadingSend.value = false
  const currentIndex = aiMessageList.value.length -1
  aiMessageList.value[currentIndex].ready = true
  aiMessageList.value[currentIndex].break = true
}

const extractText = (jsonString) => {
  try {
    const regex = /"text":"(.*?)","reject_status":/gs;
    let match;
    let result = '';
    while ((match = regex.exec(jsonString)) !== null) {
      result += match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
    return result
  } catch (error) {
    console.log('error', error)
    return ''
  }
}

const escapeBrackets = (text) => {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\]|\\\((.*?)\\\)/g
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock)
      return codeBlock
    else if (squareBracket)
      return `$$${squareBracket}$$`
    else if (roundBracket)
      return `$${roundBracket}$`
    return match
  })
}

const escapeDollarNumber = (text) => {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '

    if (char === '$' && nextChar >= '0' && nextChar <= '9')
      char = '\\$'

    escapedText += char
  }

  return escapedText
}

const renderToAI = (text, index, ready=false) => {
  const currentMsg = aiMessageList.value[index]
  // 对数学公式进行处理，自动添加 $$ 符号
  const escapedText = escapeBrackets(escapeDollarNumber(text))
  currentMsg.text = mdi.render(escapedText)
  currentMsg.ready = ready
}

const updateAIText = throttleNextTick(()=> {
  scrollToBottom()
})

const textAllShow = () => {
  setTimeout(() => {
    addCopyEvents()
    scrollToBottom('.ai-content')
  }, 100)
}

 const copyToClip = (text) => {
  return new Promise((resolve, reject) => {
    try {
      const input = document.createElement('textarea')
      input.setAttribute('readonly', 'readonly')
      input.value = text
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy'))
        document.execCommand('copy')
      document.body.removeChild(input)
      resolve(text)
    }
    catch (error) {
      reject(error)
    }
  })
}


const addCopyEvents = () => {
  if (aiCtx.value) {
    const copyBtn = aiCtx.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.nextElementSibling?.textContent
        if (code) {
          copyToClip(code).then(() => {
            message.success('复制成功')
            btn.textContent = '复制成功'
            setTimeout(() => {
              btn.textContent = '复制代码'
            }, 1000)
          })
        }
      })
    })
  }
}

const removeCopyEvents = () => {
  if (aiCtx.value) {
    const copyBtn = aiCtx.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => { })
    })
  }
}

onUnmounted(() => {
  removeCopyEvents()
})


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
  overflow-y: scroll;
}
.chat-list::-webkit-scrollbar {
  width: 0;
  background: transparent;
  border-radius: 0;
}
.chat-list::-webkit-scrollbar-thumb {
  width: 0;
  background: rgba(59, 62, 65, 0.2);
  border-radius: 0;
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
  position: relative;
}
.chat-toolbar .send-btn {
  margin-left: 12px;
  margin-right: 12px;
}
.chat-toolbar .pause-btn {
  position: absolute;
  left: 50%;
  top: -42px;
  transform: translateX(-50%);
}
</style>
<style>
@import url(./markdown.css);
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
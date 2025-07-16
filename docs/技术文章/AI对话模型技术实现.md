---
title: 从SSE到打字机——AI场景下前端的实现逻辑与实践
tags:
  - 方法论
createTime: 2025/06/21 15:10:35
permalink: /article/glqagb8o/
---
随着Deepseek的横空出世，让每个人都有了构建自己AI知识库的途径，作为一个前端开发者，完全可以通过大模型构建自己的日常学习知识库，然后自己写一个AI的交互页面构建自己的 ChatGPT ，当然说到这，肯定有人说现在有一键构建的开源项目为什么不用呢，说白了技术还是要自己实现才能更加深入地理解，并且更加灵活地运用到日常学习或者实际业务场景中去。



本篇文章只从前端的角度出发，分析实现一个AI的交互页面能用到哪些技术，最后再去实现一个AI场景页面。

当然，你也可以[点击这里](https://jyqwq.github.io/rainbow/AIChat/)直接查看本篇文章实现的页面。

如果打不开，这里还有贴心国内服务器的[备用链接](https://file.40017.cn/baoxian/rainbow/AIChat/index.html)。

*<u>PS：上面两个演示链接都是用 `vuepress` 实现的个人博客，感觉用这套框架实现自定义组件里面的坑还挺多了，有机会可以再写一篇关于 `vuepress` 的开发避坑文章。</u>*



当然，关于IM的交互逻辑在我之前的文章 [【从零开始实现一个腾讯IM即时通讯组件（无UI设计方案）~】](https://juejin.cn/post/7329036627606913036)中已经详细描述了实现过程，所以，这篇文章就从已经实现了IM交互的页面基础上开始实现AI场景下的IM。



### 技术选型



涉及到AI场景必然会联想到打字机效果的流式输出文本，那么前端实现这种效果有哪些方式呢？



#### 协议对比

首先最简单的，通过轮询接口不断获取数据，其次通过`websocket`不断获取监听到的数据，最后通过服务端消息推送获取数据。这三种思路对应着三种通讯协议：HTTP、WebSocket、SSE。

先对比一下这三种协议：



**基本概念与通信模式**

| 特性         | **HTTP**                   | **SSE (Server-Sent Events)**   | **WebSocket**                |
| ------------ | -------------------------- | ------------------------------ | ---------------------------- |
| **协议类型** | 无状态的请求 - 响应协议    | 基于 HTTP 的单向事件流协议     | 基于 TCP 的全双工实时协议    |
| **通信方向** | 客户端→服务器（单向）      | 服务器→客户端（单向）          | 双向（全双工）               |
| **连接特性** | 短连接（每次请求新建连接） | 长连接（单次请求，持续响应）   | 长连接（一次握手，持续通信） |
| **发起方式** | 客户端主动请求             | 客户端主动请求，服务器持续推送 | 客户端发起握手，后续双向通信 |
| **典型场景** | 静态资源请求、API 调用     | 实时通知、股票行情、新闻推送   | 实时聊天、在线游戏、协作工具 |



**技术细节对比**

| 特性             | **HTTP**                | **SSE**                     | **WebSocket**             |
| ---------------- | ----------------------- | --------------------------- | ------------------------- |
| **协议基础**     | HTTP/1.1 或 HTTP/2      | HTTP/1.1 或 HTTP/2          | WebSocket 协议 (RFC 6455) |
| **端口**         | 80 (HTTP) / 443 (HTTPS) | 80/443                      | 80 (ws) / 443 (wss)       |
| **数据格式**     | 文本、JSON、二进制等    | 纯文本（text/event-stream） | 文本或二进制（帧格式）    |
| **二进制支持**   | 支持，但需额外处理      | 不支持（需编码为文本）      | 原生支持                  |
| **自动重连**     | 否（需客户端实现）      | 是（内置机制）              | 否（需手动实现）          |
| **心跳机制**     | 否（需轮询）            | 否（需自定义）              | 是（Ping/Pong 帧）        |
| **浏览器兼容性** | 全兼容                  | 现代浏览器（IE 不支持）     | 现代浏览器（IE 10+）      |



**性能与效率**

| 特性              | **HTTP**                     | **SSE**                  | **WebSocket**            |
| ----------------- | ---------------------------- | ------------------------ | ------------------------ |
| **连接开销**      | 高（每次请求需重新建立连接） | 中（一次连接，长期保持） | 低（一次握手，持续通信） |
| **协议 overhead** | 高（HTTP 头信息冗余）        | 低（仅初始头）           | 中（帧头开销较小）       |
| **实时性**        | 低（依赖客户端轮询）         | 高（服务器主动推送）     | 极高（双向实时）         |
| **带宽利用率**    | 低（轮询导致无效请求）       | 中（单向持续传输）       | 高（按需双向传输）       |
| **延迟**          | 高（请求响应周期）           | 中（推送延迟）           | 低（长连接直接通信）     |



#### API选择



再来回看一下我们的需求，AI场景说白了一问一答的方式，那么我们希望发送一次请求后，能够持续获取数据，本次请求后端也只需要知道我的问题即可，不需要和前端进行其他交互，所以 `SSE` 在这种场景下的优势就显而易见了。



前端要在**浏览器**中实现 `SSE` 的方式有两种：

- `EventSource` API
- `fetch` API

`EventSource` 和 `fetch` 都是现代 Web 开发中用于与服务器通信的 API。

| 特性           | **EventSource (SSE)**        | **Fetch API**                |
| -------------- | ---------------------------- | ---------------------------- |
| **通信模式**   | 单向（服务器→客户端）        | 双向（请求→响应）            |
| **连接特性**   | 长连接（持续接收服务器推送） | 短连接（每次请求新建连接）   |
| **数据流类型** | 事件流（持续不断）           | 一次性响应（请求完成即结束） |
| **数据格式**   | 文本（事件流格式）           | 任意（JSON、Blob、文本等）   |
| **自动重连**   | 内置支持（自动重连机制）     | 需手动实现                   |



`EventSource` API实现了 `SSE` 。换句话说 `EventSource` API是 `Web` 内容与服务器发送事件通信的接口。一个`EventSource` 实例会对HTTP服务器开启一个持久化的连接，以 `text/event-stream` 格式发送事件，此连接会一直保持开启直到通过调用 `EventSource.close()` 关闭。

但是它有一些限制：

- 无法传递请求体 `request body` ，必须将执行请求所需的所有信息编码到 URL 中，而大多数浏览器对 URL 的长度限制为 2000 个字符。
- 无法传递自定义请求头。
- 只能进行 GET 请求，无法指定其他方法。
- 如果连接中断，无法控制重试策略，浏览器会自动进行几次尝试然后停止。



而AI场景常常会有一些其他需求，如上文记忆、接口 `token` 验证等等，于是 `fetch` 成了我们的最佳选择。

`fetch` API可以通过设置 `headers` 支持流式数据的接收，然后通过 `ReadableStreamDefaultReader` 对象，逐块读取响应的数据。



#### 大模型选择



作为前端开发我们更注重于模型的定制化配置和页面的展示效果与交互，通过第三方模型可以快速满足我们的需求，这里我选用的是[阿里云百炼](https://bailian.console.aliyun.com/)。

它直接提供了支持流式输出的接口，只需要在请求头加上 `X-DashScope-SSE:true` 。比较坑的是阿里云文档里面只提供了 `node` 的写法，实际浏览器中 `axios` 并不支持流式传输。

![image-20250621145616487](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20250621145616487.png)



### API解析



#### AbortController

前面我们说到 `SSE` 的数据传输是单向的，有时候我们会想中断推送信息的接收，实际需求就是中断AI当前回答，所以我们需要一个控制器来更加精细地控制我们的请求。

`AbortController` 对象的作用是对一个或多个 Web 请求进行中止操作，像 `fetch` 请求、`ReadableStream` 以及第三方库的操作都可以取消。

核心机制：借助 `AbortSignal` 来实现操作的中止。`AbortController` 会生成一个信号对象，该对象可被传递给请求，当调用 `abort() `方法时，就会触发请求的取消操作。



有了这个API我们就可以实现中断回答按钮的实现。

```js
const controller = new AbortController()
const response = await fetch(
  url: 'url',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer token`,
      'X-DashScope-SSE': 'enable', // 允许实时推送
    },
    signal: controller.signal, // 信号对象绑定请求
    body: "{...}",
  }
)

setTimeout(()=> controller.abort(), 1000) // 一秒钟后自动中断请求
```



#### Reader

在请求发出后，我们需要一个能持续获取推送信息的入口，`fetch` 的 `response.body.getReader` 是 `JavaScript` 中用于处理 `fetch` 请求响应流的方法，它允许你以可控的方式逐块读取响应数据，而非一次性处理整个响应。这在处理大文件下载、实时数据流（如视频、SSE）或需要渐进式解析数据的场景中特别有用。 

```js
// 获取一个 ReadableStreamDefaultReader 对象，用于逐块读取响应的二进制数据（Uint8Array）。
const reader = response.body.getReader()

while (true) {
  // 读取数据块 流是一次性的，读取完成后无法再次读取
	const {done, value} = await reader.read();
  if (done) {
    console.log('流读取完成');
    break;
  }
}

```

循环调用 `read()` 以达到获取完整数据的需求，根据 `done` 判断是否已经读取完毕。



#### TextDecoder

`TextDecoder` 是 `JavaScript` 中用于将二进制数据（如 `ArrayBuffer` 或 `Uint8Array`）解码为人类可读的文字字符串的内置对象。它支持多种字符编码（如 `UTF-8`、`ISO-8859-1`、`GBK` 等），是处理网络响应、文件读取等二进制数据转换的标准工具。

```js
// 任意二进制数据
const value = ...

// 流式解码：支持分块处理二进制数据（通过多次调用 decode 方法）。
const decoder = new TextDecoder('UTF-8')
// 解码二进制数据为文本
const chunk = decoder.decode(value, { stream: true })
```

值得注意的是 `decode` 的 `stream` 参数设置为 `true` ，这是为了防止乱码的情况，因为我们知道 `UTF-8` 是一种变长编码，**ASCII 字符（0-127）用 1 个字节表示**，而其他字符（如中文、 emoji）可能用 **2-4 个字节**表示。例如：

- `中` 的 UTF-8 编码是 `[228, 184, 150]`（3 个字节）。
- 😊 的 UTF-8 编码是 `[240, 159, 152, 138]`（4 个字节）。

当数据**分块传输**时，一个字符可能被截断在不同的块中。例如：

```plaintext
块1: [228, 184]    // "中" 的前两个字节（不完整）
块2: [150]         // "中" 的最后一个字节
```

`stream` 选项决定了解码器如何处理可能不完整的多字节字符：

| `stream` 值 | 行为描述                                                     |
| ----------- | ------------------------------------------------------------ |
| `false`     | 默认值。假设输入是**完整的**，直接解码所有字节。若遇到不完整字符，会用 `�` 替换。 |
| `true`      | 假设输入是**数据流的一部分**，保留未完成的多字节字符，等待后续数据。 |

实际情况可以参考下段代码：

```js
// 错误情况
const decoder = new TextDecoder();
const chunk1 = new Uint8Array([228, 184]); // "中" 的前两个字节
const chunk2 = new Uint8Array([150]);      // "中" 的最后一个字节

console.log(decoder.decode(chunk1)); // 输出: "�"（错误：截断的字符被替换为乱码）
console.log(decoder.decode(chunk2)); // 输出: "�"（错误：单独的第三个字节无法组成有效字符）

// 正确情况

const decoder = new TextDecoder();
const chunk1 = new Uint8Array([228, 184]); // "中" 的前两个字节
const chunk2 = new Uint8Array([150]);      // "中" 的最后一个字节

console.log(decoder.decode(chunk1, { stream: true })); // 输出: ""（无输出，保留未完成字符）
console.log(decoder.decode(chunk2));                   // 输出: "中"（合并后正确解码）
```





### 处理流式输出



结合上述API的分析，`fetch` 实现处理流式数据的代码如下：

```js
const controller = new AbortController()

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

const decoder = new TextDecoder('UTF-8')
const reader = response.body.getReader()

while (true) {
  const {done, value} = await reader.read();

  if (done) {
    console.log('流读取完成');
    // 中断fetch请求
    controller.abort()
    // 资源释放：释放读取器锁
    reader.releaseLock()
    break;
  }

  // 解码二进制数据为文本
  const chunk = decoder.decode(value, { stream: true })
  console.log('chunk:===>', chunk)
}
```



### 处理流式数据



通过 `reader` 读取到的数据经过 `decoder` 处理后格式如下：

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"session_id":"0837b503363c4525a6609f868f3f6afa","finish_reason":"null","text":"我是","reject_status":false},"usage":{"models":[{"input_tokens":370,"output_tokens":1,"model_id":"deepseek-v3"}]},"request_id":"ecea2ce7-3867-9074-aa67-92b39ba9253a"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"session_id":"0837b503363c4525a6609f868f3f6afa","finish_reason":"null","text":"你的","reject_status":false},"usage":{"models":[{"input_tokens":370,"output_tokens":2,"model_id":"deepseek-v3"}]},"request_id":"ecea2ce7-3867-9074-aa67-92b39ba9253a"}
```

当然这个是阿里云的返回格式，但流式数据格式都大差不差，接下来我们来分析这段文本。

首先，`reader` 获取的数据可能会有多段，如上文中的就是 `id:1` 和 `id:2` 两段数据。

其中关键字段为：`data.output.text` ，所以我们需要根据返回数据的结构特点通过正则把有效信息给过滤出来。

```js
// 全局贪婪匹配 "text":" 到 ","reject_status": 之间的内容，确保多段数据也能准确提取所有的有效信息
const regex = /"text":"(.*?)","reject_status":/gs;
```

这里使用正则而不是 `JSON` 化的原因是**流式数据的处理讲究高效与准确**，`JSON` 化更加地消耗性能，而且存在异常报错的可能，为了最大可能保证主流程的持续输出，用正则是更优的选择。当然具体业务场景具体处理，这里仅作个人见解。



根据上述正则，实现一个数据处理函数：

```js
const extractText = (jsonString) => {
  try {
    const regex = /"text":"(.*?)","reject_status":/gs;
    let match;
    let result = '';
    // 利用regex.exec()在字符串里循环查找所有匹配结果，把每次匹配得到的捕获组内容（也就是text字段的值）添加到result字符串中。
    while ((match = regex.exec(jsonString)) !== null) {
      // 将字符串里的\n转义序列转换为真正的换行符，把\"转义序列还原为普通的双引号。
      result += match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
    return result
  } catch (error) {
    console.log('error', error)
    return ''
  }
}
```



最后把数据处理函数加到流式输出代码中，通过缓存持续获取有用的信息：

```js
...
// 用于累计接收到的数据
let accumulatedText = ''

while (true) {
  const {done, value} = await reader.read();

  if (done) {
    ...
    break;
  }

  const chunk = decoder.decode(value, { stream: true })
  // 累加并渲染数据
  const newText = extractText(chunk)
  if (newText) {
  	accumulatedText += newText
  }
}
```



### 转换MD文本



这里用到几个库来实现：

- `markdown-it` 一个快速、功能丰富的 Markdown 解析器，基于 JavaScript 实现。它的主要作用是把 Markdown 文本转换成 HTML。
- `@vscode/markdown-it-katex` VS Code 团队开发的插件，用于在 Markdown 中渲染 LaTeX 数学公式，它集成了 KaTeX 这个快速的数学公式渲染引擎。
- `markdown-it-link-attributes` 为 Markdown 中的链接添加自定义属性，比如为外部链接添加`target="_blank"`和`rel="noopener noreferrer"`属性。
- `mermaid-it-markdown` 用于在 Markdown 中集成 Mermaid 图表，Mermaid 是一种用文本语法描述图表的工具。



#### 三方库使用

结合上述各种库结合，处理接口返回的信息流：

```js
import MarkdownIt from 'markdown-it'
import MdKatex from '@vscode/markdown-it-katex'
import MdLinkAttributes from 'markdown-it-link-attributes'
import MdMermaid from 'mermaid-it-markdown'
import hljs from 'highlight.js'

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
mdi.use(MdLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } }).use(MdKatex).use(MdMermaid)

// 实现代码块快速复制
function highlightBlock(str, lang) {
  return `<pre class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-block-header__lang">${lang}</span>
                <span class="code-block-header__copy">复制代码</span>
            </div>
            <code class="hljs code-block-body ${lang}"><br>${str}</code>
          </pre>`
}

const renderToAI = (text) => {
  // 对数学公式进行处理，自动添加 $$ 符号
  const escapedText = escapeBrackets(escapeDollarNumber(text))
  return mdi.render(escapedText)
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
```



#### 复制代码块

快速复制代码实现：

```js
// 聊天列表主体元素
const textRef = ref()

// 构建textarea，将内容复制到剪切板
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

// 为所有的复制代码按钮添加复制事件
const addCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.nextElementSibling?.textContent
        if (code) {
          copyToClip(code).then(() => {
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

// 移除页面中所有的复制事件
const removeCopyEvents = () => {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => { })
    })
  }
}

// 在合适的生命周期里注册或卸载重新事件

// 可以在流式输出完成，页面渲染完成的时候手动调用，避免性能浪费，更加合理
onUpdated(() => {
  addCopyEvents()
})

onUnmounted(() => {
  removeCopyEvents()
})
```



#### 自定义MD样式

MD样式：

```css
.ai-message {
    background-color: transparent;
    font-size: 14px;
}
.ai-message p {
    white-space: pre-wrap;
}
.ai-message ol {
    list-style-type: decimal;
}
.ai-message ul {
    list-style-type: disc;
}
.ai-message pre code,
.ai-message pre tt {
    line-height: 1.65;
}
.ai-message .highlight pre,
.ai-message pre {
    background-color: #fff;
}
.ai-message code.hljs {
    padding: 0;
}
.ai-message .code-block-wrapper {
    position: relative;
    padding: 0 12px;
    border-radius: 8px;
}
.ai-message .code-block-header {
    position: absolute;
    top: 5px;
    right: 0;
    width: 100%;
    padding: 0 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: #b3b3b3;
}
.ai-message .code-block-header__copy {
    cursor: pointer;
    margin-left: 0.5rem;
    user-select: none;
}
.ai-message .code-block-header__copy:hover {
    color: #65a665;
}
.ai-message div[id^='mermaid-container'] {
    padding: 4px;
    border-radius: 4px;
    overflow-x: auto !important;
    background-color: #fff;
    border: 1px solid #e5e5e5;
}
.ai-message li {
    margin-left: 16px;
    box-sizing: border-box;
}
```



最后，把处理函数追加到处理流式数据后面：

```js
let mdHtml = ''

...
const chunk = decoder.decode(value, { stream: true })
const newText = extractText(chunk)
if (newText) {
  accumulatedText += newText
  mdHtml += renderToAI(accumulatedText)
}
```



### 打字机



到目前为止我们已经流式地拿到了接口返回的数据并且转换成了页面可以展示的MD风格HTML字符串。

打字机的基本思路就是按照一定频率把内容添加到页面上，并且在内容最前面加个打字的光标。



直接上代码：

```vue
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
```



我们只需要把上述转换的MD文本传入这个组件就能实现打字机效果。

```vue
<temlate>
	<div class="ai-message">
    <TypingEffect :text="text" :showCursor="!ready" :break="break" @update="updateAIText" @ok="textAllShow" />
  </div>
</temlate>
```



需要注意的是，打字机打印的速度是按照恒定速度执行的，流式数据是不规则时间返回的，有可能返回很快，也有可能返回很慢，所以两边就会有时间差。

这就造成了一种现象，有时候我们点了停止回答的按钮，页面上还在不断输出内容，好像没有打断这次回答，这里我们只需要在点击停止回答的时候终止打字机的轮询，直接展示完整数据即可。



最后优化显示，需要自动滚动到底部：

```js
const scrollToBottom = () => {
  try {
    const { height } = textRef.value.getBoundingClientRect()
    textRef.value.scrollTo({
      top: textRef.value.scrollHeight - height,
      behavior: 'smooth',
    })
  } catch (e) {}
}
```



### 总结



前端AI场景下总结来说就两个平时不常见的技术点：

- 流式输出
- 请求中断

当然本篇文章只是实现了基本的AI场景，像上下文记忆、多对话框以及更大模型的微调等等并未涉及到，这些更加深入地功能，可以后面慢慢研究，那么，这次就到这里~


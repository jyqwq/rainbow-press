---
title: 从零开始实现一个腾讯IM即时通讯组件（无UI设计方案）~
tags:
  - 方法论
createTime: 2024/01/14
permalink: /article/fpy1f9jm/
---
# 腾讯IM概述

腾讯是国内最早也是最大的即时通信开发商，QQ 和微信已经成为每个互联网用户必不可少的应用。顺应行业数字化转型的趋势，腾讯云将高并发、高可靠的即时通信能力以 SDK 和 REST API的形式进行开放，推出即时通信 IM 产品。开发者可以通过简易的方式将腾讯云提供的 IM SDK 集成进自有应用中，配合服务端 REST API 调用，即可轻松拥有微信和 QQ 一样强大的即时通信能力。即时通信 IM 服务和应用之间的交互如下图所示：


![58a635188372af60f71c7aa1716390db.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-181.png)

腾讯即时通讯IM提供了两种接入方式：

*   含UI集成方案
*   无UI集成方案

简单说一下这两种的优劣，含UI集成方案：

*   接入快速，功能齐全
*   UI风格和功能不能定制
*   组件代码风格无法适配已有项目，代码写起来有割裂感，后期维护也困难
*   对于组件内在逻辑没法完整梳理，遇到缺陷就无法快速定位修改

无UI集成方案：

*   仅使用API接入需要的功能，代码简洁
*   整个组件的代码风格与项目保持一致，逻辑清晰，维护起来方便
*   需要自己设计UI
*   需要自己实现即时通讯的基础逻辑

# IM框架设计

简单来说，IM最核心的就两个组件：聊天框与消息输入框。

其中，聊天框负责聊天信息的渲染，消息输入框负责文本、图片、文件、表情等等信息的输入与发送，所以最外层的组件就两个：

```vue
<template>
  <div>
    <ChatContent />
    <ChatFooter />
  </div>
</template>
```

## 组件列表

聊天框组件包括：

*   查看更多消息 `MessageLoadMore`

*   消息渲染 `MessageItem`
  *   消息时间戳 `MessageTimestamp`
  *   系统提示信息 `MessageTip`
  *   聊天气泡（头像、昵称、消息状态、消息布局样式）`MessageBubble`
  *   消息右键菜单 `MessageTool`
  *   文本信息 `MessageText`
  *   加载信息 `ProgressMessage`
  *   图片信息 `MessageImage`
  *   文件信息 `MessageFile`
  *   视频信息 `MessageVideo`
  *   撤回信息 `MessageRevoked`

*   滚动按钮 `ScrollButton`

消息输入框包括：

*   消息输入工具栏 `MessageInputToolbar`
  *   表情输入 `EmojiPicker`
  *   本地图片 `ImageUpload`
  *   本地文件 `FileUpload`
  *   本地视频 `VideoUpload`
  *   语音通话 `VoiceCall`
  *   视频通话 `VideoCall`
*   消息编辑器 `MessageInputEditor`

## 逻辑图

其实在自己设计IM的框架逻辑的时候也仔细阅读了腾讯集成UI的IM组件源码，参考了其中的设计方式，因为想实现的只是基础功能，所以消息组件中移除了很多多余的功能（如：@信息），监听的事件也不用那么多，一个会话列表更新事件和一个消息回撤事件就可以成为整个IM框架的发动机，再通过统一的消息发送管理和发送中消息队列完成整个框架的回路。


![image-20240120220419139.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-182.png)

# 聊天框功能详述

聊天框主要负责消息列表的渲染，以及消息发出后的后续操作，最基本的功能包括几种常见消息的渲染、左右消息展示的布局，但是只实现这些会显得聊天框很简陋单调，所以还是要把很多细节功能实现，让用户在使用过程中感觉和常见的微信、QQ的操作逻辑是一致的。

## 查看更多消息

`getMessageList`接口可以获取当前会话最近15条的聊天记录，其中返回值的`isCompleted`字段表明是否还有历史消息。

```ts
export interface IMResponseData {
  /** 消息列表 */
  messageList: any[]
  /** 用于续拉，分页续拉时需传入该字段 */
  nextReqMessageID: string
  /** 表示是否已经拉完所有消息 */
  isCompleted: boolean
}
```

所以`isCompleted`为`false`时需要显示查看更多消息按钮：

```vue
<div v-if="!isCompleted" @click="getMoreMessageList">
    <template v-if="loadMoreLoading">
      <Icon icon="eos-icons:three-dots-loading" color="#38bdf8" />
    </template>
    <template v-else>
      <Icon icon="ant-design:clock-circle-twotone" color="#38bdf8" />
      <div>查看更多消息</div>
    </template>
</div>
```


![image-20240114110640316.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-183.png)

其实这里还有一个逻辑，当点击查看更多消息按钮的时候滚动条一定实在最上面的，所以新消息刷新出来直接就显示到最上面的消息了，这里需要一个方法去记住上一次看到的信息的位置，然后自动滚动回去：

```typescript
  // 滚动到指定消息
  const scrollToPosition = async (config: ScrollConfig = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(() => {
        // 每个消息都有自己的ID，通过ID找到dom
          const targetMessageDom = document.querySelector(`#tui-${config.scrollToMessage}`)
          if (targetMessageDom?.scrollIntoView) {
            targetMessageDom.scrollIntoView({ behavior: 'smooth' })
          }
        resolve()
      })
    })
  }
```

```typescript
	// 收到信息更新后用当前消息列表的第一条数据的ID调用此方法
  const currentLastMessageID = messageList.value[0].ID // 未更新前取出ID
  messageList.value = imResponse.data.messageList.concat(messageList.value) // 更新消息列表
  scrollToPosition({ scrollToMessage: preLastMessageID }) // 调用方法，会在列表渲染完成后自动滚动到对应消息
```

但是仅仅这样会有一个问题，就是当加载到图片信息的时候，由于图片加载是异步的，所以初始高度会缺失，加载完成后又会撑起容器，会造成滚动的位置不准确，所以我们要在图片消息渲染的时候增加一个初始高度解决，具体写法在下面的**图片信息**中叙述。

## 消息渲染组件

消息渲染组件是聊天框最核心的组件，它负责所有类型消息的渲染以及消息显示的布局。

```vue
<template v-for="(item, index) in messageList" :key="index">
    <MessageItem :item="item" />
</template>
```

### 消息时间戳

聊天框中的消息时间显示不是简单的一条信息显示一个时间，其内在逻辑是N分钟内的消息都显示在一个时间戳下，如图所示：


![image-20240114111403442.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-184.png)

同样，时间显示的格式也不是简单的年月日格式：

*   今天显示 `hh:mm`
*   昨天显示`昨天 hh:mm`
*   一周内显示 `星期 hh:mm`
*   超过一周，且在本年显示 `月/日 hh:mm`
*   不在本年显示`年/月/日 hh:mm`

```typescript
  function calculateTimestamp(timestamp: number): string {
    const todayZero = new Date().setHours(0, 0, 0, 0)
    const thisYear = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime()
    const target = new Date(timestamp)

    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay

    const diff = todayZero - target.getTime()

    function formatNum(num: number): string {
      return num < 10 ? '0' + num : num.toString()
    }

    if (diff <= 0) {
      // today, only display hour:minute
      return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`
    } else if (diff <= oneDay) {
      // yesterday, display yesterday:hour:minute
      return `昨天 ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`
    } else if (diff <= oneWeek - oneDay) {
      // Within a week, display weekday hour:minute
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const weekday = weekdays[target.getDay()]
      return `${weekday} ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`
    } else if (target.getTime() >= thisYear) {
      // Over a week, within this year, display mouth/day hour:minute
      return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
        target.getHours(),
      )}:${formatNum(target.getMinutes())}`
    } else {
      // Not within this year, display year/mouth/day hour:minute
      return `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} ${formatNum(
        target.getHours(),
      )}:${formatNum(target.getMinutes())}`
    }
  }
```

### 系统提示信息

系统消息是来自非用户的消息：

```vue
<template>
  <MessageTip
    v-if="item.type === TYPES.MSG_GRP_TIP"
    :content="item.payload"
  />
</template>
```

系统信息样式如图所示：


![image-20240114115149048.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-185.png)

### 聊天气泡

#### 布局

聊天气泡组件是消息渲染组件的核心，控制了样式的布局（头像、昵称、消息）以及消息状态的管理（敏感信息失败提示、消息加载中、发送失败）。

聊天气泡最显著的提点就是自己的消息是反转右对齐的，所以要用到几个css属性来实现：

```css
.flex {
    display: flex; /* 该元素使用流式布局（块和内联布局）来排布它的内容。 */
}
.flex-row-reverse {
    flex-direction: row-reverse; /* flex 容器的主轴被定义为与文本方向相同。主轴起点和主轴终点与内容方向相反。 */
}
.justify-start {
    justify-content: flex-start; /* 从行首起始位置开始排列 */
}
```

而消息数据是通过`flow`字段来判断是否是自己发出的消息，所以代码示例如下：

```vue
<template>
	<div class="flex" :class="item.flow === 'in' ? '' : 'flex-row-reverse justify-start'">...</div>
</template>
```

#### 敏感信息

图片、语音、视频消息是否被标记为[有安全风险的消息](https://web.sdk.qcloud.com/im/doc/v3/zh-cn/Message.html)也需要做处理，通过消息数据的`hasRiskContent`字段判断，要显示一个无法查看的图片占位与提示，代码如下：

```vue
<img
  v-if="item.type === TYPES.MSG_IMAGE && item.hasRiskContent"
  :src="riskImageReplaceUrl"
  alt="图片无法查看"
/>
<!-- 敏感信息失败提示 -->
<div v-if="!item.hasRiskContent">
	{{ riskContentText }}
</div>
```


![image-20240114163538954.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-186.png)

#### 信息加载中

当消息状态`status`为`unSend`时表明信息未发送或者说是在发送中，在普通的文本消息气泡应该有加载的动画表明当前信息在发送中：

```vue
<!-- 加载图标 -->
<Icon
    v-if="item.status === 'unSend' && needLoadingIconMessageType.includes(item.type)"
    icon="eos-icons:three-dots-loading"
    :color="item.flow === 'in' ? '#38bdf8' : '#d4d4d8'"
    size="24"
/>
```


![image-20240114163901759.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-187.png)

#### 发送失败&重发

当消息状态`status`为`fail`时应该有提示和重新发送的按钮：

```vue
<!-- 发送失败 -->
<Tooltip v-if="item.status === 'fail' || item.hasRiskContent" @click="resendMessage">
    <template #title>发送失败</template>
    !
</Tooltip>
```


![image-20240114164338459.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-188.png)

### 消息右键菜单

消息发出后涉及消息的管理，比如撤回、删除、复制等功能，所以要对消息显示区域监听右键操作并弹出菜单选择：

```vue
<Dropdown
    :dropMenuList="MessageDropMenuList"
    :trigger="['contextmenu']"
    placement="bottom"
    overlayClassName="message__dropdown"
    @menu-event="handleMenuEvent"
>
    <slot></slot>
</Dropdown>
```


![image-20240114164821879.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-189.png)

### 文本信息

文本信息渲染相对简单，需要注意的是文本虽然有格式，但是没有选择`v-html`的方式渲染，因为用户输入的内容是不可靠的，为了预防前端XSS攻击，所以只是把输入的内容直接放到页面上，不做解析。

```vue
<div class="font-mono">{{ payload.text }}</div>
<!-- 有风险的渲染方式 -->
<div class="font-mono" v-html="payload.text"></div>
```

当然文本信息中还在存换行符`\n`以及`emoji`表情信息，类似于`[调皮]`这种格式的文本，所以要写一个方法，处理这些信息：

```typescript
  const text = computed(() => {
    const brackets = parseBrackets(payload.value.text || '')
    return brackets.map((item: string) => {
      if (item === '\n') {
        return {
          name: 'br',
          text: '',
          src: '',
        }
      } else if (item.startsWith('[') && item.endsWith(']') && basicEmojiMap[item]) {
        return {
          name: 'img',
          text: item,
          src: basicEmojiUrl + basicEmojiMap[item],
        }
      } else {
        return {
          name: 'text',
          text: item,
        }
      }
    })
  })
  
  const parseBrackets = (s: string) => {
    // 正则表达式用于匹配普通文本、换行符和特定格式的表情
    const regex = /(\[.*?]|\n|[^\n\[\]]+)/g
    const matches = s.match(pattern)
    return matches || []
  }
```

基于上面的数据处理，需要换一种渲染方式：

```vue
  <div class="font-mono">
    <template v-for="(item, index) in text" :key="index">
      <br v-if="item.name === 'br'" />
      <span v-else-if="item.name === 'text'">{{ item.text }}</span>
      <img v-else class="emoji" :src="item.src" :alt="item.text" />
    </template>
  </div>
```


![image-20240115203144206.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-190.png)

### 加载信息

加载信息与上面提到的信息加载中的状态不同，信息加载中只是描述信息已经发出，服务器还没有接收到这一响应过程，加载信息是给文件流信息一个进度条，显示文件上传进度的组件，覆盖在需要显示进度的消息上：

```vue
<ProgressMessage v-if="item.type === TYPES.MSG_IMAGE" :item="item">
	<MessageImage :payload="item.payload" />
</ProgressMessage>
```


![image-20240114165855520.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-191.png)

但是，文件信息上传的进度是通过回调的方式回传的，处理起来很麻烦，还存在响应式的问题，所以前端会根据文件大小实时计算大致的上传时间，实际效果来看很流畅，没什么问题，简化了很多代码逻辑：

```js
/** 模拟上传进度 假设网速为512kb/s（腾讯IM基础服务的上传速度有限制，差不多这么多） */
function simulateFileUpload(fileSize: number, callback: { (p: any): void }) {
    const totalUploadTime = fileSize / (1024 * 512) // 总上传时间，单位为秒
    const totalIntervals = totalUploadTime * 10 // 总的更新次数
    let currentInterval = 0

    timer = setInterval(() => {
        currentInterval++
        const progress = (currentInterval / totalIntervals) * 100
        // 确保进度不超过99%
        callback(parseInt(Math.min(progress, 99)))

        if (currentInterval >= totalIntervals) {
        	clearInterval(timer) // 完成上传后清除定时器
        }
    }, 100)
}
```

### 图片信息

图片信息的显示有两个注意点，一个是需要预览功能，一个是正常显示压缩图，预览显示原图：

```ts
export interface ImagePayload {
  /** 图片唯一标识 */
  uuid: string
  /** 图片格式类型，JPG/JPEG = 1，GIF = 2，PNG = 3，BMP = 4，其他 = 255 */
  imageFormat: 1 | 2 | 3 | 4 | 255
  /** 图片信息 */
  imageInfoArray: ImageInfo[]
}
export interface ImageInfo {
  /** 图片类型，0 原图 1 198p压缩图 2 720p压缩图 */
  type: 0 | 1 | 2
  /** 图片宽度 */
  width: number
  /** 图片高度 */
  height: number
  /** 图片大小 单位：Byte */
  size: number
  /** 图片地址，可用于渲染 */
  url: string
}
```

```vue
<template>
  <AImage :src="imgSrc.url" :preview="previewType" :fallback="imgLoadFail" />
</template>
<script>
  const imgSrc = computed(
    () =>
      payload.value.imageInfoArray.find((item) => item.type === 1) ||
      payload.value.imageInfoArray[0],
  )
  const previewType = computed(() => ({
    src:
      payload.value.imageInfoArray.find((item) => item.type === 0)?.url ||
      payload.value.imageInfoArray[0].url,
  }))
</script>
```

但是仅仅是这样处理会存在一个问题，就是图片的加载是异步的，未加载的图片是没有高度的，就会造成聊天框处理滚动位置的不准确，参考MDN的建议：

> **备注：** 同时包括 `height` 和 [`width`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img#attr-width) 使浏览器在加载图像之前计算图像的长宽比。此长宽比用于保留显示图像所需的空间，减少甚至防止在下载图像并将其绘制到屏幕上时布局的偏移。减少布局偏移是良好用户体验和 Web 性能的主要组成部分。

所以在加载图片之前就要给定图片高度：

```vue
<template>
  <AImage
    :src="imgSrc.url"
    :preview="previewType"
    :height="imgSrc.height"
    fallback="imgLoadFail"
  />
</template>
```


![image-20240114171836846.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-192.png)

### 文件信息

与图片信息不同的是，文件信息需要显示文件名和文件大小，以及提供点击下载的功能：

```vue
<div title="单击下载" @click="download" >
    <Icon icon="ant-design:file-twotone" :size="40" />
    <div>
        <div>{{ item.payload.fileName }}</div>
        <div>{{ fileSize }}</div>
    </div>
</div>
```


![image-20240114172252470.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-193.png)

### 视频信息

视频消息相对于图片信息反而没那么多问题，因为`video`标签在创建的时候就会自动计算高度，唯一问题就是没有视频封面，不过我们可以给定一个默认视频封面来解决这个问题。

```vue
<video
    :src="payload.videoUrl"
    controls
    preload="metadata"
    :poster="payload.snapshotUrl || 'https://xxx/default_video.png'"
></video>
```


![image-20240120225138883.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-194.png)

### 撤回信息

撤回信息本质上就是改变了当前信息的状态，并不同于删除信息，通过监听撤回事件实现。

```vue
 <div>
    <span v-if="item.flow === 'in'">{{ item.nick || item.from }}</span>
    <span v-else-if="item.from === item.revoker">您</span>
    <span v-else-if="item.revoker">{{ item.revoker }}</span>
    <!--撤回消息时通过回调更新messageList，无法触发响应式更新，取不到最新的revoker值，所以这里需要给出一个保底值-->
    <span v-else>您</span>
    <span>撤回了一条消息</span>
  </div>
```

```ts
// 监听事件
chat.on(EVENT.MESSAGE_REVOKED, onMessageRevoked)

const onMessageRevoked = (event: { data: Message[] }) => {
    const data = event.data
    data.forEach((item) => {
        if (item.conversationID !== conversationID.value) return
        revokeMessage(item)
    })
}

const revokeMessage = (msg: Message) => {
    const { ID, revokeReason, revokerInfo, sequence } = msg
    const len = messageList.value.length
    for (let i = 0; i < len; i++) {
        // 撤回的消息是最近两分钟的，所以反向遍历效率高
        const item = messageList.value[len - i - 1]
        if (item.ID === ID || item.sequence === sequence) {
            item.isRevoked = true
            item.revokeReason = revokeReason
            item.revokerInfo = revokerInfo
            item.revoker = msg.from
            break
        }
    }
}
```


![image-20240114172252470.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-195.png)

## 滚动按钮

滚动按钮的功能主要就是控制聊天框区域的滚动相关功能：

*   滚动距离底部超过一个屏幕的距离时，聊天框右下角出现回到最新位置的按钮，点击后滚动到底部
*   输入新消息后自动滚动到最底部
*   当滚动条不在最底部时收到新消息，需要展示回到最新位置的按钮

页面布局如下：

```vue
<div id="messageScrollList" ref="messageListRef">
    <MessageLoadMore />
    <template v-for="(item, index) in messageList" :key="index">
        <MessageItem :item="item" />
    </template>
    <ScrollButton ref="scrollButtonInstanceRef" />
</div>
```

滚动到最新位置是需要计算当前滚动区域高度的，所以需要一个计算方法：

```ts
// 滚动到最新消息 messageListRef
const scrollToLatestMessage = async () => {
    const { scrollHeight } = await getScrollInfo('#messageScrollList')
    const { height } = await getBoundingClientRect('#messageScrollList')
    if (messageListRef.value) {
        messageListRef.value.scrollTo({
            top: scrollHeight - height,
            behavior: 'smooth',
        })
    }
}
```

其中计算到底部距离方法是需要暴露出来的，以供上层组件调用实时更新滚动条高度信息：

```ts
// 消息列表向上的滚动高度大于一屏时，展示滚动到最新
function judgeScrollOverOneScreen(e: Event) {
    if (typeof (e.target as HTMLElement)?.scrollTop === 'number') {
        const scrollListDom = e.target as HTMLElement
        const { height } = scrollListDom.getBoundingClientRect() || {}
        const { scrollHeight, scrollTop } = scrollListDom
        if (height && scrollHeight) {
            isScrollOverOneScreen.value = scrollTop < scrollHeight - 2 * height
        }
    }
}

defineExpose({
    judgeScrollOverOneScreen,
})
```

通过监听会话列表更新事件获取最新消息，来判断是否展示按钮：

```ts
const isExistLatestMessage = computed((): boolean => {
    const lastSuccessMessageIndex = findLastIndex(
        messageList.value,
        (message: Message) => message.status === 'success',
    )
    return (
        !!lastSuccessMessageIndex &&
        messageList?.value[lastSuccessMessageIndex]?.time < currentLastMessageTime?.value
    )
})
```


![image-20240114172252470.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-195.png)

# 消息输入框功能详述

消息输入框是比较容易错误估计难度的组件，最初设计只把输入框用`TestArea`组件实现，但是输入框能输入文本信息是远远不够的，但是输入框也不同于富文本编辑器与MD编辑器，它是独立于这两种常见编辑器之外的IM消息编辑器，虽然能找到合适的基础组件，但是还是需要自己实现其中的细节功能，比如图片、文件的粘贴，表情的渲染等等。

消息发送处理函数，负责所有类型消息的发送，统一管理方便处理消息发送的生命周期：

```typescript
import type { ITipTapEditorContent, MESSAGE_OPTIONS } from '../model'
import { message } from 'ant-design-vue'
import TencentCloudChat, { ChatSDK, Message } from '@tencentcloud/chat'

// 腾讯IM提供的特殊code值处理
export const sendMessageErrorCodeMap: Map<number, string> = new Map([
  [3123, '文本包含本地审核拦截词'],
  [4004, '图片消息失败,无效的图片格式'],
  [4005, '文件消息失败,禁止发送违规封禁的文件'],
  [7004, '文件不存在,请检查文件路径是否正确'],
  [7005, '文件大小超出了限制,如果上传文件,最大限制是100MB'],
  [8001, '消息长度超出限制,消息长度不要超过12K'],
  [80001, '消息或者资料中文本存在敏感内容,发送失败'],
  [80004, '消息中图片存在敏感内容,发送失败'],
])

/**
 * 该函数仅处理 Text Image File Video 四种消息类型
 * @param chat IM对象
 * @param messageList 待发送消息列表
 * @param currentConversationID 会话ID
 * @param beforeSend 消息发送前回调 用于把消息推送到发送中队列显示在消息列表中
 */
export const sendMessages = async (
  chat: ChatSDK,
  messageList: ITipTapEditorContent[],
  currentConversationID: string,
  beforeSend?: (msg: Message) => void,
) => {
  if (!messageList?.length) {
    message.warning('不能发送空白信息')
    return
  }
  for (const content of messageList) {
    try {
      const options: MESSAGE_OPTIONS = {
        to: currentConversationID,
        conversationType: TencentCloudChat.TYPES.CONV_GROUP,
        payload: {},
        needReadReceipt: false,
        // 上传类型消息的进度回调，由于函数是异步的所以这个回调信息很难回传到消息列表的对应消息里面去
        onProgress: () => {},
      }
      // handle message typing
      switch (content?.type) {
        case 'text':
          const textMessageContent = JSON.parse(JSON.stringify(content?.payload?.text))
          // 禁止发送空消息
          if (!textMessageContent) {
            message.warning('不能发送空白信息')
            break
          }
          options.payload = {
            text: textMessageContent,
          }
          const textMsg = chat.createTextMessage(options)
          beforeSend && beforeSend(textMsg)
          await chat.sendMessage(textMsg)
          break
        case 'image':
          options.payload = {
            file: content?.payload?.file,
          }
          const imageMsg = chat.createImageMessage(options)
          beforeSend && beforeSend(imageMsg)
          await chat.sendMessage(imageMsg)
          break
        case 'file':
          options.payload = {
            file: content?.payload?.file,
          }
          const fileMsg = chat.createFileMessage(options)
          beforeSend && beforeSend(fileMsg)
          await chat.sendMessage(fileMsg)
          break
        case 'video':
          options.payload = {
            file: content?.payload?.file,
          }
          const videoMsg = chat.createVideoMessage(options)
          beforeSend && beforeSend(videoMsg)
          await chat.sendMessage(videoMsg)
          break
        default:
          break
      }
    } catch (error: any) {
      message.error({
        content: sendMessageErrorCodeMap.get(error?.code)
          ? (sendMessageErrorCodeMap.get(error.code) as string)
          : error?.message,
        duration: 2,
      })
    }
  }
}

```

## 消息输入工具栏

消息输入工具栏集成了几种常用的工具。

### 表情输入

基础的 `emoji` 表情使用 `[龇牙]` 这种格式表示，然后通过表情地址数据表映射实现表情的展示：

```typescript
export const basicEmojiList: Array<string> = [
  '[龇牙]',
  '[调皮]',
  '[流汗]',
  '[偷笑]',
  '[再见]',
  ...
]
export const basicEmojiMap: any = {
	'[龇牙]': 'cy.png',
  '[调皮]': 'tp.png',
  '[流汗]': 'lh.png',
  '[偷笑]': 'tx.png',
  '[再见]': 'zj.png',
  ...
}
export const basicEmojiUrl = 'https://xxxxx'
```


![image-20240120224914936.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-196.png)

### 本地图片

功能相对简单，通过`input`标签获取到图片后直接调用发送消息：

```vue
<template>
  <div class="p-4px w-32px cursor-pointer" title="上传图片" @click="chooseImage">
    <Icon icon="ri:image-line" color="#d4d4d8" :size="24" />
    <input
      class="hidden"
      title="图片"
      type="file"
      data-type="image"
      accept="image/gif,image/jpeg,image/jpg,image/png,image/bmp,image/webp"
      @change="sendImageInWeb"
      ref="inputRef"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import Icon from '/@/components/Icon/src/Icon.vue'

  const emits = defineEmits(['sendImageMessage'])

  const inputRef = ref()
  const chooseImage = () => {
    if (inputRef.value?.click) {
      inputRef.value.click()
    }
  }
  const sendImageInWeb = (e: any) => {
    if (e?.target?.files?.length <= 0) {
      return
    }
    emits('sendImageMessage', {
      type: 'image',
      payload: {
        file: e.target.files[0],
      },
    })
    e.target.value = ''
  }
</script>
```

### 本地文件

功能与图片上传相似，标注一下两个代码区别：

```vue
<template>
  ...
  <input
    class="hidden"
    title="文件"
    type="file"
    data-type="file"
    accept="*"
    @change="sendFileInWeb"
    ref="inputRef"
  />
 ...
</template>
<script setup lang="ts">
  ...
  const sendFileInWeb = (e: any) => {
    ...
    emits('sendFileMessage', {
      type: 'file',
      payload: {
        file: e.target.files[0],
      },
    })
    e.target.value = ''
  }
</script>
```

### 本地视频

同本地文件上传：

```vue
<template>
  ...
  <input
    class="hidden"
    title="视频"
    type="file"
    data-type="file"
    accept="video/*"
    @change="sendVideoInWeb"
    ref="inputRef"
  />
 ...
</template>
<script setup lang="ts">
  ...
  const sendFileInWeb = (e: any) => {
    ...
    emits('sendVideoInWeb', {
      type: 'video',
      payload: {
        file: e.target.files[0],
      },
    })
    e.target.value = ''
  }
</script>
```

### 语音通话

相对来说，语音通话和视频通话的功能比即时通讯功能集中且样式简单固定，为了节省开发时间，这里使用腾讯集成的通话组件[`@tencentcloud/call-uikit-vue`](https://cloud.tencent.com/document/product/647/78742)。

虽然使用的集成UI组件在引入后还是要处理好样式的问题：

```vue
<template>
    <div
      class="tui-call-kit fixed bottom-215px right-2rem bg-gray-500 w-0 h-0 transition-all rounded-2xl"
      :class="{
        'w-16rem h-20rem': isCall === 'voice' && !isMini,
        'w-35rem h-26rem': isCall === 'video' && !isMini,
        'w-168px h-56px bg-transparent': isCall && isMini,
      }"
    >
      <TUICallKit
        :allowedFullScreen="isCall === 'video'"
        :allowedMinimized="true"
        :videoResolution="VideoResolution.RESOLUTION_720P"
        :videoDisplayMode="VideoDisplayMode.CONTAIN"
        :afterCalling="afterCalling"
        :onMinimized="onMinimized"
        @status-changed="callStatusChange"
      />
    </div>
  </div>
</template>
<script>
  ...
</script>
<style lang="less">
  .tui-call-kit {
    ...
  }
</style>
```

上面的示例代码其实就是为了解决几个问题：

*   语音通话框是浮于所有元素之上的，要保证通话框不被遮盖
*   通话框大小需要动态改变，常规通话框、最小化通话框、未通话三种状态

因为使用了集成组件，所以功能调用起来就很简单了：

```typescript
  const call = async () => {
    try {
      if (isCall.value) return
      emits('update:isCall', 'voice')
      // 初始化
      await TUICallKitServer.init({
        userID: userStore.getUserInfo?.id,
        userSig: userStore.getUsersig,
        SDKAppID: options.SDKAppID,
      })
      await TUICallKitServer.setSelfInfo({
        nickName: userStore.getUserInfo.name,
        avatar: userStore.getUserInfo.avatar,
      })
      await TUICallKitServer.call({
        userID: consultationInfo.value?.userId,
        type: TUICallType.AUDIO_CALL,
      })
    } catch (error) {
      console.error(error)
      message.error('语音通话初始化失败')
      await TUICallKitServer.destroyed()
      emits('update:isCall', false)
    }
  }
```

```typescript
  // 通话完毕后记得销毁，各种状态也要初始化
  const afterCalling = async (e) => {
    console.log('afterCalling', e)
    isCall.value = ''
    isMini.value = false
    await TUICallKitServer.destroyed()
  }
```


![image-20240120224739877.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-197.png)

### 视频通话

同语音通话，就是调用通话的时候给定的类型不同：

```typescript
TUICallKitServer.call({
    userID: consultationInfo.value?.userId,
    type: TUICallType.VIDEO_CALL,
})
```


![image-20240120224835385.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-198.png)

## 消息编辑器

消息编辑器参考了腾讯的IM组件，使用的是`@tiptap/vue-3`库实现的基本功能，简单介绍一下`tiptap`，用库作者的话就是：`A rich-text editor for Vue.js`，一个设计之初就是为了给`vue`使用的富文本编辑器，使用它的好处有：

*   基于TS编写，有良好的IDE提示
*   更多开箱即用的扩展，目前有 53 款扩展
*   完全显示的注册文档、扩展等
*   新的自定义扩展 API
*   经过良好测试的代码库

如下图所示，`tiptap`实现的输入框是一个伪输入框，通过监听按钮的点击把输入的内容转化为DOM节点渲染到输入框内实现富文本编辑。


![image-20240114220926728.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-199.png)

### 回车？换行？

常见的即时通讯，回车就是发送消息，`shift`+回车才是换行，这个逻辑要实现：

```ts
const handleEnter = (e: any) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (e.keyCode === 13 && e.shiftKey) {
    	editor?.commands?.insertContent('<p></p>')
    } else if (e.keyCode === 13) {
    	emits('sendMessage')
    }
}
```

### 图片粘贴

图片需要支持键盘快捷键粘贴到聊天框内：


![image-20240114222845709.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-200.png)

粘贴可以通过DOM节点的`@paste`事件获取粘贴的信息，然后判断文件的类型是否是图片，通过canvas渲染到输入框中：

```ts
const handleFilePaste = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
 	const files = type === e?.clipboardData?.files
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isImage = file.type.startsWith('image/')
        const fileSrc = URL.createObjectURL(file)
        editor?.commands?.insertContent({
            type: 'custom-image',
            attrs: {
            src: fileSrc,
            alt: file?.name,
            title: file?.name,
            class: 'normal',
            },
        })
    }
}
const drawFileCanvasToImageUrl = async (file: any) => {
    const { name, type } = file
    const canvas = document.createElement('canvas')
    let width = 160
    let height = 50
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    // 设置内存中的实际大小（缩放以考虑额外的像素密度）
    const scale = window.devicePixelRatio // 在视网膜屏幕上更改为 1 以查看模糊
    canvas.width = Math.floor(width * scale)
    canvas.height = Math.floor(height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return ''
    }
    // 标准化坐标系以使用 css 像素
    ctx.scale(scale, scale)
    // draw icon
    const { iconSrc, iconType } = handleFileIconForShow(type)
    const img = await addImageProcess(iconSrc, iconType)
    ctx?.drawImage(img as any, 10, 10, 30, 30)
    // draw font
    const nameForShow = handleNameForShow(name)
    ctx.fillText(nameForShow, 45, 22)
    // canvas to url
    return canvas.toDataURL()
}
```

### 文件粘贴

文件粘贴需要展示文件图标以及文件名称：


![image-20240114222722038.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-201.png)

提前准备几种常见的文件格式的图标，渲染的时候找到对应图标渲染到输入框内：

```ts
const handleFilePaste = async (e: any) => {
    ...
    const fileSrc = URL.drawFileCanvasToImageUrl(file)
    ...
}
const drawFileCanvasToImageUrl = async (file: any) => {
    const { name, type } = file
    const canvas = document.createElement('canvas')
    let width = 160
    let height = 50
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    // 设置内存中的实际大小（缩放以考虑额外的像素密度）
    const scale = window.devicePixelRatio // 在视网膜屏幕上更改为 1 以查看模糊
    canvas.width = Math.floor(width * scale)
    canvas.height = Math.floor(height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
    	return ''
    }
    // 标准化坐标系以使用 css 像素
    ctx.scale(scale, scale)
    // draw icon
    const { iconSrc, iconType } = handleFileIconForShow(type)
    const img = await addImageProcess(iconSrc, iconType)
    ctx?.drawImage(img as any, 10, 10, 30, 30)
    // draw font
    const nameForShow = handleNameForShow(name)
    ctx.fillText(nameForShow, 45, 22)
    // canvas to url
    return canvas.toDataURL()
}
```

### 添加表情

表情渲染到输入框内就是一个小图片，所以没有特殊处理：

```ts
const addEmoji = (emoji: any) => {
    editor?.commands?.insertContent({
        type: 'custom-image',
        attrs: {
            src: emoji?.url,
            alt: emoji?.name,
            title: emoji?.name,
            class: 'emoji',
        },
    })
    editor?.commands?.focus()
    editor?.commands?.scrollIntoView()
}
```

### 外部方法

消息编辑器要经常与外部组件通信，所以暴露几个常用的方法：

*   获取输入框内容 `getEditorContent`
*   添加表情 `addEmoji`
*   清空输入框 `resetEditor`
*   添加到输入框 `setEditorContent`

```vue
defineExpose({
    getEditorContent,
    addEmoji,
    resetEditor,
    setEditorContent,
})
```
# 总结

到这里一个基本的即时通讯组件也差不多完成了，可以看到的是，我们无时无刻不在使用的功能，仔细梳理一下也有很多的逻辑在里面，当然我这种实现方式只是提供一种思路，而不是完整的代码解析，实战的时候还是要根据需求的差异，制定一些定制化的功能在里面的。

最后，如果有意见或者建议，欢迎评论区讨论。
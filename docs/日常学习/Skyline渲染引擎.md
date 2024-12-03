---
title: Skyline渲染引擎
tags:
   - 技术
createTime: 2024/06/11 17:10:34
permalink: /article/ebqyg2xf/
---
# Skyline渲染引擎



## 前言

目前项目对C的项目主要是同谷鸟健康小程序，涉及到一个小程序与H5项目，目前都是使用的Vant组件库。

针对于业务侧提出的当前UI交互不流畅和难用等问题，后续可能会建立我们自己的组件库，目前搭建思路主要是：

- H5依旧使用Vant组件库，基于Vant进行二次封装，主要优化样式与交互体验。
- 小程序可以尝试使用 Skyline 渲染引擎，建立全新的组件库，这样不仅可以从底层解决现有小程序各种框架上的问题，也能创造出更多新颖的交互模式。

接下来是对 Skyline的一些简介与优势分析：



## 简介

小程序一直以来采用的都是 AppService 和 WebView 的双线程模型，基于 WebView 和原生控件混合渲染的方式，小程序优化扩展了 Web 的基础能力，保证了在移动端上有良好的性能和用户体验。Web 技术至今已有 30 多年历史，作为一款强大的渲染引擎，它有着良好的兼容性和丰富的特性。 尽管各大厂商在不断优化 Web 性能，但由于其繁重的历史包袱和复杂的渲染流程，使得 Web 在移动端的表现与原生应用仍有一定差距。

为了进一步优化小程序性能，提供更为接近原生的用户体验，小程序团队在 WebView 渲染之外新增了一个渲染引擎 Skyline，其使用更精简高效的渲染管线，并带来诸多增强特性，让 Skyline 拥有更接近原生渲染的性能体验。



## 架构

当小程序基于 WebView 环境下时，WebView 的 JS 逻辑、DOM 树创建、CSS 解析、样式计算、Layout、Paint (Composite) 都发生在同一线程，在 WebView 上执行过多的 JS 逻辑可能阻塞渲染，导致界面卡顿。以此为前提，小程序同时考虑了性能与安全，采用了目前称为「双线程模型」的架构。

在 Skyline 环境下小程序团队尝试改变这一情况：Skyline 创建了一条渲染线程来负责 Layout, Composite 和 Paint 等渲染任务，并在 AppService 中划出一个独立的上下文，来运行之前 WebView 承担的 JS 逻辑、DOM 树创建等逻辑。这种新的架构相比原有的 WebView 架构，有以下特点：

- 界面更不容易被逻辑阻塞，进一步减少卡顿
- 无需为每个页面新建一个 JS 引擎实例（WebView），减少了内存、时间开销
- 框架可以在页面之间共享更多的资源，进一步减少运行时内存、时间开销
- 框架的代码之间无需再通过 JSBridge 进行数据交换，减少了大量通信时间开销

而与此同时，这个新的架构能很好地保持和原有架构的兼容性，基于 WebView 环境的小程序代码基本上无需任何改动即可直接在新的架构下运行。WXS 由于被移到 AppService 中，虽然逻辑本身无需改动，但询问页面信息等接口会变为异步，效率也可能有所下降；为此，小程序团队同时推出了新的 [Worklet](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/worklet.html) 机制，它比原有的 WXS 更靠近渲染流程，用以高性能地构建各种复杂的动画效果。

新的渲染流程如下图所示：

![img](https://res.wx.qq.com/wxdoc/dist/assets/img/design.3c2a69c4.png)



## 特性

Skyline 以性能为首要目标，因此 CSS 特性上在满足基本需求的前提下进行了大幅精简，目前 Skyline 只保留更现代的 CSS 集合。另一方面，Skyline 又添加了大量的特性，使开发者能够构建出类原生体验的小程序。在编码上，Skyline 与 WebView 模式保持一致，仍使用 WXML 和 WXSS 编写界面。在不采用 Skyline 新增特性的情况下，适配了 Skyline 的小程序在低版本或未支持 Skyline 的平台上可无缝自动退回到 WebView 渲染。



### 支持与 WebView 混合使用

小程序支持页面使用 WebView 或 Skyline 任一模式进行渲染，Skyline 页面可以和 WebView 页面混跳，开发者可以页面粒度按需适配 Skyline。

```json
// page.json
// skyline 渲染
{
    "renderer": "skyline"
}

// webview 渲染
{
    "renderer": "webview"
}
```



### 提供更好的性能

Skyline 在渲染流程上较 WebView 更为精简，其对节点的渲染有着更精确的控制，尽量避免不可见区域的布局和绘制，以此来保证更高的渲染性能。WebView 由于其整体设计不同以及兼容性等问题，渲染流水线的实现更加冗长复杂。

在光栅化策略上，Skyline 采用的是同步光栅化的策略，WebView 是异步分块光栅化的策略。两种策略各有千秋，但 WebView 的策略存在一些难以规避的问题，例如：快速滚动会出现白屏问题；滚动过程中的 DOM 更新会出现不同步的问题，进而影响到用户体验。

在此基础上，小程序团队还进一步实现了很多优化点。

1. 单线程版本组件框架

   Skyline 下默认启用了新版本的组件框架 glass-easel，该版本适应了 Skyline 的单线程模型，使得建树流程的耗时有效降低（优化 30%-40%），同时 setData 调用也不再有通信开销和序列化开销。

2. 组件下沉

   Skyline 内置组件的行为更接近原生体验，部分内置组件（如 scroll-view、swiper 等）借助于底层实现，有更好的性能和交互体验。同时，将部分内置组件（如 view、text、image 等）从 JS 下沉到原生实现，相当于原生 DOM 节点，降低了创建组件的开销（优化了 30% 左右）。

3. 长列表按需渲染

   长列表是一个常用的但又经常遇到性能瓶颈的场景，Skyline 对其做了一些优化，使 scroll-view 组件只渲染在屏节点（用法上有一定的约束），并且增加 lazy mount 机制优化首次渲染长列表的性能，后续也计划在组件框架层面进一步支持 scroll-view 的可回收机制，以更大程度降低创建节点的开销。

4. WXSS 预编译

   同 WebView 传输 WXSS 文本不同，Skyline 在后台构建小程序代码包时会将 WXSS 预编译为二进制文件，在运行时直接读取二进制文件获得样式表结构，避免了运行时解析的开销（预编译较运行时解析快 5 倍以上）。

5. 样式计算更快

   Skyline 通过精简 WXSS 特性大幅简化了样式计算的流程。在样式更新上，与 WebView 全量计算不同，Skyline 使用局部样式更新，可以避免对 DOM 树的多次遍历。Skyline 与小程序框架结合也更为紧密，例如： Skyline 结合组件系统实现了 WXSS 样式隔离、基于 wx:for 实现了节点样式共享（相比于 WebView 推测式样式共享更为精确、高效）。在节点变更、内联样式和继承样式的更新上，Skyline 也进行了一些优化，从而保证样式计算的性能。

   此外，对于 rpx 单位，直接在样式计算阶段原生支持，这样避免了在 JS 层面做太多额外的计算。

   ```html
   <!-- 样式共享目前暂未自动识别，可手动声明 list-item 属性开启 -->
   <scroll-view type="list" scroll-y>
       <view wx:for="{{list}}" list-item>{{index}}</view>
   </scroll-view>
   ```

6. 降低内存占用

   在 WebView 渲染模式下，一个小程序页面对应一个 WebView 实例，并且每个页面会重复注入一些公共资源。而 Skyline 只有 AppService 线程，且多个 Skyline 页面会运行在同一个渲染引擎实例下，因此页面占用内存能够降低很多，还能做到更细粒度的页面间资源共享（如全局样式、公共代码、缓存资源等）。



### 根除旧有架构的问题

在基于 Web 体系的架构下，小程序的部分基础体验会受限于 WebView 提供的能力（特别是 iOS WKWebView 限制更大一些），使得一些技术方案无法做得很完美，留下一些潜在的问题。



1. 原生组件同层渲染更稳定

   iOS 下原生组件[同层渲染的原理](https://developers.weixin.qq.com/community/develop/article/doc/000c4e433707c072c1793e56f5c813)先前有介绍过，本质上是在 WKWebView 黑盒下一种取巧的实现方式，并不能完美融合到 WKWebView 的渲染流程，因此很容易在一些特殊的样式发生变化后，同层渲染会失效。在 Skyline 下可以很好地融合到渲染流程中，因此会更稳定。

2. 无需页面恢复机制

   iOS 下 WKWebView 会受操作系统统一管理，当内存紧张时，操作系统就会将不在屏的 WKWebView 回收，会使得小程序除前台以外的页面丢失，虽然在页面返回时，对页面做了恢复，但页面的状态并不能 100% 还原。在 Skyline 下则不再有该问题。

3. 无页面栈层数限制

   由于 WebView 的内存占用较大，页面层级最多有 10 层，而 Skyline 在内存方面更有优势，因此在连续 Skyline 页面跳转（复用同一引擎实例）的情况下，不再有该限制。



### 全新的交互动画体系

要达到类原生应用的体验，除渲染性能要好外，做好交互动画也很关键。在 Web 体系下，难以做到像素级可控，交互动画衔接不顺畅，究其原因，在于缺失了一些重要的能力。为此，Skyline 提供一套全新的交互动画能力。



1. Worklet 动画

   Worklet 机制是 Skyline 交互动画体系的基础，它能够很方便地将 JavaScript 代码跑在渲染线程，那么基于 Worklet 机制的 [动画模块](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/worklet.html)，便能够在渲染线程同步运行动画相关逻辑，使动画不再会有延迟掉帧。

2. 手势系统

   在原生应用的交互动画里，手势识别与协商是一个很重要的特性，而这块在 Web 体系下是缺失的，因此 Skyline 提供了基于 Worklet 机制的 [手势系统](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/gesture.html)。

   - 支持常用手势的识别，如缩放、拖动、双击等，并能够渲染线程同步监听手势、执行手势相关逻辑；
   - 支持手势协商处理，能够在遇到手势冲突（常见于滚动容器下）时决定让哪个手势生效，以实现更顺畅的动画衔接。

3. 自定义路由

   页面间中转进行自定义的转场动画，在原生应用里也是一个很常见的交互动画。在原来的小程序架构下，每个页面都是独立的 WebView 渲染，互相隔离，其跨页能力是基本不具备的。因此，Skyline 提供了基于 Worklet 机制的 [自定义路由模块](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/custom-route.html)，能实现市面上大多数页面转场动画效果。

4. 共享元素动画

   支持 [跨页面共享元素](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/share-element.html)，能够很方便地将上一个页面的元素“共享”到下一个页面，并伴随着过渡动画，同时支持了一套可定制化接口，能实现自定义的过渡动画。

5. 内置组件扩展

   对内置组件的扩展也是重要一环，特别是 scroll-view 组件，很多交互动画与滚动息息相关，Skyline 添加了很多在 Web 下很难做到又非常重要的特性。

   - 内置下拉刷新的实现，并完善相关事件。原来 WebView 的实现基于 transform，性能不够好且动画衔接不顺畅。
   - 提供“下拉二楼”交互的机制。
   - 提供 [sticky](https://developers.weixin.qq.com/miniprogram/dev/component/sticky-header.html) 吸顶组件，能很方便地实现吸顶元素交错切换。
   - 使 scroll-view 组件在内容未溢出时也能滚动，让用户得到及时的交互反馈。
   - 为 scroll-view 组件提供更多控制能力，如最小触发滚动距离（min-drag-distance）、滚动结束事件（scrollend）、滚动原因（isDrag）等。
   - 提供原生的 swiper 实现，相比 WebView 基于 transform 的实现，性能更好。

## 总结

虽然现在 Skyline 技术还存在各种问题与兼容性差异，但是也确实是实现小程序高性能的发展方向，而且目前阶段可以实现各种传统 webview 框架无法实现的种种交互方式，研究与实践这项技术或许可以让小程序的整体设计交互提升一个档次。
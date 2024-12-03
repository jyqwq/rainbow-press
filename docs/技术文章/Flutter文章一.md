---
title: 关于我前端写的好好的突然被领导叫去学Flutter这件事
tags:
  - 技术
  - flutter
createTime: 2024/11/06 15:57:06
permalink: /article/tzujrbhs/
---
## 说在前面

在一个风和日丽的午后，本以为又是一个普通的摸鱼日子，却突然被领导拉去谈话，意思就是公司后面要基于现有小程序和H5项目，转化到APP上去；无奈的是目前部门的研发小组并没有能够开发APP的人，既然这事找到我了，我知道牛马人又该去学习了\~

Flutter对于前端来说，是个全新的技术。面对不同的语法，面向对象的编程方式，说实话确实让人头大，但是因为是工作上的需要，只要能快速付诸实践，学习起来还是有动力的。Flutter的学习是个长期的事，也就是说这会是一个系列的文章，我将以一个前端学Flutter的视角，来逐步深入Flutter的学习，同时整理自己的理解，总结成一篇篇文章。

这篇文章作为这个系列的第一篇，我们就先分析一下Flutter与前端技术的横向差异性。**在这篇文章中，我不想说太多代码上的原理，也就是为什么代码这么写，因为这不是一篇教学文章，充其量算是Flutter体验课**。

PS：目前笔者主要通过陈航的《**Flutter核心技术与实战**》学习，因为学习资料已经是19年的了，所以很多代码写法是会有变化的，我会以目前最新的版本的Flutter来重新实现，文章中也会有一些对原文的引用。当然，如果你要想直接看完整的学习笔记，可以[点击这里](https://gitee.com/jyqaq/note/blob/master/Flutter.md)，笔记还在持续更新中。

## 这只是一个卡片

直奔主题，这是一个信息卡片，我们按照基础页面、卡片组件的方式去实现。通过同一个页面，我们看看Flutter的写法和Vue的区别。暂不考虑编程语言不同等因素，直观感受下两种实现的差异。

![image-20241105165522851.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-202.png)

## 拆解这个卡片

首先，我们把卡片分为上下布局，上半部分是水平排列的图片、文案、按钮，下半部分是描述信息，最后，卡片主体再作为一个盒子把这两部分包裹起来。

### 上半部分

水平排列的图片、文案、按钮，在Vue中的实现思路很简单，就是flex布局：

```vue
<template>
		...
    <div class="top-row">
      <img src="./cat.jpg" alt="" />
      <div class="card-content">
        <div class="card-title">title</div>
        <div class="card-date">date</div>
      </div>
      <div class="card-button">OPEN</div>
    </div>
		...
</template>
<style scoped>
  .top-row {
    display: flex;
    align-items: center;
  }
  .top-row > img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
  }
  .card-content {
    flex: 1;
    margin: 0 8px;
    min-width: 0;
  }
  .card-title {
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-date {
    font-size: 13px;
    color: gray;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-button {
    height: 32px;
    line-height: 32px;
 		width: 74px;
    background: #401296;
    color: white;
    text-align: center;
    border-radius: 18px;
    font-size: 12px;
  }
</style>
```

接下来我们看看Flutter中的实现：

```dart
  Widget buildTopRow(BuildContext context) {
    return Row( // Row控件，用来水平摆放子Widget
        children: <Widget>[
          Padding(// Padding控件，用来设置Image控件边距
              padding: const EdgeInsets.all(10),// 上下左右边距均为10
              child: ClipRRect(// 圆角矩形裁剪控件
                  borderRadius: BorderRadius.circular(8.0),// 圆角半径为8
                  child: Image.asset('/assets/cat.jpg', width: 80,height:80)// 图片控件
              )
          ),
          Expanded(// Expanded控件，用来拉伸中间区域
            child: Column(// Column控件，用来垂直摆放子Widget
              mainAxisAlignment: MainAxisAlignment.center,// 垂直方向居中对齐
              crossAxisAlignment: CrossAxisAlignment.start,// 水平方向居左对齐
              children: <Widget>[
                Text(
                  'title',
                  maxLines: 1,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis
                ),// App名字
                Text(
                  'date',
                  maxLines: 1,
                  style: const TextStyle(color: Colors.grey),
                  overflow: TextOverflow.ellipsis
                ),// App更新日期
              ],
            ),
          ),
          Padding(// Padding控件，用来设置Widget间边距
              padding: const EdgeInsets.fromLTRB(0,0,10,0),// 右边距为10，其余均为0
              child: FilledButton(// 按钮控件
                onPressed: (){},// 按钮控件
                child: const Text("OPEN"),// 点击回调
              )
          )
        ]);
  }
```

接下来我们来分析下Flutter代码的实现。

首先，我们定义了一个叫`buildTopRow`的Widget，可以将Widget理解为Vue中的组件，所以`buildTopRow`就是一个小组件，这个组件的内容就是水平排列的图片、文案、按钮。

```dart
Widget buildTopRow(BuildContext context) { ... }
```

然后，使用Row控件，用来水平摆放子Widget。**在Flutter中，控件分为单子Widget和多子Widget，如果我们要在一列或者一行显示多个Widget，就要使用Column或者Row这种支持多子Widget的控件来实现**。这点与前端中的写法逻辑是不同的。

Row控件下有三个子Widget，分别对应着图片、文字、按钮。

```dart
Row(
    children: <Widget>[ ... ]
)
```

Row控件等同于如下Vue代码片段：

```vue
<template>
		...
    <div class="top-row">
		...
    </div>
		...
</template>
<style scoped>
  .top-row {
    display: flex;
  }
</style>
```

接下来我们看下图片部分的代码：

```dart
// Padding控件，用来设置Image控件边距
Padding(
	padding: const EdgeInsets.all(10), // 上下左右边距均为10
	child: ClipRRect(// 圆角矩形裁剪控件
                borderRadius: BorderRadius.circular(8.0),// 圆角半径为8
                child: Image.asset('/assets/cat.jpg', width: 80,height:80)// 图片控件
          )
)
```

与HTML不同的是，在Flutter中，对于没有内置边距参数的控件，边距要通过控件`Padding`或者`Margin`包装去实现。ClipRRect控件实现了圆角矩形裁剪，最后再设置图片信息。

上述代码实现了如下的Vue代码片段：

```vue
<template>
		...
      <img src="./cat.jpg" alt="" />
		...
</template>
<style scoped>
  img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    margin: 10px;
  }
</style>
```

再看下中间标题和日期的代码：

```dart
Expanded(// Expanded控件，用来拉伸中间区域
	child: Column(// Column控件，用来垂直摆放子Widget
        mainAxisAlignment: MainAxisAlignment.center,// 垂直方向居中对齐
        crossAxisAlignment: CrossAxisAlignment.start,// 水平方向居左对齐
        children: <Widget>[
            Text(
                'title',
                maxLines: 1,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis
            ),// App名字
            Text(
                'date',
                maxLines: 1,
                style: const TextStyle(color: Colors.grey),
                overflow: TextOverflow.ellipsis
            ),// App更新日期
        ],
    ),
),
```

首先，Expanded控件的作用等同于CSS中的`flex: 1`，因为中间两行字是上下排列，所以使用Column控件，接着就是对其方向的设置：mainAxisAlignment、crossAxisAlignment，这两个设置等同于CSS中的`align-items: center`。最后，再设置两行文本内容及样式。

我们再对比下这块的Vue代码：

```vue
<template>
		...
      <div class="card-content">
        <div class="card-title">title</div>
        <div class="card-date">date</div>
      </div>
		...
</template>
<style scoped>
  .card-content {
    flex: 1;
    margin: 0 8px;
    min-width: 0;
  }
  .card-title {
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-date {
    font-size: 13px;
    color: gray;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
```

剩下的按钮代码相对来说就简单很多：

```dart
Padding(// Padding控件，用来设置Widget间边距
	padding: const EdgeInsets.fromLTRB(0,0,10,0),// 右边距为10，其余均为0
	child: FilledButton(// 按钮控件
		onPressed: (){},// 按钮控件
		child: const Text("OPEN"),// 点击回调
	)
)
```

Padding控件前面已经说过了，这里用到的FilledButton控件就是material组件库提供的，样式是自带的，所以我们只用设置点击事件和按钮文案就行。

最后再对比下这块的Vue代码：

```vue
<template>
		...
      <div class="card-button">OPEN</div>
		...
</template>
<style scoped>
  .card-button {
    height: 32px;
    line-height: 32px;
    width: 74px;
    background: #401296;
    color: white;
    text-align: center;
    border-radius: 18px;
    font-size: 12px;
  }
</style>
```

### 下半部分

卡片的下半部分就是两行文字，所以代码相对也会简单很多，首先是Vue的实现：

```vue
<template>
	...
    <div class="bottom-row">
      <div class="card-description">appDescription</div>
      <div>appVersion • appSize MB</div>
    </div>
  ...
</template>
<style scoped>
  .bottom-row {
    margin-top: 10px;
    font-size: 13px;
  }
  .card-description {
    margin-bottom: 10px;
  }
</style>
```

再看下Flutter的代码：

```dart
  Widget buildBottomRow(BuildContext context) {
    return Padding(//Padding控件用来设置整体边距
        padding: const EdgeInsets.fromLTRB(15,0,15,0),//左边距和右边距为15
        child: Column(//Column控件用来垂直摆放子Widget
            crossAxisAlignment: CrossAxisAlignment.start,//水平方向距左对齐
            children: <Widget>[
              Text(model.appDescription),//更新文案
              Padding(//Padding控件用来设置边距
                  padding: const EdgeInsets.fromLTRB(0,10,0,10),//上边距为10
                  child: Text("${model.appVersion} • ${model.appSize} MB")
              )
            ]
        ));
  }
```

我们可以明显看出，下半部分的实现代码在上半部分都是有体现的，所以这块可以尝试自己再去理解一遍。

### 卡片盒子

卡片的盒子包括背景色、圆角、阴影，作用就是包裹卡片的上下两个部分。

我们先看下Vue的实现：

```vue
<template>
  <div class="container">
    ...
  </div>
</template>
<style scoped>
  .container {
    margin: 16px;
    background: white;
    border-radius: 16px;
    box-shadow: 2px 2px 8px 2px rgba(0, 0, 0, 0.2);
    padding: 10px;
    overflow: hidden;
  }
</style>
```

然后是Flutter的实现：

```dart
  @override
	Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8.0, // 阴影模糊半径
            spreadRadius: 2.0, // 阴影扩散半径
            offset: const Offset(2.0, 2.0), // 阴影偏移量
          ),
        ],
      ),
      child: Column(//用Column将上下两部分合体
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ...
          ]),
    );
  }
```

与前面上下部分的定义不同，卡片盒子用的是build函数，而build是继承上层Widget的build函数，输出的就是当前组件最终的结构样式，所以会有`@override`的关键字。

```dart
@override
Widget build(BuildContext context) { ... }
```

接着就是Container控件，作为卡片盒子的主体，Container自带了margin属性，所以我们可以直接设置外边距，再通过decoration属性设置了它的背景色、圆角、阴影。

```dart
Container(
	margin: const EdgeInsets.all(16.0),
	decoration: BoxDecoration(
		color: Colors.white,
		borderRadius: BorderRadius.circular(16.0),
		boxShadow: [
			BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 8.0, // 阴影模糊半径
                            spreadRadius: 2.0, // 阴影扩散半径
                            offset: const Offset(2.0, 2.0), // 阴影偏移量
			),
		],
	),
	...
)
```

最后，Container的子Widget是Column控件，因为卡片内部是分为上下部分的，所以要用到支持多子Widget的Column。

```dart
Column(//用Column将上下两部分合体
	mainAxisSize: MainAxisSize.min,
	children: <Widget>[
		...
	]
)
```

## 传参什么的最抽象了

说到组件总是离不开组件间传值，就像这次的卡片组件，要支持卡片信息的传入和点击事件的响应，在Vue中我们可以通过props传参，通过emits自定义事件。庆幸的是，Flutter在传参方面也不难，因为组件都是继承类，所以最基本的传参就是在类实例化传入的。

当然Flutter还有一些其他传参方式，我们这里先看看最简单的父子组件传值。

这里我们还是先看下Vue传参的实现：

```dart
<template>
	...
      <div class="card-button" @click="emits('onPressed')">OPEN</div>
	...
</template>
<script setup lang="ts">
  import { unref } from 'vue';

  const emits = defineEmits(['onPressed']);
  const props = defineProps<{
    model: {
      appIcon: object;
      appName: string;
      appSize: string;
      appDate: string;
      appDescription: string;
      appVersion: string;
    };
  }>();
  const model = unref(props.model);
</script>
```

一目了然，我们通过props拿到model，获得渲染卡片所需的所有信息，然后通过自定义事件`onPressed`来响应按钮点击事件。

再看看Flutter的实现：

```dart
// 先定义一个数据结构CardItemModel来存储信息。
class CardItemModel {
  String appIcon;//App图标
  String appName;//App名称
  String appSize;//App大小
  String appDate;//App更新日期
  String appDescription;//App更新文案
  String appVersion;//App版本
  //构造函数语法糖，为属性赋值
  CardItemModel({
    required this.appIcon,
    required this.appName,
    required this.appSize,
    required this.appDate,
    required this.appDescription,
    required this.appVersion
  });
}

class MyCardWithIcon extends StatelessWidget {
  final CardItemModel model;
  //构造函数语法糖，用来给model赋值
  const MyCardWithIcon({
    required this.model,
    required this.onPressed
  }) : super(key: key);
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    ...
  }

  Widget buildTopRow(BuildContext context) {
    ...
  }

  Widget buildBottomRow(BuildContext context) {
    ...
  }
}
```

首先是CardItemModel的定义：

```dart
// 先定义一个数据结构CardItemModel来存储信息。
class CardItemModel {
  String appIcon;//App图标
  String appName;//App名称
  String appSize;//App大小
  String appDate;//App更新日期
  String appDescription;//App更新文案
  String appVersion;//App版本
  //构造函数语法糖，为属性赋值
  CardItemModel({
    required this.appIcon,
    required this.appName,
    required this.appSize,
    required this.appDate,
    required this.appDescription,
    required this.appVersion
  });
}
```

这块四舍五入等同于TS的类型定义：

```ts
model: {
	appIcon: object;
	appName: string;
	appSize: string;
	appDate: string;
	appDescription: string;
	appVersion: string;
}
```

接着是组件的类定义：

```dart
class MyCardWithIcon extends StatelessWidget { ... }
```

名为`MyCardWithIcon`的组件继承于`StatelessWidget`，顾名思义，`StatelessWidget`是一个无状态的组件，也就是说组件一旦渲染，后面将不会动态变化。

然后就是组件常量和构建函数的定义：

```dart
  final CardItemModel model;
  //构造函数语法糖，用来给model赋值
  const MyCardWithIcon({
    required this.model,
    required this.onPressed
  });
  final VoidCallback onPressed;
```

在Flutter中，`this.model`的写法是语法糖，等同于`this.model = model`。

好了，到这里我们已经把卡片组件写好了，接下来就是调用组件。

## 终于能用了

老样子先看Vue的写法：

```Vue
<template>
  <div class="page">
    <div class="title">layout demo</div>
    <Card :model="model" @onPressed="onPressed" />
  </div>
</template>
<script setup lang="ts">
  import Card from './Card.vue';
  import Cat from './cat.jpg';

  const model = {
    appIcon: Cat,
    appDate: '2024-10-30',
    appDescription: '这是一个app，这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app',
    appName: 'APP【APP】-这是一个app这是一个app这是一个app这是一个app',
    appSize: '1',
    appVersion: '1.0.0',
  };
  
  const onPressed = () => {};
</script>
<style scoped>
  .page {
    background: rgba(135, 198, 232, 0.1);
    min-height: 100vh;
  }
  .title {
    text-align: center;
    padding-top: 20px;
    padding-bottom: 10px;
  }
</style>
```

Flutter的也搬上来：

```dart
import 'package:flutter/material.dart';
import 'card.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(
        appBar: AppBar(title: const Text("layout demo")),
        body: MyCardWithIcon(
            model: CardItemModel(
                appIcon: 'assets/cat.jpg',
                appDate: '2024-10-30',
                appDescription: '这是一个app，这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app',
                appName: 'APP【APP】-这是一个app这是一个app这是一个app这是一个app',
                appSize: '1',
                appVersion: '1.0.0'
            ),
            onPressed: () {}
        ),
      ),
    );
  }
}
```

首先，`void main() => runApp(const MyApp())`是程序入口，和Vue中的`createApp`一样。

接着，我们同样定义了一个无状态的组件，实现了build函数：

```dart
class MyApp extends StatelessWidget { 
	@override
  Widget build(BuildContext context) { ... }
}
```

在Flutter中，应用程序类`MaterialApp`的初始化方法，为我们提供了设置主题的能力。我们可以通过参数theme，选择改变App的主题色、字体等，设置界面在`MaterialApp`下的展示样式。

```dart
MaterialApp(
	title: 'Flutter Demo',
	theme: ThemeData(
		primarySwatch: Colors.blue,
	),
	...
)
```

在 Flutter 中，Scaffold 是一个非常重要的 widget，它为 `Material Design` 中的布局提供了一个基础的结构。Scaffold 通常作为应用的主要布局容器，提供了管理应用栏（AppBar）、底部导航栏、抽屉、模态底部片等功能的框架。

```dart
Scaffold(
	appBar: AppBar(title: const Text("layout demo")),
	...
)
```

到这里，Flutter通过两个控件实现了Vue的以下代码：

```vue
<template>
  <div class="page">
    <div class="title">layout demo</div>
    ...
  </div>
</template>
<style scoped>
  .page {
    background: rgba(135, 198, 232, 0.1);
    min-height: 100vh;
  }
  .title {
    text-align: center;
    padding-top: 20px;
    padding-bottom: 10px;
  }
</style>
```

最后就是组件的调用：

```dart
MyCardWithIcon(
	model: CardItemModel(
		appIcon: 'assets/cat.jpg',
		appDate: '2024-10-30',
		appDescription: '这是一个app，这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app',
		appName: 'APP【APP】-这是一个app这是一个app这是一个app这是一个app',
		appSize: '1',
		appVersion: '1.0.0'
	),
	onPressed: () {}
)
```

`MyCardWithIcon`是我们前面定义的卡片类名称，通过`import 'card.dart'`我们可以直接使用这个卡片类，然后就是组件必须的两个参数，一个是`CardItemModel`类，也就是卡片信息，一个是`onPressed`点击函数。

与之对应的Vue调用组件的代码就是：

```vue
<template>
	...
    <Card :model="model" @onPressed="onPressed" />
	...
</template>
<script setup lang="ts">
  import Card from './Card.vue';
  import Cat from './cat.jpg';

  const model = {
    appIcon: Cat,
    appDate: '2024-10-30',
    appDescription: '这是一个app，这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app',
    appName: 'APP【APP】-这是一个app这是一个app这是一个app这是一个app',
    appSize: '1',
    appVersion: '1.0.0',
  };
  
  const onPressed = () => {};
</script>
```

## 总结一下

好了，到这里我们已经体验到了Flutter和vue在实现一个卡片组件上的差异。可以很明显的感受到，Flutter是通过Widget的堆砌，实现页面结构和样式，这就引出了Flutter的核心思想：**“一切皆Widget”**。

Widget是Flutter世界里对视图的一种结构化描述，可以把它看作是前端中的“控件”或“组件”。Widget是控件实现的基本逻辑单位，里面存储的是有关视图渲染的配置信息，包括布局、渲染属性、事件响应信息等。

Flutter将Widget设计成不可变的，所以当视图渲染的配置信息发生变化时，Flutter会选择重建Widget树的方式进行数据更新，以数据驱动UI构建的方式简单高效。

将这篇文章作为一个引子，未来我将用一个前端开发者的视角去逐步深入Flutter的探索，如果你也对此感兴趣或是说也想学学Flutter，那就一起吧\~

## 完整代码

卡片组件代码：

```dart
// card.dart
// Flutter核心组件库
import 'package:flutter/material.dart';

// 先定义一个数据结构CardItemModel来存储信息。
class CardItemModel {
  String appIcon;// App图标
  String appName;// App名称
  String appSize;// App大小
  String appDate;// App更新日期
  String appDescription;// App更新文案
  String appVersion;// App版本
  // 构造函数语法糖，为属性赋值
  CardItemModel({
    required this.appIcon,
    required this.appName,
    required this.appSize,
    required this.appDate,
    required this.appDescription,
    required this.appVersion
  });
}

// 卡片类继承自StatelessWidget类，意味着该组件是静态的，没有动态数据变化的能力。
class MyCardWithIcon extends StatelessWidget {
  final CardItemModel model;
  // 构造函数语法糖，用来给model赋值
  const MyCardWithIcon({
    required Key key,
    required this.model, 
    required this.onPressed
  }) : super(key: key);
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    // 卡片最外层是Container组件，它可以装饰、控制其子widget的布局方式。它可以用于创建Div、Layout Box、按钮、图片、文本等。
    return Container(
      margin: const EdgeInsets.all(16.0),// 外边距
      // 设置Container的边框
      decoration: BoxDecoration(
        color: Colors.white, // 背景色
        borderRadius: BorderRadius.circular(16.0), // 边框圆角
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8.0, // 阴影模糊半径
            spreadRadius: 2.0, // 阴影扩散半径
            offset: const Offset(2.0, 2.0), // 阴影偏移量
          ),
        ],
      ),
      child: Column(// 用Column将卡片分为上下两部分
          mainAxisSize: MainAxisSize.min, // 让容器宽度与所有子Widget的宽度一致
          children: <Widget>[
            buildTopRow(context),// 上半部分
            buildBottomRow(context)// 下半部分
          ]),
    );
  }

  Widget buildTopRow(BuildContext context) {
    return Row( // Row控件，用来水平摆放子Widget
        children: <Widget>[
          Padding(// Padding控件，用来设置Image控件边距
              padding: const EdgeInsets.all(10),// 上下左右边距均为10
              child: ClipRRect(// 圆角矩形裁剪控件
                  borderRadius: BorderRadius.circular(8.0),// 圆角半径为8
                  child: Image.asset(model.appIcon, width: 80,height:80)  // 图片控件
              )
          ),
          Expanded(// Expanded控件，用来拉伸中间区域
            child: Column(// Column控件，用来垂直摆放子Widget
              mainAxisAlignment: MainAxisAlignment.center,// 垂直方向居中对齐
              crossAxisAlignment: CrossAxisAlignment.start,// 水平方向居左对齐
              children: <Widget>[
                Text(
                  model.appName,
                  maxLines: 1, 
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold), 
                  overflow: TextOverflow.ellipsis
                ),// App名字
                Text(
                  model.appDate,
                  maxLines: 1, 
                  style: const TextStyle(color: Colors.grey), 
                  overflow: TextOverflow.ellipsis
                ),// App更新日期
              ],
            ),
          ),
          Padding(// Padding控件，用来设置Widget间边距
              padding: const EdgeInsets.fromLTRB(0,0,10,0),// 右边距为10，其余均为0
              child: FilledButton(// 按钮控件
                onPressed: onPressed,// 按钮控件
                child: const Text("OPEN"),// 点击回调
              )
          )
        ]);
  }

  Widget buildBottomRow(BuildContext context) {
    return Padding(// Padding控件用来设置整体边距
        padding: const EdgeInsets.fromLTRB(15,0,15,0),// 左边距和右边距为15
        child: Column(// Column控件用来垂直摆放子Widget
            crossAxisAlignment: CrossAxisAlignment.start,// 水平方向距左对齐
            children: <Widget>[
              Text(model.appDescription),// 更新文案
              Padding(// Padding控件用来设置边距
                  padding: const EdgeInsets.fromLTRB(0,10,0,10),// 上边距为10
                  child: Text("${model.appVersion} • ${model.appSize} MB")
              )
            ]
        ));
  }
}
```

页面引用代码：

```dart
// main.dart
import 'package:flutter/material.dart';
import 'card.dart';

// MyApp为Flutter应用的运行实例，通过在main函数中调用runApp函数实现程序的入口。
void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // MaterialApp类是对构建material设计风格应用的组件封装框架，里面还有很多可配置的属性，比如应用主题、应用名称、语言标识符、组件路由等。
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      // Scaffold是Material库中提供的页面布局结构，它包含AppBar、Body等。
      home: Scaffold(
        // AppBar是页面的导航栏
        appBar: AppBar(title: const Text("layout demo")),
        body: MyCardWithIcon(
            model: CardItemModel(
                appIcon: 'assets/cat.jpg',
                appDate: '2024-10-30',
                appDescription: '这是一个app，这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app这是一个app',
                appName: 'APP【APP】-这是一个app这是一个app这是一个app这是一个app',
                appSize: '1',
                appVersion: '1.0.0'
            ),
            key: const Key('1'),
            onPressed: () {}
        ),
      ),
    );
  }
}
```

---
title: antV G6
tags:
  - 笔记
  - 学习
  - 待续
createTime: 2024/08/05 09:39:01
permalink: /article/coohzi4a/
---
# antV G6



## 基础代码



```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Tutorial Demo</title>
  </head>
  <body>
    <div id="mountNode"></div>
    <script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.g6-3.7.1/dist/g6.min.js"></script>
    <!-- 4.x and later versions -->
    <!-- <script src="https://gw.alipayobjects.com/os/lib/antv/g6/4.3.11/dist/g6.min.js"></script> -->
    <script>
      const graph = new G6.Graph({
        container: 'mountNode',
        width: 1000,
        height: 600,
        fitView: true,
        fitViewPadding: [20, 40, 50, 20],
      });

      const main = async () => {
        const response = await fetch(
          'https://gw.alipayobjects.com/os/basement_prod/6cae02ab-4c29-44b2-b1fd-4005688febcb.json',
        );
        const remoteData = await response.json();
        graph.data(remoteData);
        graph.render();
      };
      main();
    </script>
  </body>
</html>
```



## 常用配置



|       配置项        |       类型        |                           选项 / 示例                            |   默认   |                                                   说明                                                    |
|:----------------:|:---------------:|:------------------------------------------------------------:|:------:|:-------------------------------------------------------------------------------------------------------:|
|     fitView      |     Boolean     |                         true / false                         | false  |                                       是否将图适配到画布大小，可以防止超出画布或留白太多。                                        |
|  fitViewPadding  | Number / Array  |                  20 / \[ 20, 40, 50, 20 \]                   |   0    |                                               画布上的四周留白宽度。                                               |
|     animate      |     Boolean     |                         true / false                         | false  |                                                是否启用图的动画。                                                |
|      modes       |     Object      |        {  default: \[ 'drag-node', 'drag-canvas' \] }        |  null  | 图上行为模式的集合。由于比较复杂，按需参见：[G6 中的 Mode](https://g6.antv.antgroup.com/zh/docs/manual/middle/states/mode) 教程。  |
|   defaultNode    |     Object      |  {  type: 'circle',  color: '#000',  style: {   ......  } }  |  null  |                                     节点默认的属性，包括节点的一般属性和样式属性（style）。                                      |
|   defaultEdge    |     Object      | {  type: 'polyline',  color: '#000',  style: {   ......  } } |  null  |                                      边默认的属性，包括边的一般属性和样式属性（style）。                                       |
| nodeStateStyles  |     Object      |      {  hover: {   ......  },  select: {   ......  } }       |  null  |                        节点在除默认状态外，其他状态下的样式属性（style）。例如鼠标放置（hover）、选中（select）等状态。                         |
| edgeStateStyles  |     Object      |      {  hover: {   ......  },  select: {   ......  } }       |  null  |                         边在除默认状态外，其他状态下的样式属性（style）。例如鼠标放置（hover）、选中（select）等状态。                         |



## 数据结构



以节点元素为例，其属性的数据结构如下：

```json
{
	id: 'node0',          // 元素的 id
  type: 'circle',       // 元素的图形
  size: 40,             // 元素的大小
  label: 'node0',        // 标签文字
  visible: true,        // 控制初次渲染显示与隐藏，若为 false，代表隐藏。默认不隐藏
  labelCfg: {           // 标签配置属性
    positions: 'center',// 标签的属性，标签在元素中的位置
    style: {            // 包裹标签样式属性的字段 style 与标签其他属性在数据结构上并行
      fontSize: 12      // 标签的样式属性，文字字体大小
      // ...            // 标签的其他样式属性
    }
  },
  // ...,               // 其他属性
  style: {              // 包裹样式属性的字段 style 与其他属性在数据结构上并行
    fill: '#000',       // 样式属性，元素的填充色
    stroke: '#888',     // 样式属性，元素的描边色
    // ...              // 其他样式属性
  }
}
```



## 配置属性



### 1. 实例化图时全局配置

通过如下方式在实例化图时  `defaultNode` 和  `defaultEdge`：

```js
const graph = new G6.Graph({
  // ...                   // 图的其他配置
  // 节点在默认状态下的样式配置（style）和其他配置
  defaultNode: {
    size: 30, // 节点大小
    // ...                 // 节点的其他配置
    // 节点样式配置
    style: {
      fill: 'steelblue', // 节点填充色
      stroke: '#666', // 节点描边色
      lineWidth: 1, // 节点描边粗细
    },
    // 节点上的标签文本配置
    labelCfg: {
      // 节点上的标签文本样式配置
      style: {
        fill: '#fff', // 节点标签文字颜色
      },
    },
  },
  // 边在默认状态下的样式配置（style）和其他配置
  defaultEdge: {
    // ...                 // 边的其他配置
    // 边样式配置
    style: {
      opacity: 0.6, // 边透明度
      stroke: 'grey', // 边描边颜色
    },
    // 边上的标签文本配置
    labelCfg: {
      autoRotate: true, // 边上的标签文本根据边的方向旋转
    },
  },
});
```



### 2. 在数据中配置



可以直接将配置写入数据文件；也可以在读入数据后，通过遍历的方式写入配置。这里展示读入数据后，通过遍历的方式写入配置。

```js
const nodes = remoteData.nodes;
nodes.forEach((node) => {
  if (!node.style) {
    node.style = {};
  }
  switch (
    node.class // 根据节点数据中的 class 属性配置图形
  ) {
    case 'c0': {
      node.type = 'circle'; // class = 'c0' 时节点图形为 circle
      break;
    }
    case 'c1': {
      node.type = 'rect'; // class = 'c1' 时节点图形为 rect
      node.size = [35, 20]; // class = 'c1' 时节点大小
      break;
    }
    case 'c2': {
      node.type = 'ellipse'; // class = 'c2' 时节点图形为 ellipse
      node.size = [35, 20]; // class = 'c2' 时节点大小
      break;
    }
  }
});

graph.data(remoteData);
```



## 使用图布局 Layout



当数据中没有节点位置信息，或者数据中的位置信息不满足需求时，需要借助一些布局算法对图进行布局。G6 提供了 9 种一般图的布局和 4 种树图的布局：
**一般图：**

- Random Layout：随机布局；

- **Force Layout：经典力导向布局：**

  > 力导向布局：一个布局网络中，粒子与粒子之间具有引力和斥力，从初始的随机无序的布局不断演变，逐渐趋于平衡稳定的布局方式称之为力导向布局。适用于描述事物间关系，比如人物关系、计算机网络关系等。

- Circular Layout：环形布局；

- Radial Layout：辐射状布局；

- MDS Layout：高维数据降维算法布局；

- Fruchterman Layout：Fruchterman 布局，一种力导布局；

- Dagre Layout：层次布局；

- Concentric Layout：同心圆布局，将重要（默认以度数为度量）的节点放置在布局中心；

- Grid Layout：格子布局，将节点有序（默认是数据顺序）排列在格子上。

**树图布局：**

- Dendrogram Layout：树状布局（叶子节点布局对齐到同一层）；
- CompactBox Layout：紧凑树布局；
- Mindmap Layout：脑图布局；
- Indented Layout：缩进布局。



```js
const graph = new G6.Graph({
  // ...                      // 其他配置项
  layout: {
    // Object，可选，布局的方法及其配置项，默认为 random 布局。
    type: 'force', // 指定为力导向布局
    preventOverlap: true, // 防止节点重叠
    // nodeSize: 30,        // 节点大小，用于算法中防止节点重叠时的碰撞检测。由于已经在上一节的元素配置中设置了每个节点的 size 属性，则不需要在此设置 nodeSize。
     linkDistance: 100, // 指定边距离为100
  },
});
```



## 图的交互 Behavior



### 交互行为 Behavior

G6 中的交互行为。G6 **内置**了一系列交互行为，用户可以直接使用。简单地理解，就是可以一键开启这些交互行为：

- `drag-canvas`：拖拽画布；
- `zoom-canvas`：缩放画布。

更多详见：[交互行为 Behavior](https://g6.antv.antgroup.com/zh/docs/manual/middle/states/default-behavior)

在 G6 中使用内置 Behavior 的方式非常简单，只需要在图实例化时配置 `modes`。拖拽和缩放属于 G6 内置交互行为，修改代码如下：

```javascript
const graph = new G6.Graph({
  // ...   // 其他配置项
  modes: {
    default: ['drag-canvas', 'zoom-canvas', 'drag-node'], // 允许拖拽画布、放缩画布、拖拽节点
  },
});
```



### Hover、Click 改变样式——状态式交互



在实例化图时，通过 `nodeStateStyles` 和 `edgeStateStyles` 两个配置项可以配置元素在不同状态下的样式。

```js
const graph = new G6.Graph({
  // ...                           // 其他配置项
  // 节点不同状态下的样式集合
  nodeStateStyles: {
    // 鼠标 hover 上节点，即 hover 状态为 true 时的样式
    hover: {
      fill: 'lightsteelblue',
    },
    // 鼠标点击节点，即 click 状态为 true 时的样式
    click: {
      stroke: '#000',
      lineWidth: 3,
    },
  },
  // 边不同状态下的样式集合
  edgeStateStyles: {
    // 鼠标点击边，即 click 状态为 true 时的样式
    click: {
      stroke: 'steelblue',
    },
  },
});
```



G6 中所有元素监听都挂载在图实例上，如下代码中的 `graph` 对象是 G6.Graph 的实例，`graph.on()` 函数监听了某元素类型（`node` / `edge`）的某种事件（`click` / `mouseenter` / `mouseleave` / ... 所有事件参见：[Event API](https://g6.antv.antgroup.com/zh/docs/api/Event)）。

```js
// 鼠标进入节点
graph.on('node:mouseenter', (e) => {
  const nodeItem = e.item; // 获取鼠标进入的节点元素对象
  graph.setItemState(nodeItem, 'hover', true); // 设置当前节点的 hover 状态为 true
});

// 鼠标离开节点
graph.on('node:mouseleave', (e) => {
  const nodeItem = e.item; // 获取鼠标离开的节点元素对象
  graph.setItemState(nodeItem, 'hover', false); // 设置当前节点的 hover 状态为 false
});

// 点击节点
graph.on('node:click', (e) => {
  // 先将所有当前是 click 状态的节点置为非 click 状态
  const clickNodes = graph.findAllByState('node', 'click');
  clickNodes.forEach((cn) => {
    graph.setItemState(cn, 'click', false);
  });
  const nodeItem = e.item; // 获取被点击的节点元素对象
  graph.setItemState(nodeItem, 'click', true); // 设置当前节点的 click 状态为 true
});

// 点击边
graph.on('edge:click', (e) => {
  // 先将所有当前是 click 状态的边置为非 click 状态
  const clickEdges = graph.findAllByState('edge', 'click');
  clickEdges.forEach((ce) => {
    graph.setItemState(ce, 'click', false);
  });
  const edgeItem = e.item; // 获取被点击的边元素对象
  graph.setItemState(edgeItem, 'click', true); // 设置当前边的 click 状态为 true
});
```


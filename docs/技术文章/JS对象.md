---
title: 从V8引擎的角度去看看JS对象模型的实现与优化
tags:
   - 面试
createTime: 2022/04/24
permalink: /article/mhuhwuwh/
---
### 前言



JavaScript 引擎是如何实现 JavaScript 对象模型的，以及他们使用了哪些技巧来加快获取 JavaScript 对象属性的速度？本文通过浏览器调试的方式，从V8引擎的实现上来解释以上两个问题。本文在写作过程中也参考了几篇前辈的文章，文章链接都会放在结尾。



### 测试方法



本篇文章主要的分析结果是通过谷歌浏览器的堆快照获取的，操作方法如下：



1. 打开调试页面，找到内存标签，选择堆快照

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-134.png)

2. 点击左上角原点，获取当前堆快照

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-135.png)

3. 这时候在控制台上，输入测试代码运行：

   ```js
   function TEST(){}
   let test = new TEST()
   ```

4. 回到内存标签，再获取一次堆快照，选择’‘在快照1和快照2之间分配的对象“

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-136.png)

5. 这时候我们就能找到刚刚创建的TEST对象，并查看其内存信息

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-137.png)



### 对象模型



ECMAScript 规范基本上将所有对象定义为由字符串键值映射到 *[property 属性](https://link.zhihu.com/?target=https%3A//tc39.github.io/ecma262/%23sec-property-attributes)* 的字典。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-138.png)

除 `[[Value]]` 外，规范还定义了如下属性：

- `[[Writable]]` 决定该属性是否可以被重新赋值；
- `[[Enumerable]]` 决定该属性是否出现在 `for-in` 循环中；
- `[[Configurable]]` 决定该属性是否可被删除。

`[[双方括号]]`的符号表示看上去有些特别，但这正是规范定义不能直接暴露给 JavaScript 的属性的表示方法。在 JavaScript 中你仍然可以通过 `Object.getOwnPropertyDescriptor` API 获得指定对象的属性值：

```js
const object = { foo: 42 };
Object.getOwnPropertyDescriptor(object, 'foo');
// → { value: 42, writable: true, enumerable: true, configurable: true }
```



在 V8 中，对象主要由三个指针构成，分别是隐藏类（Hidden Class），`Property` 还有 `Element`。

其中，隐藏类用于**描述对象的结构**。`Property` 和 `Element` 用于存放对象的属性，它们的区别主要体现在键名能否被索引。

在 ECMAScript 规范中定义了**数字属性应该按照索引值大小升序排列，字符串属性根据创建时的顺序升序排列。**

我们把对象中的数字属性称为**排序属性**，就是 V8 中的 `elements`，字符串属性就被称为**常规属性**，就是 V8 中的 `properties`。

```js
// 可索引属性会被存储到 Elements 指针指向的区域
{ 1: "a", 2: "b" }

// 命名属性会被存储到 Properties 指针指向的区域
{ "first": 1, "second": 2 }

// 举例验证
var a = { 1: "a", 2: "b", "first": 1, 3: "c", "second": 2 }

var b = { "second": 2, 1: "a", 3: "c", 2: "b", "first": 1 }

console.log(a) 
// { 1: "a", 2: "b", 3: "c", first: 1, second: 2 }

console.log(b)
// { 1: "a", 2: "b", 3: "c", second: 2, first: 1 }
```

分解成这两种线性数据结构之后，如果执行索引操作，那么 V8 会先从 `elements `属性中按照顺序读取所有的元素，然后再在 `properties` 属性中读取所有的元素，这样就完成一次索引操作。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-139.png)



### 隐藏类（Shapes）



为什么要引入隐藏类？首先当然是更快。

JavaScript 是一门动态编程语言，它允许开发者使用非常灵活的方式定义对象。对象可以在运行时改变类型，添加或删除属性。相比之下，像 Java 这样的静态语言，类型一旦创建变不可更改，属性可以通过固定的偏移量进行访问。

**JS中的对象通过哈希表的方式存取属性，需要额外的哈希计算（后面会再提到）。为了提高对象属性的访问速度，实现对象属性的快速存取，V8 中引入了隐藏类。**

**隐藏类引入的另外一个意义，在于大大节省了内存空间。**



前面我们说到对象的`Attribute`（属性）被描述为：`[[Value]]`、`[[Writable]]`、`[[Enumerable]]`、`[[Configurable]]`。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-140.png)

隐藏类的引入，将属性的 `Value` 与其它 `Attribute` 分开。一般情况下，对象的 `Value` 是经常会发生变动的，而 `Attribute` 是几乎不怎么会变的。那么，我们为什么要重复描述几乎不会改变的 `Attribute` 呢？显然这是一种内存浪费。

同样，多个对象具有相同的键值属性是非常常见的。这些对象都具有相同的形状。同样，访问具有相同形状对象的相同属性也很常见。

```js
const object1 = { x: '111', y: '222' };
const object2 = { x: '333', y: '444' };
// `object1` and `object2` have the same shape.
console.log(object1.x);
console.log(object2.x);
```

假设我们稍后会遇到更多同形状的对象，那么在 `JSObject` 自身存储包含属性名和属性值的完整字典便是很浪费（空间）的，因为对具有相同形状的所有对象我们都重复了一遍属性名称。 它太冗余且引入了不必要的内存使用。 作为优化，引擎将对象的 `Shape` 分开存储。

考虑到这一点，JavaScript 引擎可以根据对象的形状来优化对象的属性获取。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-141.png)

要注意的是，所有的 JavaScript 引擎都使用了形状作为优化，但称呼各有不同：

- 学术论文称它们为 *Hidden Classes*（容易与 JavaScript 中的类概念混淆）
- V8 将它们称为 *Maps*（容易与 JavaScript 中的 `Map` 概念混淆）
- Chakra 将它们称为 *Types*（容易与 JavaScript 中的动态类型和关键字 `typeof` 混淆）
- JavaScriptCore 称它们为 *Structures*
- SpiderMonkey 称他们为 *Shapes*



####  *shape* 的创建



对象创建过程中，每添加一个命名属性，都会对应一个生成一个新的隐藏类 。在 V8 的底层实现了一个将隐藏类连接起来的转换树，如果以相同的顺序添加相同的属性，转换树会保证最后得到相同的隐藏类。

我们这里用代码来一步步观察隐藏类的变化：

```js
let obj = {}
obj.name = 'test'
obj.text = 'hidden'
```

![image-20220227153937174](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-142.png)

通过上图，我们可以看出，从创建空对象到给对象属性赋值，每一步的隐藏类都是不同的，并且后者隐藏类中的`back_pointer`指向了前一步操作的隐藏类。

进一步分析一下：

- 该对象在初始化时没有任何属性，因此它指向一个空的隐藏类。
- 下一个语句为该对象添加值为 `test` 的属性 `“name”`，所以 JavaScript 引擎转向一个包含属性 `“name”` 的隐藏类。
- 接下来一个语句添加了一个属性 `'text'`，引擎便转向另一个包含 `'name'` 和 `'text'` 的隐藏类。

综上所述，我们可以大致推断，**在实际存储中，每次添加属性时，新创建隐藏类实际上只会描述这个新添加的属性，而不会描述所有属性**，也就是 `obj.text = 'hidden'` 操作后对象中的隐藏类实际上只会描述 `text`，没有 `name`，每一个隐藏类都会与其之前的隐藏类相连。



接着我们再比较下面两种创建对象的方式：

```js
let a = {}
a.name = 'test1'
let b = { name: 'test2' }
```

![image-20220227155820120](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-143.png)

a 和 b 的区别是，a 首先创建一个空对象，然后给这个对象新增一个命名属性 `name`。而 b 中直接创建了一个含有命名属性 `name` 的对象。从内存快照我们可以看到，a 和 b 的隐藏类不一样，`back_pointer` 也不一样。这主要是因为，在创建 b 的隐藏类时，省略了为空对象单独创建隐藏类的一步。所以，要生成相同的隐藏类，更为准确的描述是 —— **从相同的起点，以相同的顺序，添加结构相同的属性（除 `Value` 外，属性的 `Attribute` 一致）。**



接下来我们来尝试创建相同隐藏类的对象。

```js
const object1 = { x: '111', y: '222' };
const object2 = { x: '333', y: '444' };
```

![image-20220227161335763](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-144.png)

从图中我们可以看出，虽然我们创建了两个对象，但是它们的结构相同，所以隐藏类也相同了。



#### **Transition 链与树**



在 JavaScript 引擎中，隐藏类的表现形式被称作 *transition 链*，如下图所示。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-145.png)

但是，如果不能只创建一个 transition 链呢？例如，如果你有两个空对象，并且你为每个对象都添加了一个不同的属性？

```js
const object1 = {};
object1.x = 5;
const object2 = {};
object2.y = 6;
```

在这种情况下我们便必须进行分支操作，此时我们最终会得到一个 *transition 树* 而不是 transition 链：

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-146.png)

当然我们也不一定要从空对象开始创建，如下图所示：

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-147.png)

### 对象属性的存储



前面说过，`Property` 和 `Element` 用于存放对象的属性，它们的区别主要体现在键名能否被索引。可索引的属性应该按照索引值大小升序排列，而命名属性根据创建的顺序升序排列。



### 可索引属性的不同存储方式



可索引属性一定是放在 `Element` 里面存放的吗？接下来我们通过观察内存快照来找出答案。

```js
function Foo1 () {}
var a = new Foo1()
var b = new Foo1()

a.name = 'aaa'
a.text = 'aaa'
b.name = 'bbb'
b.text = 'bbb'

a[1] = 'aaa'
a[2] = 'aaa'
```

![image-20220410154922693](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-148.png)

a、b 都有命名属性 `name` 和 `text`，此外 a 还额外多了两个可索引属性。从快照中可以明显的看到，可索引属性是存放在 `Elements` 中的，此外，a 和 b 具有相同的结构。

这里我们发现一个有趣的点，这两个对象的属性不一样，怎么会有相同的结构呢？

对于可索引属性来说，它本身已经是有序地进行排列了，我们为什么还要多此一举通过它的结构去查找呢。既然不用通过它的结构查找，那么我们也不需要再去描述它的结构了是吧。这样，应该就不难理解为什么 `a` 和 `b` 具有相同的结构了，因为它们的结构中只描述了它们都具有 `name` 和 `text` 这样的情况。



当然，这也是有例外的。我们在上面的代码中再加入一行。

```js
a[1111] = 'aaa'
```

![image-20220410155329262](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-149.png)

可以看到，此时隐藏类发生了变化，`Element` 中的数据存放也变得没有规律了。这是因为，当我们添加了 `a[1111]` 之后，数组会变成稀疏数组。**为了节省空间，稀疏数组会转换为哈希存储的方式，而不再是用一个完整的数组描述这块空间的存储。**所以，这几个可索引属性也不能再直接通过它的索引值计算得出内存的偏移量。至于隐藏类发生变化，可能是为了描述 `Element` 的结构发生改变。



### 命名属性的不同存储方式



V8 中命名属性有三种的不同存储方式：对象内属性（in-object）、快属性（fast）和慢属性（slow）。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-150.png)

这里先总结一下特点：

- 对象内属性保存在对象本身，提供最快的访问速度。
- 快属性比对象内属性多了一次寻址时间。
- 慢属性与前面的两种属性相比，会将属性的完整结构存储，速度最慢。

接下来，我们通过实验，慢慢理解上面的特点。

```js
// 三种不同类型的 Property 存储模式
function Foo2() {}

var a = new Foo2()
var b = new Foo2()
var c = new Foo2()

for (var i = 0; i < 10; i ++) {
  a[new Array(i+2).join('a')] = 'aaa'
}

for (var i = 0; i < 12; i ++) {
  b[new Array(i+2).join('b')] = 'bbb'
}

for (var i = 0; i < 30; i ++) {
  c[new Array(i+2).join('c')] = 'ccc'
}
```

![image-20220410161836882](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-151.png)

#### 对象内属性和快属性



首先我们看一下 a 和 b。从某种程度上讲，对象内属性和快属性实际上是一致的。只不过，对象内属性是在对象创建时就固定分配的，空间有限。在我的实验条件下，对象内属性的数量固定为十个，且这十个空间大小相同（可以理解为十个指针）。当对象内属性放满之后，会以快属性的方式，在 `properties` 下按创建顺序存放。相较于对象内属性，快属性需要额外多一次 `properties` 的寻址时间，之后便是与对象内属性一致的线性查找。



#### 慢属性



接着我们来看看 c。这个实在是太长了，只截取了一部分。可以看到，和 b （快属性）相比，`properties` 中的索引变成了毫无规律的数，意味着这个对象已经变成了哈希存取结构了。



#### 为什么要分三种存储方式？



可以这么看，早期的 JS 引擎都是用慢属性存储，前两者都是出于优化这个存储方式而出现的。

我们知道，所有的数据在底层都会表示为二进制。我们又知道，如果程序逻辑只涉及二进制的位运算（包含与、或、非），速度是最快的。下面我们忽略寻址的等方面的耗时，单纯从计算的次数来比较这三种（两类）方式。

对象内属性和快属性做的事情很简单，线性查找每一个位置是不是指定的位置，这部分的耗时可以理解为至多 N 次简单位运算（N 为属性的总数）的耗时。而慢属性需要先经过哈希算法计算。这是一个复杂运算，时间上若干倍于简单位运算。另外，哈希表是个二维空间，所以通过哈希算法计算出其中一维的坐标后，在另一维上仍需要线性查找。所以，当属性非常少的时候为什么不用慢属性应该就不难理解了吧。



#### 那为什么不一直用对象内属性或快属性呢？



这个问题需要我们对 `hashMap` 的结构有一定的了解。我这里画了一张图，简述了 `hashMap` 的用法

![image-20220410164052235](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-152.png)

了解 `haspMap ` 后，我们再来看下 V8 中字符串的哈希算法，其中光是左移和右移就有 60 次（60 次简单位运算）。

```c++
// V8 中字符串的哈希值生成器
uint32_t StringHasher::GetHashCore(uint32_t running_hash) {
  running_hash += (running_hash << 3);
  running_hash ^= (running_hash >> 11);
  running_hash += (running_hash << 15);
  int32_t hash = static_cast<int32_t>(running_hash & String::kHashBitMask);
  int32_t mask = (hash - 1) >> 31;
  return running_hash | (kZeroHash & mask);
}
```

这时候我们再来回答一下为什么不一直用对象内属性或快属性这个问题。

因为属性太多的时候，这两种方式可能就没有慢属性快了。假设哈希运算的代价为 60 次简单位运算，哈希算法的表现良好。如果只用对象内属性或快属性的方式存，当我需要访问第 120 个属性，就需要 120 次简单位运算。而使用慢属性，我们需要一次哈希计算（60 次简单位运算）+ 第二维的线性比较（远小于 60 次，已假设哈希算法表现良好，那属性在哈希表中是均匀分布的）。



### 神奇的 delete 操作

了解了隐藏类和对象存储逻辑后，我们再看看delete操作对隐藏类和存储逻辑的影响。

```js
function Foo3 () {}
var a = new Foo3()
var b = new Foo3()

for (var i = 1; i < 8; i ++) {
  a[new Array(i+1).join('a')] = 'aaa'
  b[new Array(i+1).join('b')] = 'bbb'
}

delete a.a
```

![image-20220410165425652](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-153.png)

按照我们之前试验的，a 和 b 本身都是对象内属性。从快照可以看到，删除了 `a.a` 后，a 变成了慢属性，退回哈希存储。

但是，如果我们按照添加属性的顺序逆向删除属性，情况会有所不同。

```js
function Foo4 () {}
var a = new Foo4()
var b = new Foo4()

a.name = 'aaa'
a.color= 'aaa'
a.text = 'aaa'

b.name = 'bbb'
b.color = 'bbb'

delete a.text
```

![image-20220410165733535](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-154.png)

我们给 a 和 b 按相同属性添加相同的属性 `name` 和 `color`，再给 a 额外添加一个属性 `text`，然后删除这个属性。可以发现，此时 a 和 b 的隐藏类相同，a 也没有退回哈希存储。



### 总结与启示

- 属性分为命名属性和可索引属性，命名属性存放在 `Properties` 中，可索引属性存放在 `Elements` 中。
- 命名属性有三种不同的存储方式：对象内属性、快属性和慢属性，前两者通过线性查找进行访问，慢属性通过哈希存储的方式进行访问。
- 总是以相同的顺序初始化对象成员，能充分利用相同的隐藏类，进而提高性能。
- 增加或删除可索引属性，不会引起隐藏类的变化，稀疏的可索引属性会退化为哈希存储。
- delete 操作可能会改变对象的结构，导致引擎将对象的存储方式降级为哈希表存储的方式，不利于 V8 的优化，应尽可能避免使用（当沿着属性添加的反方向删除属性时，对象不会退化为哈希存储）。



### 下篇文章


本文主要探究了V8引擎对JS对象的实现与优化，其实还有一个东西我们一直没有提到，就是继承。当然如果谈到继承那就必然会提到函数、prototype、\_\_proto\_\_ 等一些抽象难懂的概念，我的下一篇文章也正是想通过与本文类似的方式，去从V8引擎的角度观察是如何实现继承的，相信能给你一个不一样的视角去理解这其中的奥妙。

那么，我们下一篇文章见。



## 参考文章



[图解 V8](https://time.geekbang.org/column/intro/100048001?tab=catalog)

[V8是怎么跑起来的——V8中的对象表示](https://www.cnblogs.com/chargeworld/p/12236848.html)

[JavaScript 引擎基础：Shapes 和 Inline Caches](https://zhuanlan.zhihu.com/p/38202123)

[hashMap](https://www.bilibili.com/video/BV13g41157hK?p=11)

[JavaScript对象模型-执行模型](https://www.cnblogs.com/RicCC/archive/2008/02/15/JavaScript-Object-Model-Execution-Model.html)

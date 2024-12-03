---
title: 尝试一篇文章说清JS继承（文字、内存、图片三方面解析__proto__、constructor、prototype）
tags:
  - 面试
createTime: 2022/05/04
permalink: /article/75ciu5dv/
---
什么是JS的继承？

在编程中，我们经常会想获取并扩展一些东西。

例如，我们有一个 `user` 对象及其属性和方法，并希望将 `admin` 和 `guest` 作为基于 `user` 稍加修改的变体。我们想重用 `user` 中的内容，而不是复制/重新实现它的方法，而只是在其之上构建一个新的对象。

这时候JS的继承特性就可以帮我们完成这一需求，准确点来说应该叫**原型继承**，这里的原型是一个对象，后面我们会展开说。

`（PS：文章中有些观点和说法属于个人理解，如有不同观点欢迎讨论）`


### 概念



在了解继承之前，我们要先了解“函数即对象”和原型对象。



#### 函数即对象



直接看代码理解（这里用到了`constructor`做例子，后面还会详细介绍）：

```js
function Foo() {}
console.log(Foo.constructor) 
// ƒ Function() { [native code] }
console.log(Function.constructor) 
// ƒ Function() { [native code] }
console.log(Object.constructor) 
// ƒ Function() { [native code] }
Object.constructor === Function.constructor
// true
Foo.constructor === Function.constructor
// true
Function.constructor === Function
// true
```

首先从上面的代码我们可以知道：

- `Foo` 虽然是个函数，但它依然可以像对象一样获取属性值
- `Foo、Function、Object`这些方法的构造函数都是`Function`
- `Function.constructor === Function` 表明 `Function` 的构造函数就是自己（后面还会详述），说明 `Function` 具有**自举性**（这是JS的特性，不用过多纠结）

然后我们想一下，JS存在的各种内置对象`Object、Array、Number`等等，它们本质都是一个函数，而 JS 中的各种类型的数据都是由这些那些的函数对象生成的，所以是不是可以说 `Function` 才是 JS 中最大的“幕后黑手”。我们看下下面这张图：

![20220504012245.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-155.png)

是不是有点绕了，我们可以把`Function`当成JS世界里面的造物主，那么常见的对象、数组、正则、日期等等对象都是已经约定好的，我们只需要创建实例对象直接用就行，但是如果这些已经约定好的对象满足不了我们的需求，我们就可以用`Function`去创造我们自己想要的函数对象。

总结就是一句话，**对象由函数创建，函数都是Function对象实例。**



#### 原型对象



prototype object，翻译过来就是原型对象， 顾名思义就是 `prototype` 指向的对象。

在 JavaScript 中，每当定义一个对象（函数） 时候，对象中都会包含一些预定义的属性，我们可以想象这些预定义的属性都在一个叫原型对象的地方存着，也就是说把对象当成两块去理解，一块是本体，一块是原型对象。

原型对象本身又是一个普通对象，所以它也有自己的原型对象。这里简单引出，后面还会补充。



### 相关属性



在了解 \_\_proto\_\_、prototype、constructor 之前先了解一下：

- `__proto__`和`constructor`属性是**对象**所独有的
- `prototype`属性是**函数**所独有的
- JS中函数也是一种对象，所以函数也拥有`__proto__`和`constructor`属性

这三个基本概念我们要记住，这有助于我们理解下面的内容。



#### \_\_proto\_\_



在 JavaScript 中，对象有一个特殊的隐藏属性 `[[Prototype]]`（规范中所命名的），它要么为 `null`，要么就是对另一个对象的引用。该对象被称为“原型”：


![20220504150858.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-156.png)



属性 `[[Prototype]]` 是内部的而且是隐藏的，但是有很多设置它的方式，其中之一就是使用特殊的名字 `__proto__`，我们就把该属性 `__proto__ ` 称之为该**对象的原型 (prototype)**，`__proto__ `指向了内存中的另外一个对象，我们就把` __proto__ `指向的对象称为该对象的**原型对象**，那么该对象就可以直接访问其原型对象的方法或者属性。

值得注意的是 ` __proto__ ` 指向的不是自己的原型对象，而是父对象的，简而言之，由谁创建的指向谁的原型对象。



我们可以把`__proto__` 和 `[[Prototype]]`当成一回事吗？

> `__proto__` 是 `[[Prototype]]` 的因历史原因而留下来的 getter/setter。
>
> 初学者常犯一个普遍的错误，就是不知道 `__proto__` 和 `[[Prototype]]` 的区别。
>
> 请注意，`__proto__` 与内部的 `[[Prototype]]` **不一样**。`__proto__` 是 `[[Prototype]]` 的 getter/setter，换句话说`__proto__` 是一种访问 `[[Prototype]]` 的方式，而不是 `[[prototype]]` 本身。
>
> `__proto__` 属性有点过时了。它的存在是出于历史的原因，建议我们应该使用函数 `Object.getPrototypeOf/Object.setPrototypeOf` 来取代 `__proto__` 去 get/set 原型。
>
> 根据规范，`__proto__` 必须仅受浏览器环境的支持。但实际上，包括服务端在内的所有环境都支持它，因此我们使用它是非常安全的。



##### 代码分析



我们先看下下面的代码：

```js
function Foo() {}
let foo = new Foo()
let obj = new Object()
obj.tag = 'test'
console.log(foo.__proto__) 
// {constructor: ƒ}
console.log(foo.__proto__.__proto__) 
// {constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, …}
console.log(foo.__proto__.__proto__.__proto__)
// null
Object.__proto__ === Foo.__proto__
// true
obj.__proto__ === foo.__proto__.__proto__
// true
```

首先，我们定义了一个函数`Foo`，然后我们通过 `new` 关键字创建了一个 `foo` 实例对象，又用`Object`创建了一个 `obj`实例对象 。

这里我们要明白一点，`Foo`是一个函数对象，它是有原型对象的，`foo`是一个实例，也就是一个普通对象。

- `foo.__proto__` 是 `Foo` 的原型对象，注意是原型对象不是`Foo`本身
- 因为原型对象是一个普通对象，所以 `foo.__proto__.__proto__` 是`Object`的原型对象
- 而普通对象的原型对象已经是原型链的末尾了，所以 `foo.__proto__.__proto__.__proto__` 为 `null`
- `Object.__proto__ === Foo.__proto__` 这个怎么理解呢，因为`Object`和`Foo`都是函数对象，所以他们都继承于`Function`，所以都指向了`Function`的原型对象
- `obj.__proto__ === foo.__proto__.__proto__` 这个其实也很简单，`obj` 是一个普通对象，而`foo.__proto__`是 `Foo` 的原型对象，自然也是一个普通对象，它们都指向了`Object`的原型对象

为什么JS对象的原型对象也是对象，得到的却是 `null` ，道理也很简单，如果不是那么原型链的查询就会陷入死循环，设计如此，不必纠结。



##### 内存快照分析



接着我们再来看看上述代码在内存快照中的情况：


![20220504161222.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-157.png)

因为`Function`和`Object`是JS内置对象，所以不好在内存快照中定位，图中就省去这两个点，其他的内存快照和我们预想的一样，都能对上。



##### 图片总结



下面我们画张图来总结一下上面的结论。


![20220504145601.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-158.png)

可以看到`__proto__`属性都是由**一个对象指向一个对象**，即指向它们的原型对象。那它的作用是什么呢？

当访问一个对象的属性时，如果该对象内部不存在这个属性，那么就会去它的`__proto__`属性所指向的那个对象（可以理解为父对象）里找，如果父对象也不存在这个属性，则继续往父对象的`__proto__`属性所指向的那个对象（可以理解为爷爷对象）里找，如果还没找到，则继续往上找……直到原型链顶端`null`，再往上找就相当于在`null`上取值，会报错，找不到了，到此结束，`null`为原型链的终点，由以上这种通过`__proto__`属性来连接对象直到`null`的一条链即为我们所谓的**原型链**。



##### 修改\_\_proto\_\_



那我们可以修改`__proto__`吗？答案是肯定的。

```js
foo.__proto__ = null
```

但是设置`__proto__`也是存在限制的：

- 引用不能形成闭环。如果我们试图在一个闭环中分配 `__proto__`，JavaScript 会抛出错误
- `__proto__` 的值可以是对象，也可以是 `null`，而其他的类型都会被忽略

当然，这可能很显而易见，但是仍然要强调：只能有一个 `[[Prototype]]`。一个对象不能从其他两个对象获得继承。



既然`__proto__`是可以修改的，那好像我们可以使用`__proto__`来实现继承了，但是我们印象中都是使用函数的独有属性`prototype`来实现继承的，为什么？

通常隐藏属性是不能使用 JavaScript 来直接与之交互的。虽然现代浏览器都开了一个口子，让 JavaScript 可以访问隐藏属性`__proto__`，但是在实际项目中，我们不应该直接通过`__proto__`来访问或者修改该属性，其主要原因有两个：

- 首先，这是隐藏属性，并不是标准定义的
- 其次，使用该属性会造成严重的性能问题

综上所述，`__proto__`仅供浏览器引擎内部使用，一般情况下我们不会用到。



#### constructor



constructor，直译过来就是构造器，它是从**一个对象指向一个函数**，含义就是**指向该对象的构造函数**。前面我们提到`constructor`属性是**对象**所独有的，每个对象都有构造函数，但不代表每个对象上都有构造函数，**一部分是本身拥有，一部分是继承而来**，总之我们总能找到其对应的构造函数。



##### 代码&&内存快照分析



还是之前的代码：

```js
function Foo() {}
let foo = new Foo()
foo.constructor === Foo
// true
Foo.constructor === Function
// true
Function.constructor === Function
// true
```

似乎光看代码还是云里雾里，那么我们再观察一下内存快照：


![20220504222916.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-159.png)

- 首先是 `foo.constructor === Foo` ，上图显示`foo`本身并没有构造函数，所以按照继承链查询，去到了`__proto__`属性中查找，在`Foo`的原型对象中找到了构造函数，内存地址显示，构造器指向了`Foo`，所以条件成立
- 然后是`Foo.constructor === Function`，上图显示`Foo`本身也没有构造函数，然后找到`Function`的原型对象中的构造函数，内存地址显示指向了`Function`，所以条件成立
- 最后是`Function.constructor === Function`，这就不用多说了，前面也提到过 `Function` 的构造函数就是自己，与`__proto__`的最终指向为`null`不同，`Function`的自我循环指向，也说明了 `Function` 具有**自举性**，自己创造了自己，是不是很神奇，不过我们也不必过多纠结，这就是语言特性

总结一句话就是，**所有函数对象最终的构造函数都指向Function**。



##### 图片总结



现在我们用一张图来总结一下：


![20220619142414.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-160.png)

为了方便比较，我们把之前的`__proto__`放在一起作比较，可以很清楚的看出，`constructor`只存在于函数的原型对象之中，并且指向其本身，如果当前对象本身不存在`constructor`属性，那么按照继承链，会到父对象的原型对象中寻找。



#### prototype



最后要说的就是我们耳熟能详的`prototype`属性了。

首先我们再回顾一下前面说的，`prototype`属性是**函数**所独有的，它是从**一个函数指向一个对象**，它的含义是**函数的原型对象**。这里要注意的是，匿名函数`()=>{}`不存在`prototype`属性。

```js
let a = {}
console.log(a.prototype)
// undefind
let b = function () {}
console.log(b.prototype)
// {constructor: ƒ}
let c = () => {}
console.log(c.prototype)
// undefind
```

现在回头看看之前说的`__proto__`，虽然我们可以在任何对象上获取到它，但它总是指向父对象的原型对象。那么`prototype`的作用就显而易见了：**它可以指向当前对象的原型对象也可以是任意的原型对象，目的就是让该函数所实例化的对象们都可以找到我们想要的公用属性和方法。任何函数在创建的时候，其实会默认同时创建该函数的prototype对象，它指向当前对象的原型对象。**

想想我们之前的例子中的`foo`，它的`__proto__`指向的是不是`Foo`的原型对象，那么按照我们刚刚说的就会存在这个等式：`foo.__proto__===Foo.prototype`。

```js
function Foo() {}
let foo = new Foo()
```


![20220702204841.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-161.png)


> `Foo.prototype` 属性仅在 `new Foo` 被调用时使用，它为新对象的 `[[Prototype]]` 赋值。
>
> 如果在创建之后，`Foo.prototype` 属性有了变化（`Foo.prototype = <another object>`），那么通过 `new Foo` 创建的新对象也将随之拥有新的对象作为 `[[Prototype]]`，但已经存在的对象将保持旧有的值。



##### 公共方法的创建



那么接下来我们想给所有由`Foo`函数所创建的实例一个公用方法`logName`应该怎么做呢，我们接着往下看。

```js
function Foo() {}
let foo1 = new Foo()
let foo2 = new Foo()
foo1.logName = () => {console.log('name')}
foo2.logName = () => {console.log('name')}
console.log(foo1.logName===foo2.logName)
// false
```


![20220702220953.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-162.png)


通过内存快照我们可以看到，两个实例的`logName`方法都是直接放在对象里面的，而`foo1`和`foo2`又各自存储在不同的内存空间中，所以两个方法自然没有任何关联。但是我们可以看到两个实例的`__proto__`都指向了同一个地址，根据我们之前说的很容易就能推断出，它指向的就是`Foo`的原型对象，而前面也提到了我们并不推荐直接修改`__proto__`属性，那么我们就需要通过`Foo.prototype`去修改`Foo`的原型对象。

```js
function Foo() {}
Foo.prototype.logName = () => {console.log('name')}
let foo1 = new Foo()
let foo2 = new Foo()
console.log(foo1.logName===foo2.logName)
// true
```


![20220702221849.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-163.png)

现在我们可以看，出两个实例的`logName`方法已经不再是其本身的方法了，所以它们都要去`__proto__`中寻找，所以两者指向的`logName`自然是同一个了。



##### 自定义继承的实现



看完公共方法，我们再来看看自定义继承是怎么实现的。

```js
let animal = {
  eats: true
}
function Rabbit(name) {
  this.name = name
}
Rabbit.prototype = animal
let rabbit = new Rabbit("White Rabbit")
console.log(rabbit.__proto__ === animal)
// true
console.log(rabbit.eats)
// true
console.log(rabbit.constructor)
// ƒ Object() { [native code] }
```

观察一下上面这段代码，我们修改了函数`Rabbit`的`prototype`，使其指向了`animal`，乍一看好像没啥问题，但是最后的`rabbit.constructor`却指向了`Object`。


![20220709230831.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-164.png)

我们或许记得有一种判断类型的方式就是使用`constructor`属性，如果是这种情况，我们更希望构造器指向的是`Rabbit`或者是`animal`。这也就是我们前面提到的：**JavaScript 自身并不能确保正确的 `"constructor"` 函数值！**

因为我们可能在代码的任何地方修改一个函数的`prototype`，如果只是简单的添加属性或许影响不了什么，但是一旦对其进行重新赋值，我们就没法保证`constructor`的值符合我们的预期了。

这时我们可以换一种写法：

```js
let animal = {
  eats: true
}
function Rabbit(name) {
  this.name = name
}
Rabbit.prototype = {
	...animal,
    constructor: Rabbit
}
let rabbit = new Rabbit("White Rabbit")
console.log(rabbit.__proto__ === animal)
// false
console.log(rabbit.eats)
// true
console.log(rabbit.constructor)
// ƒ Rabbit() { ... }
```


![20220709231547.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-165.png)

这里我们手动创建了一个新对象，并且指定了`constructor`，这样就可以保证其符合我们的预期了。

如果我们想`constructor`指向`animal`也很简单，代码如下：

```js
function Animal() {}
Animal.prototype.eats = true
function Rabbit(name) {
  this.name = name
}
Rabbit.prototype = Animal.prototype
let rabbit = new Rabbit("White Rabbit")
console.log(rabbit.__proto__ === Animal.prototype)
// true
console.log(rabbit.eats)
// true
console.log(rabbit.constructor)
// ƒ Animal() {}
```


![20220709232147.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-166.png)

通过上面三种写法我们应该可以体会到`constructor`指向的不稳定性，所以当我们作类型判断的时候，尤其是非内建构造函数构造的对象，可能会造成错误的判断。



##### 注意点



这里还有一点值得我们注意的是，`prototype` 的值要么是一个对象，要么就是 `null`：其他值都不起作用。

```js
function Foo1() {}
function Foo2() {}
Foo1.prototype = 'foo1'
let foo1 = new Foo1()
let foo2 = new Foo2()
console.log(foo1.__proto__)
// {constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ …}
console.log(foo2.__proto__)
// {constructor: ƒ}
console.log(Foo1.prototype)
// foo1
```


![20220709234100.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-167.png)

很明显地可以看出，`Foo1`的`prototype`已经成为了一个普通的属性，也就是说它丢失了自己的构造函数，所以`new Foo1`的时候，已经成为了一个普通的`Object`对象。至于为什么是`Object`对象，那就要从创建对象的详细过程中寻找答案了，这里就不再深入了。



### 参考文章



[原型继承](https://zh.javascript.info/prototype-inheritance)

[JavaScript对象模型-执行模型](https://www.cnblogs.com/RicCC/archive/2008/02/15/JavaScript-Object-Model-Execution-Model.html)

[用自己的方式（图）理解constructor、prototype、\_\_proto\_\_和原型链](https://juejin.cn/post/6844903837623386126)

[帮你彻底搞懂JS中的prototype、\_\_proto\_\_与constructor（图解）](https://blog.csdn.net/cc18868876837/article/details/81211729)

[JS中（constructor属性）](https://blog.csdn.net/Spirit_Breeze/article/details/80953112)

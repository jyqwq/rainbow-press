---
title: 手写Promise
tags:
  - 学习
  - 面试
createTime: 2021/10/11
permalink: /article/3sidyeq1/
---
## 说在前面



本篇文章并非原创，主要是阅读了一些Promise相关的文章个人做的一个总结性文章。

主要参考了以下几篇文章：

- [从一道让我失眠的 Promise 面试题开始，深入分析 Promise 实现细节](https://juejin.cn/post/6945319439772434469)
- [看完还不懂JavaScript执行机制(EventLoop)，你来捶我](https://juejin.cn/post/6992985462163898382)
- 其余没有标注的在文章中会通过链接的方式标出

原文写的非常好，不是说那种很难理解的东西，而是认真看了可以对这些知识有自己的理解从而记住它们，强烈推荐完整看完。



## 了解Promise之前



### [任务队列（消息队列）](https://juejin.cn/post/6992985462163898382)



简单理解就是一种数据结构，存放要执行的任务，既然是队列那就是先进先出，顺序执行。

再看看任务队列的任务类型有哪些：

鼠标滚动、点击、移动、输入、计时器、WebSocket、文件读写、解析DOM、计算样式、计算布局、JS执行.....

这些任务都在主线程中执行，而JS是单线程的，一个任务执行需要等前面的任务都执行完，所以就需要解决单个任务占用主线程过久的问题。

如果是DOM频繁发生变化的JS任务，每次变化都需要调用相应的JavaScript接口，无疑会导致任务时间拉长，如果把DOM变化做成异步任务，那可能添加到任务队列过程中，前面又有很多任务在排队了。

所以`为了处理高优先级的任务`，`和解决单任务执行过长的问题`，所以需要将任务划分，所以微任务和宏任务它来了。

在说微任务之前，要知道一个概念就是**同步**和**异步**。



### 同步与异步



`同步任务`：就是任务一个一个执行，如果某个任务执行时间过长，后面的就只能一直等下去。

`异步任务`：就是进程在执行某个任务时，该任务需要等一段时间才能返回，这时候就把这个任务放到专门处理异步任务的模块，然后继续往下执行，不会因为这个任务而阻塞。



**常见的异步任务**：定时器、ajax、事件绑定、回调函数、async await、promise。



### 微任务和宏任务



JS执行时，V8会创建一个全局执行上下文，在创建上下文的同时，**V8也会在内部创建一个微任务队列**。

**有微任务队列，自然就有宏任务队列，任务队列中的每一个任务则都称为宏任务，在当前宏任务执行过程中，如果有新的微任务产生，就添加到微任务队列中**。



看一下宏任务和微任务具体有哪些：

| 宏任务               | 微任务                             |
| -------------------- | ---------------------------------- |
| 渲染事件             | **Promise.[ then/catch/finally ]** |
| **请求**             | proxy                              |
| **script代码块**     | MutationObserver(监听DOM)          |
| **setTimeout**       | node 中的 process.nextTick         |
| **setInterval**      | **queueMicrotask**                 |
| Node中的setImmediate | **async/await**                    |
| I/O                  | ...                                |
| ...                  |                                    |



再看一下执行顺序：

（[图片来源](https://juejin.cn/post/6844903638238756878)）

![image-20210828113355946](/Users/jiyuan/Library/Application%20Support/typora-user-images/image-20210828113355946.png)



从上图可以得出：**当前宏任务里的微任务全部执行完，才会执行下一个宏任务**。



结合上面的描述，在把逻辑图画地完整点：

（[图片来源](https://juejin.cn/post/6992985462163898382#heading-3)）

![image-20210828114457672](/Users/jiyuan/Library/Application%20Support/typora-user-images/image-20210828114457672.png)



不管是上张图还是这张图都能看出来其实是有个循环的，那么这个循环就叫**事件循环（Event Loop）**。



### 事件循环（Event Loop）



事件循环：一句话概括就是入栈到出栈的循环

即：一个宏任务，所有微任务，渲染，一个宏任务，所有微任务，渲染.....

**循环过程**：

1. 所有同步任务都在主线程上依次执行，形成一个执行栈(调用栈)，异步任务处理完后则放入一个任务队列
2. 当执行栈中任务执行完，再去检查微任务队列里的微任务是否为空，有就执行，如果执行微任务过程中又遇到微任务，就添加到微任务队列末尾继续执行，把微任务全部执行完
3. 微任务执行完后，再到任务队列检查宏任务是否为空，有就取出最先进入队列的宏任务压入执行栈中执行其同步代码
4. 然后回到第2步执行该宏任务中的微任务，如此反复，直到宏任务也执行完，如此循环



## 举个例子



```js
<script> // 宏任务
  console.log(1)
	setTimeout(()=>{ // 宏任务
      console.log(2)
    })
    new Promise( resolve => {
      	setTimeout(()=>{ // 宏任务
          console.log(3)
        })
        resolve(4) // 回调 是微任务
        console.log(5)
    }).then( num => {
        console.log(num)
    })
	function a(){
      console.log(6)
    }
	async function b(){
      await a()
      console.log(7)
    }
	b()
    console.log(8)
</script>
```



好好体会一下这个例子的输出结果，然后通过之前说的，看能不能能加以理解与解释。



### 特别说明

```js
ajax(...successCallback: (res)=>{console.log(1)});
setTimeout(()=>{console.log(2)})
```

入上述代码所示，是先输出1还是2？

首先我们知道`ajax`和定时器都是宏任务，那这里就要确认这种不确定回调时间的宏任务是直接加入宏任务队列的吗？

答案是否定的，比如`setTimeout`在js执行到的时候是不会直接往宏任务队列中添加的，js会开启一个计时器线程，等到计时器时间到了，再添加到宏任务队列。

那么以此类推，`ajax`请求应该也是类似的，只有请求返回了，才会把回调任务加入宏任务队列。

再回头看在上面的代码我们知道，浏览器中计时器最小时间为`4ms`，也就是说`4ms`之后输出2，但是`ajax`请求的过程就比较复杂，即使很快的返回了，那也是需要经历一整个网络请求流程，所以不会在`4ms`之内完成，所以我们可以基本确定，先输出2，再输出1。

当然这块只是我个人的理解，可以提出疑问。



## Promise的用法分析



说完了事件循环与宏任务微任务，再看Promise是怎么实现的。

实现之前，首先了解一下promise的用法，再去分析promise有哪些特性：



```js
// 静态调用
Promise.reject('err').then(()=>{console.log(111)},(res)=>{console.log(res)})
Promise.resolve(222).then(()=>{console.log(111)},(res)=>{console.log(res)})
Promise.resolve(new Promise((re,rj)=>{console.log(666);rj(777);})).then(()=>{console.log(111)},(res)=>{console.log(res)})
Promise.then() // Uncaught TypeError: Promise.then is not a function
// 创建实例
new Promise((resolve, reject) => {
      console.log(1);
      setTimeout(()=>{
          resolve(2);
      })
      console.log(3);
    })
      .then(res => {
        console.log(res);
        throw new Error('4');
      })
      .then(
        res => {},
        res => {
          console.log(res);
        },
      );
```



初步来看，Promise有以下特点：

- Promise 是一个类，在执行这个类的时候会传入一个函数，这个函数会立即执行。
- Promise 会有三种状态
  - Pending 等待
  - Fulfilled 完成
  - Rejected 失败
- 状态只能由 Pending --> Fulfilled 或者 Pending --> Rejected，且一但发生改变便不可二次修改。

- 三个方法`reject`、`resolve`、`then`。其中前两个可以直接调用，也可以在回调中使用，说明是内部方法也是静态方法。`then`可以链式调用，说明应该是返回了一个新的Promise对象。
- Promise 中使用 resolve 和 reject 两个函数来更改状态。

- 每次调用`then`都创建了微任务。
  - 如果状态是成功，调用成功回调函数
  - 如果状态是失败，调用失败回调函数



## Promise的实现



### 创建MyPromise类



Promise 是一个类，在执行这个类的时候会传入一个函数，这个函数会立即执行。



```js
// 新建 MyPromise.js

// 新建 MyPromise 类
class MyPromise {
  constructor(executor){
    // executor 是一个执行器，进入会立即执行
    executor() 
  }
}
```



### 创建reject与resolve函数



`reject`、`resolve` 函数



```js
class MyPromise {
  constructor(executor){
    // 传入resolve和reject方法
    executor(this.resolve, this.reject) 
  }
  // resolve和reject为什么要用箭头函数？
  // 如果直接调用的话，普通函数this指向的是window或者undefined
  // 用箭头函数就可以让this指向当前实例对象
  // 更改成功后的状态
  resolve = () => {}
  // 更改失败后的状态
  reject = () => {}
}
```



### 三种状态的管理



```js
// 先定义三个常量表示状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
	...
  // 储存状态的变量，初始值是 pending
  status = PENDING;

  // 成功之后的值
  value = null;
  // 失败之后的原因
  reason = null;

  resolve = (value) => {
    // 只有状态是等待，才执行状态修改
    if (this.status === PENDING) {
      // 状态修改为成功
      this.status = FULFILLED;
      // 保存成功之后的值
      this.value = value;
    }
  }

  reject = (reason) => {
    // 只有状态是等待，才执行状态修改
    if (this.status === PENDING) {
      // 状态成功为失败
      this.status = REJECTED;
      // 保存失败后的原因
      this.reason = reason;
    }
  }
}

```



### 创建then函数



```js
class MyPromise {
  ...
  then(onFulfilled, onRejected) {
    // 判断状态
    if (this.status === FULFILLED) {
      // 调用成功回调，并且把值返回
      onFulfilled(this.value);
    } else if (this.status === REJECTED) {
      // 调用失败回调，并且把原因返回
      onRejected(this.reason);
    }
  }
}
```



### 加入异步逻辑



上面还没有经过异步处理，如果有异步逻辑加如来会带来一些问题，例如：

```js
// test.js

const MyPromise = require('./MyPromise')
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 2000); 
})

promise.then(value => {
  console.log('resolve', value)
}, reason => {
  console.log('reject', reason)
})

// 没有打印信息！！！
```



分析一下：

因为传入的函数是直接运行的，但是传入的函数中有异步操作存在，所以直接执行到了`then`函数中，但此时`promise`的状态还有没有通过`resolve`函数改变成`fulfilled`，所以，按照我们上面写的`then`方法是不会用任何操作的，那么我们现在需要在`then`中加入对`fulfilled`状态的操作，让我们传入的函数能正确地在`promise`状态发生改变时作出回调。



```js
class MyPromise {
  ...
  // 存储成功回调函数
  onFulfilledCallback = null;
  // 存储失败回调函数
  onRejectedCallback = null;

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      // ==== 新增 ====
      // 判断成功回调是否存在，如果存在就调用
      this.onFulfilledCallback && this.onFulfilledCallback(value);
    }
  }

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      // ==== 新增 ====
      // 判断失败回调是否存在，如果存在就调用
      this.onRejectedCallback && this.onRejectedCallback(reason)
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    } else if (this.status === REJECTED) {
      onRejected(this.reason);
    } else if (this.status === PENDING) {
      // ==== 新增 ====
      // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
      // 等到执行成功失败函数的时候再传递
      this.onFulfilledCallback = onFulfilled;
      this.onRejectedCallback = onRejected;
    }
  }
}
```



### 实现then的多次调用



先看一下下面代码的执行结果：

```js
// test.js

const MyPromise = require('./MyPromise')
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 2000); 
})

promise.then(value => {
  console.log(1)
  console.log('resolve', value)
})
 
promise.then(value => {
  console.log(2)
  console.log('resolve', value)
})

promise.then(value => {
  console.log(3)
  console.log('resolve', value)
})

// 3
// resolve success
```



从`promise`的表现来看，`then`的多次调用是依次执行的，但按照我们上面的写法，每次调用都会把存储成功回调函数和存储失败回调函数的对象覆盖，那么，在传入函数是异步返回的情况下，我们只能拿到最后一个`then`的执行结果。

那么解决办法就是把存储回调函数的对象变成一个数组，然后循环依次调用就可以了。



```js
class MyPromise {
  ...
  // null改为数组
  onFulfilledCallbacks = [];
  onRejectedCallbacks = [];

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      // resolve里面将所有成功的回调拿出来执行
      while (this.onFulfilledCallbacks.length) {
        // Array.shift() 取出数组第一个元素，然后（）调用
        // shift不是纯函数，取出后，数组将失去该元素，直到数组为空
        this.onFulfilledCallbacks.shift()(value)
      }
    }
  }
  
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason)
      }
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    } else if (this.status === REJECTED) {
      onRejected(this.reason);
    } else if (this.status === PENDING) {
        // 直接赋值改为放入数组
        this.onFulfilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
    }
  }
}
```



### 实现then的链式调用



按照我们现在写的Promise执行下面的代码是会报错的：

```js
// test.js

const MyPromise = require('./MyPromise')
const promise = new MyPromise((resolve, reject) => {
  // 目前这里只处理同步的问题
  resolve('success')
})

function other () {
  return new MyPromise((resolve, reject) =>{
    resolve('other')
  })
}
promise.then(value => {
  console.log(1)
  console.log('resolve', value)
  return other()
}).then(value => {
  console.log(2)
  console.log('resolve', value)
})
// }).then(value => {
//   ^
// TypeError: Cannot read property 'then' of undefined
// 正常应该的返回为：
// 1
// resolve success
// 2
// resolve other
```



首先分析一下：

- `then`方法要链式调用那么就需要返回一个 `Promise` 对象

- `then`方法里面 `return` 一个返回值作为下一个 `then` 方法的参数，如果是 `return` 一个 `Promise` 对象，那么就需要判断它的状态



```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    // ==== 新增 ====
    // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
    const promise2 = new MyPromise((resolve, reject) => {
      // 这里的内容在执行器中，会立即执行
      if (this.status === FULFILLED) {
        // 获取成功回调函数的执行结果
        const x = onFulfilled(this.value);
        // 传入 resolvePromise 集中处理
        resolvePromise(x, resolve, reject);
      } else if (this.status === REJECTED) {
        onRejected(this.reason);
      } else if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
      }
    }) 
    
    return promise2;
  }
}

function resolvePromise(x, resolve, reject) {
  // 判断x是不是 MyPromise 实例对象
  if(x instanceof MyPromise) {
    // 执行 x，调用 then 方法，目的是将其状态变为 fulfilled 或者 rejected
    // x.then(value => resolve(value), reason => reject(reason))
    // 简化之后
    x.then(resolve, reject)
  } else{
    // 普通值
    resolve(x)
  }
}
```



### 循环调用异常判断



先看一下下面代码的执行结果：

```js
// test.js

const promise = new Promise((resolve, reject) => {
  resolve(100)
})
const p1 = promise.then(value => {
  console.log(value)
  return p1
})

// 100
// Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>
```



如果 `then` 方法返回的是自己的 `Promise` 对象，则会发生循环调用，这个时候程序会报错。

那么我们也需要给`MyPromise`添加对应的异常判断。



```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        const x = onFulfilled(this.value);
        // resolvePromise 集中处理，再将 promise2 传入，在resolvePromise里面进行类型判断
        resolvePromise(promise2, x, resolve, reject);
      }
      ...
    })
    return promise2;
  }
}

  function resolvePromise(promise2, x, resolve, reject) {
  // 如果相等了，说明return的是自己，抛出类型错误并返回
  if (promise2 === x) {
    const err = new TypeError('The promise and the return value are the same');
    console.log(err);
    return reject(err);
  }
  ...
}
```



再来执行一下试试：

```js
const MyPromise = require('./MyPromise')
const promise = new MyPromise((resolve, reject) => {
  resolve(100)
})
const p1 = promise.then(value => {
  console.log(value)
  return p1
})
```

逻辑看似没问题，但是执行出错：

```js
        resolvePromise(promise2, x, resolve, reject);
                       ^

ReferenceError: Cannot access 'promise2' before initialization
```

从错误提示可以看出，我们必须要等 `promise2` 完成初始化。这个时候我们就要用上宏微任务和事件循环的知识了，这里就需要创建一个异步函数去等待 `promise2` 完成初始化。



### 创建微任务



回顾之前创建微任务的方式，我们可以得出最优的方式为：`queueMicrotask`。

```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 创建一个微任务等待 promise2 完成初始化
        queueMicrotask(() => {
          // 获取成功回调函数的执行结果
          const x = onFulfilled(this.value);
          // 传入 resolvePromise 集中处理
          resolvePromise(promise2, x, resolve, reject);
        })  
      } else if (this.status === REJECTED) {
      ......
    }) 
    
    return promise2;
  }
}
```



这时候再试试上面的例子就没问题了。



### 捕获错误



捕获执行器中的代码，如果执行器中有代码错误，那么 `Promise` 的状态要变为失败。

```js
class MyPromise {
  constructor(executor){
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      // 如果有错误，就直接执行 reject
      this.reject(error)
    }
  }
  ......
}

```



还有`then`执行时的错误捕获。



```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          // ==== 新增 ====
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          }  
        })  
      }
      ...
    }) 
    return promise2;
  }
}
```



### 其他状态的完善



前面我们的所有功能都是围绕`fulfilled`这一状态去完善实现的，现在我们要把它们同样应用到另外两个状态中。下面是需要实现的功能：

1. 增加异步状态下的链式调用
2. 增加回调函数执行结果的判断
3. 增加识别 Promise 是否返回自己
4. 增加错误捕获

```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          } 
        })  
      } else if (this.status === REJECTED) { 
        // ==== 新增 ====
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          } 
        }) 
      } else if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          // ==== 新增 ====
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error)
            } 
          }) 
        });
        this.onRejectedCallbacks.push(() => {
          // ==== 新增 ====
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error)
            } 
          }) 
        });
      }
    }) 

    return promise2;
  }
}
```



### then 中的参数变为可选



看一下原生`Promise`的调用：

```js
// test.js

const promise = new Promise((resolve, reject) => {
  resolve(100)
})

promise
  .then()
  .then(value => {console.log(value);return 200},err => console.log(err))
  .then()
  .then(value => console.log(value))

// 输出 100 200
```



所以我们需要对 `then` 方法做一点小小的调整：

```js
class MyPromise {
  ......
  then(onFulfilled, onRejected) {
    // 如果不传，就使用默认函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason};

    const promise2 = new MyPromise((resolve, reject) => {
    ......
  }
}
```



### resolve 与 reject 的静态调用



在`Promise`的用法分析中我们使用了静态调用，可以发现的是，静态调用后可以使用`then`的链式调用，所以静态调用返回的应该也是一个`Promise`，而且静态方法`resolve`支持一个参数传入，如果是一个`Promise`对象就直接返回，如果不是就重新创建一个返回。`reject`也支持一个参数传入，与`resolve`不同的是，如果是个`Promise`那么，`then`里面会在`reject`回调直接返回`Promise`对象。



了解上述特性，我们再来看一下实现：

```js
class MyPromise {
  ......
  // resolve 静态方法
  static resolve (parameter) {
    // 如果传入 MyPromise 就直接返回
    if (parameter instanceof MyPromise) {
      return parameter;
    }

    // 转成常规方式
    return new MyPromise(resolve =>  {
      resolve(parameter);
    });
  }

  // reject 静态方法
  static reject (reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}

```



### Promise A+规范



看到 A+ 肯定会想到是不是还有 A，事实上确实有。其实 Promise 有多种规范，除了前面的 Promise A、promise A+ 还有 Promise/B，Promise/D。**目前我们使用的 Promise 是基于 Promise A+ 规范实现的**，感兴趣的移步 [Promise A+规范](https://link.juejin.cn?target=https%3A%2F%2Fpromisesaplus.com%2F)了解一下，这里不赘述。

检验一份手写 Promise 靠不靠谱，通过 Promise A+ 规范自然是基本要求，这里我们可以借助 [promises-aplus-tests](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fpromises-aplus-tests) 来检测我们的代码是否符合规范。



如何验证我们的promise是否正确

1、先在后面加上下述代码

2、npm 有一个promises-aplus-tests插件 npm i promises-aplus-tests -g 可以全局安装 mac用户最前面加上sudo

3、命令行 promises-aplus-tests [js文件名] 即可验证



```js
// 目前是通过他测试 他会测试一个对象
// 语法糖
MyPromise.defer = MyPromise.deferred = function () {
  let dfd = {}
  dfd.promise = new MyPromise((resolve,reject)=>{
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}
module.exports = MyPromise;
//npm install promises-aplus-tests 用来测试自己的promise 符不符合promisesA+规范
```



我们先在`package.json`里面加上测试指令：

```json
{
  "name": "promise",
  "version": "1.0.0",
  "description": "",
  "main": "MyPromise.js",
  "scripts": {
    "test": "promises-aplus-tests MyPromise"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  }
}
```



现在执行后会发现出现了错误，这里规范使用了不同的方式进行了 then 的返回值判断。

这里要求判断 x 是否为 object 或者 function，满足则接着判断 x.then 是否存在，这里可以理解为判断 x 是否为 promise，这里都功能实际与我们手写版本中 `x instanceof MyPromise` 功能相似。



那么再改造一下`resolvePromise`：

```js
class MyPromise {
    ......
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果相等了，说明return的是自己，抛出类型错误并返回
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (typeof x === 'object' || typeof x === 'function') {
    // x 为 null 直接返回，走后面的逻辑会报错
    if (x === null) {
      return resolve(x);
    }

    let then;
    try {
      // 把 x.then 赋值给 then 
      then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      let called = false;
      try {
        then.call(
          x, // this 指向 x
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量 called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 error：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
        if (called) return;

        // 否则以 error 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}
```



### 简易版手写Promise



```js
// MyPromise.js

// 先定义三个常量表示状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 新建 MyPromise 类
class MyPromise {
  constructor(executor){
    // executor 是一个执行器，进入会立即执行
    // 并传入resolve和reject方法
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }

  // 储存状态的变量，初始值是 pending
  status = PENDING;
  // 成功之后的值
  value = null;
  // 失败之后的原因
  reason = null;

  // 存储成功回调函数
  onFulfilledCallbacks = [];
  // 存储失败回调函数
  onRejectedCallbacks = [];

  // 更改成功后的状态
  resolve = (value) => {
    // 只有状态是等待，才执行状态修改
    if (this.status === PENDING) {
      // 状态修改为成功
      this.status = FULFILLED;
      // 保存成功之后的值
      this.value = value;
      // resolve里面将所有成功的回调拿出来执行
      while (this.onFulfilledCallbacks.length) {
        // Array.shift() 取出数组第一个元素，然后（）调用，shift不是纯函数，取出后，数组将失去该元素，直到数组为空
        this.onFulfilledCallbacks.shift()(value)
      }
    }
  }

  // 更改失败后的状态
  reject = (reason) => {
    // 只有状态是等待，才执行状态修改
    if (this.status === PENDING) {
      // 状态成功为失败
      this.status = REJECTED;
      // 保存失败后的原因
      this.reason = reason;
      // resolve里面将所有失败的回调拿出来执行
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason)
      }
    }
  }

  then(onFulfilled, onRejected) {
    const realOnFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const realOnRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason};

    // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () =>  {
        // 创建一个微任务等待 promise2 完成初始化
        queueMicrotask(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = realOnFulfilled(this.value);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          } 
        })  
      }

      const rejectedMicrotask = () => { 
        // 创建一个微任务等待 promise2 完成初始化
        queueMicrotask(() => {
          try {
            // 调用失败回调，并且把原因返回
            const x = realOnRejected(this.reason);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error)
          } 
        }) 
      }
      // 判断状态
      if (this.status === FULFILLED) {
        fulfilledMicrotask() 
      } else if (this.status === REJECTED) { 
        rejectedMicrotask()
      } else if (this.status === PENDING) {
        // 等待
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
        // 等到执行成功失败函数的时候再传递
        this.onFulfilledCallbacks.push(fulfilledMicrotask);
        this.onRejectedCallbacks.push(rejectedMicrotask);
      }
    }) 
    
    return promise2;
  }

  // resolve 静态方法
  static resolve (parameter) {
    // 如果传入 MyPromise 就直接返回
    if (parameter instanceof MyPromise) {
      return parameter;
    }

    // 转成常规方式
    return new MyPromise(resolve =>  {
      resolve(parameter);
    });
  }

  // reject 静态方法
  static reject (reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}

// MyPromise.js

function resolvePromise(promise, x, resolve, reject) {
  // 如果相等了，说明return的是自己，抛出类型错误并返回
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (typeof x === 'object' || typeof x === 'function') {
    // x 为 null 直接返回，走后面的逻辑会报错
    if (x === null) {
      return resolve(x);
    }

    let then;
    try {
      // 把 x.then 赋值给 then 
      then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      let called = false;
      try {
        then.call(
          x, // this 指向 x
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量 called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 error：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
        if (called) return;

        // 否则以 error 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}

MyPromise.defer = MyPromise.deferred = function () {
  let dfd = {}
  dfd.promise = new MyPromise((resolve,reject)=>{
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

module.exports = MyPromise;
```


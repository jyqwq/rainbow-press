---
title: Vue响应式实现原理
tags:
  - 面试
  - vue
createTime: 2021/10/11
permalink: /article/cj2bxhh5/
---
# Vue响应式实现原理

## Object.defineProperty

### 语法

```javascript
Object.defineProperty(obj, prop, descriptor)
```

### 参数

```
obj
```

要定义属性的对象。

```
prop
```

要定义或修改的属性的名称或 `Symbol` 。

```
descriptor
```

要定义或修改的属性描述符。

#### descriptor参数详解

- `configurable`

  当且仅当该属性的 `configurable` 键值为 `true` 时，该属性的描述符才能够被改变，同时该属性也能从对应的对象上被删除。 **默认为** **`false`**。

- `enumerable`

  当且仅当该属性的 `enumerable` 键值为 `true` 时，该属性才会出现在对象的枚举属性中。 **默认为 `false`**。

- `value`

  该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。**默认为 `false`。**

- `writable`

  当且仅当该属性的 `writable` 键值为 `true` 时，属性的值，也就是上面的 `value`，才能被`赋值运算符`改变。**默认为 `false`。**

- `get`

  属性的 getter 函数，如果没有 getter，则为 `undefined`。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 `this` 对象（由于继承关系，这里的`this`并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。**默认为 `undefined`**。

- `set`

  属性的 setter 函数，如果没有 setter，则为 `undefined`。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 `this` 对象。**默认为 `undefined`**。

## getter和setter

ES5的`Object.defineProperty`提供监听属性变更的功能，下面将演示如何通过`covert`函数修改传入对象的`getter`和`setter`实现修改对象属性时打印日志的功能。

```javascript
const obj = { foo: 123 }
convert(obj) 
obj.foo // 需要打印: 'getting key "foo": 123'
obj.foo = 234 // 需要打印: 'setting key "foo" to 234'
obj.foo // 需要打印: 'getting key "foo": 234'
```

covert函数实现如下：

```javascript
function convert (obj) {
  // Object.keys获取对象的所有key值，通过forEach对每个属性进行修改
  Object.keys(obj).forEach(key => {
    // 保存属性初始值
    let internalValue = obj[key]
    Object.defineProperty(obj, key, {
      get () {
        console.log(`getting key "${key}": ${internalValue}`)
        return internalValue
      },
      set (newValue) {
        console.log(`setting key "${key}" to: ${newValue}`)
        internalValue = newValue
      }
    })
  })
}
```

## 依赖跟踪（订阅发布模式）

需要实现一个依赖跟踪类`Dep`，类里有一个叫`depend`方法，该方法用于收集依赖项；另外还有一个`notify`方法，该方法用于触发依赖项的执行，也就是说只要在之前使用`dep`方法收集的依赖项，当调用`notfiy`方法时会被触发执行。

下面是`Dep`类期望达到的效果，调用`dep.depend`方法收集收集依赖，当调用`dep.notify`方法，控制台会再次输出`updated`语句

```javascript
const dep = new Dep()

autorun(() => {
  dep.depend()
  console.log('updated')
})
// 打印: "updated"

dep.notify()
// 打印: "updated"
```

`autorun`函数是接收一个函数，这个函数帮助我们创建一个响应区，当代码放在这个响应区内，就可以通过dep.depend方法注册依赖项

最终实现的Dep类代码如下：

```javascript
window.Dep = class Dep {
  constructor () {
    // 订阅任务队列，方式有相同的任务，用Set数据结构简单处理
    this.subscribers = new Set()
  }
	// 用于注册依赖项
  depend () {
    if (activeUpdate) {
      this.subscribers.add(activeUpdate)
    }
  }
	// 用于发布消息，触发依赖项重新执行
  notify () {
    this.subscribers.forEach(sub => sub())
  }
}

let activeUpdate = null

function autorun (update) {
  //把wrappedUpdate赋值给activeUpdate，这会使得当依赖关系发生改变update函数会重新执行
  //实际上是调用wrappedUpdate，如果以后有改动，这个依赖跟踪器依然会不断的收集依赖项
  //因为update函数有可能包含条件，如果一个变量是true就收集这个依赖，如果是false就收集另外的依赖
  //所以，依赖收集系统需要动态更新这些依赖，保证依赖项一直是最新的
  const wrappedUpdate = () => {
    activeUpdate = wrappedUpdate
    update()
    activeUpdate = null
  }
  wrappedUpdate()
}
```

## 实现迷你观察者

我们将上面的两个练习整合到一起，实现一个小型的观察者，通过在getter和setter中调用`depend`方法和`notfiy`方法，就可以实现自动更新数据的目的了，这也是Vue实现自动更新的核心原理。

期望实现的调用效果：

```javascript
const state = {
  count: 0
}
//监听state
observe(state)
//依赖注入
autorun(() => {
  console.log(state.count)
})
// 打印"count is: 0"
//每次重新赋值的时候执行notfiy函数 重走一遍所有的依赖函数
state.count++
// 打印"count is: 1"
```

最终整合代码如下：

```javascript
class Dep {
  constructor () {
    this.subscribers = new Set()
  }

  depend () {
    if (activeUpdate) {
      this.subscribers.add(activeUpdate)
    }
  }

  notify () {
    this.subscribers.forEach(sub => sub())
  }
}

function observe (obj) {
  Object.keys(obj).forEach(key => {
    let internalValue = obj[key]

    const dep = new Dep()
    Object.defineProperty(obj, key, {
      // 在getter收集依赖项，当触发notify时重新运行
      get () {
        dep.depend()
        return internalValue
      },

      // setter用于调用notify
      set (newVal) {
        const changed = internalValue !== newVal
        internalValue = newVal
        if (changed) {
          dep.notify()
        }
      }
    })
  })
  return obj
}

let activeUpdate = null

function autorun (update) {
  const wrappedUpdate = () => {
    activeUpdate = wrappedUpdate
    update()
    activeUpdate = null
  }
  wrappedUpdate()
}
```


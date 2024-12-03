---
title: 一个脚本解决vue3不能动态删除keepAlive缓存的问题（生产环境可用）！
tags:
  - vue
createTime: 2023/10/10
permalink: /article/yuuhekwk/
---
vue3中的内置组件`keep-alive`提供的参数有三个：

```typescript
interface KeepAliveProps {
  /**
   * 如果指定，则只有与 `include` 名称
   * 匹配的组件才会被缓存。
   */
  include?: MatchPattern
  /**
   * 任何名称与 `exclude`
   * 匹配的组件都不会被缓存。
   */
  exclude?: MatchPattern
  /**
   * 最多可以缓存多少组件实例。
   */
  max?: number | string
}

type MatchPattern = string | RegExp | (string | RegExp)[]
```

但是组件并没有提供给我们主动删除缓存的方法，就比如说我有一个多页签的管理后台，当我设置最多缓存十个页面，然后我开了十个页面，再关掉这十个页面，其实`keep-alive`组件依旧保留着这些缓存，如果我在打开这十个页面中的一个，其实还是走的缓存，并没有重新渲染这个组件；再比如说我们想要刷新某个页面，如果没有主动删除缓存的方法那就只能往缓存中加新的缓存，这样有可能你一个页面刷新十次，缓存都占满了。



显然上面这些情况都是我们不想看到的，本身去使用`keep-alive`组件就是想要性能好一点，所以我们这次就来解决一下这个问题。



首先要说明的是，我用的vue版本是3.3.4，vue2的处理方式我并没有去实践，我看网上是有相关文章的，但是vue3的解决方案我并没有找到。



解决这个问题之前，我们当然要浅看一波源码，毕竟要找到这个缓存对象在哪，我们才好制定下一步计划：

```typescript
// https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts
...
const KeepAliveImpl: ComponentOptions = {
  ...
  setup(props: KeepAliveProps, { slots }: SetupContext) {
    const instance = getCurrentInstance()!;
		...
    const cache: Cache = new Map(); // keepalive的缓存就是这里定义的
    const keys: Keys = new Set();
    let current: VNode | null = null;
    // 注意这里！！
    // 在开发模式中，keepalive的缓存被挂到了组件实例上面，也就是说我们可以直接在本地启项目访问到这个缓存
    if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
      (instance as any).__v_cache = cache;
    }
    ...
  }
    ...
}
```



看到上面我精简的代码段中的注释，接下来我们在本地看看是否能访问到这个`__v_cache`：

```vue
 <router-view v-slot="{ Component }">
  <keep-alive ref="keepAlive" :max="5">
    <component :is="Component" :key="$route.fullPath" />
  </keep-alive>
</router-view>
```



我们通过ref访问到组件实例`keepAlive`打印出来可以找到`keepAlive._.__v_cache`，可以看到的是cache是一个以`$route.fullPath`作为key的Map对象，那么我们就可以用`get、delete`来动态删除缓存了：

```typescript
const clearCache = (fullPath) => {
	if (keepAlive && keepAlive._) {
    const vCache = keepAlive._.__v_cache;
    if (vCache.get(fullPath)) vCache.delete(fullPath)
  }
}
```



好了，到这里我们就实现了在开发模式下的动态删除`keep-alive`缓存的功能，但是前面我也说了这个只适用于开发模式，那么打包后由于环境变量的改变导致下面这行代码不会被写入打包文件：

```typescript
    if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
      (instance as any).__v_cache = cache;
    }
```



那么，我们现在要做的就是把`(instance as any).__v_cache = cache;`强行塞到打包后的文件中，我在思考这个解决方案的时候有几个思路：

1. 重写`keep-alive`组件
2. 修改vue源码重新打包发布，然后把项目中的vue换成自己发布的vue
3. 修改打包文件



我是先尝试的前两种方式的，可以说道阻且长，被折磨的不轻，在这过程中我也顿悟了，这个问题的本质就是一行代码的事，我何必大费周章地用前两种方式呢，索性就改一下打包后的文件不就行了！

于是我又查看了打包后的文件，找到了下面的代码段：

```js
An={name:"KeepAlive",__isKeepAlive:!0,props:{include:[String,RegExp,Array],exclude:[String,RegExp,Array],max:[String,Number]},setup(e,{slots:t}){const n=Eo(),r=n.ctx;if(!r.renderer)return()=>{const e=t.default&&t.default();return e&&1===e.length?e[0]:e};const o=new Map,a=new Set;n.__v_cache=o;n.__v_cache=o;let l=null;n.__v_cache=o;const i=n.suspense,{renderer:{p:c,m:u,um:s,o:{createElement:d}}}=r,f=d("div");
```

提取上面关键代码：

```js
// 对应源码中的 const instance = getCurrentInstance()!;
const n=Eo(),r=n.ctx;
// 对应源码中的 const cache: Cache = new Map();const keys: Keys = new Set();
const o=new Map,a=new Set;
```



现在的思路就是在打包后，用正则的方式找到对应代码位置，把`(instance as any).__v_cache = cache;`转换成打包环境下的代码，插入到合适的位置，再重新覆盖文件就行了。

```js
const fs = require('fs');
const path = require('path');

// 查找以 index- 开头的文件
const files = fs.readdirSync('./dist/js')
  .filter(file => file.startsWith('index-'))
  .map(file => path.join('./dist/js', file));

files.forEach(file => {
  // 读取文件内容
  let content = fs.readFileSync(file, { encoding: 'utf8' });

  let addStr = ''
  let startIndex = 0
  // 使用正则表达式查找代码插入位置
  try {
    const pattern1 = /,\s*[a-zA-Z]=[a-zA-Z]\.ctx;/g;
    const pattern2 = /const\s+[a-zA-Z]\s*=\s*new\s+Map\s*,\s*[a-zA-Z]\s*=\s*new\s+Set;/g;
    const match1 = pattern1.exec(content);
    const match2 = pattern2.exec(content);
    addStr = `${match1[0].split('=')[1].split('.')[0]}.__v_cache=${match2[0].split('=')[0].split(' ')[1]};`;
    startIndex = match2.index + match2[0].length;
  } catch (e) {
    console.log('文件正则匹配失败', e);
  }
  if (addStr) {
    console.log('即将写入的代码:', addStr);
    // 将代码插入到指定位置
    content = content.slice(0, startIndex) + addStr + content.slice(startIndex);
    // 将修改后的内容写回到文件
    fs.writeFileSync(file, content, { encoding: 'utf8' });
    console.log('file ', file, ' 写入成功');
  }
});
```



测试一下，写入成功！最后把这个脚本加到打包后运行：

```json
{
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "vite build && node ./src/utils/vueExpand.js",
    "serve": "vite preview"
  }
}
```



大功告成！
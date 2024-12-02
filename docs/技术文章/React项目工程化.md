---
title: React项目工程化
tags:
  - 前端工程化
  - react
createTime: 2021/10/11
permalink: /article/6f9ud1eb/
---
# React项目工程化



## 说在前面



关于何为前端工程化的问题，之前掘金作者`CookieBoty`热门的一篇[文章](https://juejin.cn/post/6982215543017193502)已经有了详细的概述。我在这里不过多赘述，简单来说就是我们现在要打造一个多人开发，长期维护的项目，如何保证在建项之初就能把开发规范性、可维护性、部署优化等等这些问题一一解决呢？



我之前也看过很多工程化、模块化、组件化的文章，但是都是理论很多，但实际到代码上都是断断续续的，没有一个能够直接使用的Demo，所以这就是这篇文章的目的。借助于我现在公司的项目，我花了半个多月时间一点点把其中的的工程化逻辑一点点捋了出来，并且全都记录了下来。如果你是个像我一样是个资历尚浅的前端，那么看完这篇文章，可以让你对工程化的有个全面的印象，如果你是前端大佬，那么，请多指教！



本篇文章将从一个`package.json`文件开始一步步实现一个react项目的**工程化、模块化、组件化**以及功能上的**国际化、ESLint校验、模版构建**等。当然功能上的国际化、ESLint校验等不是每个项目必须的，你也可以按照你的实际情况判断是否需要添加这些额外功能。



在本篇文章中，你将会逐步感受到一个前端工程的工程化需要考虑到的问题，不光是在开发合作上的代码规范，整个项目的开发环境和生产环境的优化也是很重要的一步。我在叙述的过程中主要解析的是代码的作用，而不会过多述说为什么要这样写，但我相信各位在我解析的过程中也能**有更多自己对前端工程化的理解，最后能用你自己的语言说出你对工程化的理解**。



就像标题说的工程化，这篇文章编写也花了很多时间，所以也会很长，你要忍一下（手动狗头）。如果你能够看完这篇文章，还想对前端自动化部署相关的知识做些了解，我的主页也有些自动化部署的文章可供参考。



如果你不想你一步一步按照我说的操作，这里有项目的[源码](https://github.com/jyqwq/rainbow-react-project)可以直接对照着看。



那么话不多说，我们开始！



## 生成package.json

新建个项目文件夹，然后生成package.json。

```shell
$ cd /rainbow
$ npm init
```

 生成package.json如下：

```json
{
  "name": "rainbow",
  "version": "1.0.0",
  "description": "",
  "directories": {
    "test": "test"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT"
}
```



## 引入webpack



既然是个工程，第一步的脚手架是必须的，下面我们一步一步构建一个完全由我们自定义的`webpack`脚手架。



### 安装webpack



```shell
$ npm install webpack webpack-cli -D
```



### 安装webpack插件

[html-webpack-plugin](https://webpack.docschina.org/plugins/html-webpack-plugin/)插件：

该插件将为你生成一个 HTML5 文件， 在 body 中使用 `script` 标签引入你所有 webpack 生成的 bundle。

```shell
$ npm install html-webpack-plugin -D
```



loader插件：

webpack允许我们使用loader来处理文件，loader是一个导出为function的node模块。可以将匹配到的文件进行一次转换，同时loader可以链式传递。

```shell
$ npm install babel-loader style-loader css-loader svg-url-loader url-loader html-loader image-webpack-loader less-loader -D
```



[circular-dependency-plugin](http://febeacon.com/webpack-plugins-docs-cn/routes/circular-dependency-plugin.html)插件：

在 webpack 打包时，检测循环依赖的模块。

```shell
$ npm install circular-dependency-plugin -D 
```



兼容性插件：

`react-app-polyfill`包括各种浏览器的兼容。它包括[Create React App](https://github.com/facebook/create-react-app)项目使用的最低要求和常用语言特性。

```shell
$ npm install react-app-polyfill -D 
```



热更新插件：

```shell
$ npm install webpack-dev-middleware webpack-hot-middleware -D
```

**为什么有了`webpack-dev-server`，还有`webpack-dev-middleware`搭配`webpack-hot-middleware`的方式呢？**

因为`webpack-dev-server`是封装好的，除了`webpack.config`和命令行参数之外，很难去做定制型开发。而 `webpack-dev-middleware`是中间件，可以编写自己的后端服务然后使用它，开发更灵活。



离线插件（PWA）：

```shell
$ npm install offline-plugin -D
```

**离线插件模块做什么？**

首先`offline-plugin`应用的是PWA技术，会帮我们自动生成`service-worker.js`，sw的资源列表会记录我们项目资源文件。每次更新代码，通过更新sw文件版本号来通知客户端对所缓存的资源进行更新，否则就使用缓存文件。



[TerserWebpackPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/)插件：

该插件使用 [terser](https://github.com/terser-js/terser) 来压缩 JavaScript。

如果你使用的是 webpack v5 或以上版本，你不需要安装这个插件。webpack v5 自带最新的 `terser-webpack-plugin`。如果使用 webpack v4，则必须安装 `terser-webpack-plugin` v4 的版本。

```shell
$ npm install terser-webpack-plugin -D
```



[CompressionWebpackPlugin](https://webpack.docschina.org/plugins/compression-webpack-plugin/)插件：

对文件进行Gzip压缩，提升网络传输速率，优化web页面加载时间。

```shell
$ npm install compression-webpack-plugin -D
```



### 编写配置文件

在根目录下创建/app

```shell
$ cd /app
$ touch app.js
$ touch index.html
```



index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
    <title>纸上的彩虹</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```



在根目录下创建/internals/webpack

```shell
$ cd /internals/webpack
$ touch webpack.base.babel.js
$ touch webpack.dev.babel.js
$ touch webpack.prod.babel.js
```



webpack.base.babel.js

```js
const path = require('path');
const webpack = require('webpack');

module.exports = options => ({
  mode: options.mode,
  entry: options.entry,
  output: Object.assign(
    {
      // 打包到dist文件
      path: path.resolve(process.cwd(), 'dist'),
      publicPath:  '/',
    },
    options.output,
  ),
  optimization: options.optimization,
  module: {
    rules: [
      {
        test: /\.jsx?$/, // 使用Babel转换所需的所有.js和.jsx文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: options.babelQuery,
        },
      },
      {
        // 预处理.css文件
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // 预处理node_modules中的第三方.css文件
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // 预处理node_modules中的第三方.less文件
        test: /\.less$/,
        include: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              // 这里需要在less的配置规则里打开javascriptEnabled
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              // 小于10 kB的内联文件
              limit: 10 * 1024,
              noquotes: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // 小于10 kB的内联文件
              limit: 10 * 1024,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
    ],
  },
  plugins: options.plugins.concat([
    // 始终将NODE_ENV公开给webpack，
    // 以便在代码中使用“process.ENV.NODE_ENV”进行任何环境检查；
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
  ]),
  resolve: {
    // 配置 Webpack 去哪些目录下寻找第三方模块，默认是只会去  node_modules 目录下寻找
    modules: ['node_modules', 'app'], 
    // 在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在。 
    extensions: ['.js', '.jsx', '.react.js'],
    // 有一些第三方模块会针对不同环境提供几分代码。优先采用顺序：浏览器、ES6、ES5
    mainFields: ['browser', 'jsnext:main', 'main'],
  },
  devtool: options.devtool,
  target: 'web', // 使webpack可访问web变量，例如 window
  performance: options.performance || {},
});
```



webpack.dev.babel.js

```js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = require('./webpack.base.babel')({
  mode: 'development',

  // 在开发环境中添加热重新加载
  entry: [
    // 让ie11兼容react app
    require.resolve('react-app-polyfill/ie11'), 
    // 必须这么写，这将连接到服务器，以便在包重新构建时接收通知，然后相应地更新客户端
    'webpack-hot-middleware/client?reload=true', 
    path.join(process.cwd(), 'app/app.js'), // 入口文件 app/app.js
  ],

  // 不要在开发模式下使用哈希来获得更好的性能
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  optimization: {
    // SplitChunks插件是Webpack中一个提取或分离代码的插件，
    // 主要作用是提取公共代码，防止代码被重复打包，拆分过大的js文件，合并零散的js文件。
    splitChunks: {
      chunks: 'all', // 不管异步加载还是同步加载的模块都提取出来，打包到一个文件中。
    },
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 告诉webpack我们需要热重新加载
    new HtmlWebpackPlugin({
      inject: true, // 注入webpack生成的所有文件，例如bundle.js
      template: 'app/index.html',
    }),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // 排除检测符合正则的文件
      failOnError: false, // 向 webpack 输出错误而不是警告
    }),
  ],

  // 将会生成source-map 供浏览器调试中source展示
  devtool: 'eval-source-map',

  performance: {
    hints: false, // 关闭提示用户包的体积过大
  },
});
```



webpack.prod.babel.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const { HashedModuleIdsPlugin } = require('webpack').ids;
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = require('./webpack.base.babel')({
  mode: 'production',

  // 在生产环境中，跳过所有的热重新加载的东西
  entry: [
    require.resolve('react-app-polyfill/ie11'), // 让ie11兼容react app
    path.join(process.cwd(), 'app/app.js'), // 入口文件 app/app.js
  ],

  // 通过向已编译资产添加内容哈希（而不是编译哈希）来利用长期缓存
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
  },

  optimization: {
    // 告知 webpack 使用 TerserPlugin 或其它在 optimization.minimizer 定义的插件压缩 bundle。
    minimize: true, 
    // 允许你通过提供一个或多个定制过的 TerserPlugin 实例， 覆盖默认压缩工具(minimizer)。
    minimizer: [
      new TerserPlugin({
        // Terser 压缩配置 。
        terserOptions: {
          format: {
            comments: false, // 选项指定是否保留注释。
          },
          warnings: false,
          compress: {
            // 对二进制节点应用某些优化, 比如 !(a <= b) → a > b
            comparisons: false,
            // 打包时自动去除console.log
            pure_funcs: ["console.log"]
          },
          parse: {},
          mangle: true,
          output: {
            comments: false,
            ascii_only: true,
          },
        },
        // 使用多进程并发运行以提高构建速度。并发运行可以显著提高构建速度，因此强烈建议添加此配置 。
        parallel: true, 
        cache: true, // 启用文件缓存。
        sourceMap: true,
        extractComments: false, // 禁用剥离注释功能。
      }),
    ],
    // 告知 webpack 将 process.env.NODE_ENV 设置为一个给定字符串。
    nodeEnv: 'production',
    // 告知 webpack 去辨识 package.json 中的 副作用 标记或规则，
    // 以跳过那些当导出不被使用且被标记不包含副作用的模块。
    sideEffects: true,
    // 告知 webpack 去寻找模块图形中的片段，哪些是可以安全地被合并到单一模块中。
    concatenateModules: true,
    // 值 "single" 会创建一个在所有生成 chunk 之间共享的运行时文件。
    runtimeChunk: 'single',
    // SplitChunks插件是Webpack中一个提取或分离代码的插件，
    // 主要作用是提取公共代码，防止代码被重复打包，拆分过大的js文件，合并零散的js文件。
    splitChunks: {
      chunks: 'all', // 不管异步加载还是同步加载的模块都提取出来，打包到一个文件中。
      maxInitialRequests: 10, // 按需加载时的最大并行请求数。
      minSize: 0, // 生成 chunk 的最小体积（以 bytes 为单位）。
      // 缓存组可以继承和/或覆盖来自 splitChunks.* 的任何选项。
      // 但是 test、priority 和 reuseExistingChunk 只能在缓存组级别上进行配置。
      cacheGroups: {
        vendor: {
          // 控制此缓存组选择的模块。省略它会选择所有模块。
          // 它可以匹配绝对模块资源路径或 chunk 名称。
          // 匹配 chunk 名称时，将选择 chunk 中的所有模块。
          test: /[\\/]node_modules[\\/]/,
          // 拆分 chunk 的名称。
					// 提供字符串或函数使你可以使用自定义名称。
          // 指定字符串或始终返回相同字符串的函数会将所有常见模块和 vendor 合并为一个 chunk。
          // 这可能会导致更大的初始下载量并减慢页面加载速度。
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            )[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },

  plugins: [
    // 压缩并优化index.html
    new HtmlWebpackPlugin({
      // webpack到模板的相对或绝对路径。
      template: 'app/index.html',
      // 控制是否以及以何种方式压缩。
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      // 根据scriptLoading选项将资源添加到head/body。
      inject: true,
    }),


    new OfflinePlugin({
      relativePaths: false,
      publicPath: '/',
      appShell: '/',
      caches: {
        main: [':rest:'],
        // 所有标记为“additional”的块，在main文件之后加载，不阻止SW安装。
        additional: ['*.chunk.js'],
      },

      // 删除关于“additional”用法的警告
      safeToUseOptionalCaches: true,
    }),

    new CompressionPlugin({
      algorithm: 'gzip', // 压缩算法/函数
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240, // 仅处理大于此大小的资源（字节）
      minRatio: 0.8, // 只处理压缩比此比率更好的资源
    }),

    new HashedModuleIdsPlugin({
      hashFunction: 'sha256', // 生成哈希时要使用的方法
      hashDigest: 'hex', // 生成哈希时要使用的编码
      hashDigestLength: 20, // 要使用的哈希摘要的前缀长度
    }),
  ],

  performance: {
    // 筛选出自己需要检测体积的包类型
    assetFilter: assetFilename =>
      !/(\.map$)|(^(main\.|favicon\.))/.test(assetFilename),
  },
});
```



## 引入React



React全家桶：

```shell
$ npm install react react-dom react-redux react-router-dom redux
```



react-helmet：

React Helmet是一个HTML文档head管理工具，管理对文档头的所有更改。

我们每个页面可能都有自己的title，为了方便修改我们引入这个插件。

```shell
$ npm install react-helmet
```



react-intl:

React项目国际化。注意react-intl新版本里没有react-intl/locale-data文件的，就是本地语言文件。

```shell
$ npm install react-intl@2.9.0 intl
```



redux-saga:

`redux-saga` 是一个用于管理应用程序 Side Effect（副作用，例如异步获取数据，访问浏览器缓存等）的 library，它的目标是让副作用管理更容易，执行更高效，测试更简单，在处理故障时更容易。

我们的项目将使用saga来模块化处理异步业务。

```shell
$ npm install redux-saga
```



connected-react-router：

这是一个绑定react-router到redux的组件，来实现双向绑定router的数据到redux store中，这么做的好处就是让应用更Redux化，可以在action中实现对路由的操作。

```shell
$ npm install connected-react-router
```



history：

在react-router中组件里面的跳转可以用`<Link>`

但是在组件外面该如何跳转，需要用到react路由的history。

```shell
$ npm install history
```



prop-types：

可以使用属性类型来记录传递给组件的属性的预期类型。运行时对props进行类型检查。

 ```shell
 $ npm install prop-types
 ```



resclect：

Reselect 是一个 Redux 的选择器库，灵感来源于 [NuclearJS](https://www.oschina.net/p/nuclear) 。

- Selector 可以计算衍生的数据，可以让 Redux 存储尽可能少的 state 。
- Selector 非常高效，除非某个参数发生变化，否则不会发生计算过程。
- Selector 是可组合的，它们可以输入、传递到其他的选择器。

```shell
$ npm install resclect
```



immer：

immer 是一个用 C ++ 编写的可持久化和不可更改的数据结构库。

- 可持久化意味着修改数据结构时，将保留旧值。
- 不可更改意味着所有的操作方法都是 const。

对象不会在适当位置修改，但会返回新值。 因为旧值仍然存在并且永远不会改变，所以新值可以透明地保持对它的公共部分的引用。 这个属性被称为结构共享。

```shell
$ npm install immer
```



## antd和动态主题



antd：

```shell
$ npm install antd
```



antd-theme-webpack-plugin：

定制化antd主题色

```shell
$ npm install antd-theme-webpack-plugin
```

这里我们需要在之前的`webpack.base.babel.js`里面加点东西

```js
const AntDesignThemePlugin = require('antd-theme-webpack-plugin');

module.exports = options => ({
    plugins: options.plugins.concat([
    // antd 主题配置
    new AntDesignThemePlugin({
      antDir: path.join(__dirname, '../../node_modules/antd'),
      stylesDir: path.join(__dirname, '../../app/static/theme'),
      varFile: path.join(__dirname, '../../app/static/theme/variables.less'),
      indexFileName: 'index.html',
      mainLessFile: path.join(__dirname, '../../app/static/theme/index.less'),
      themeVariables: ['@primary-color', '@btn-primary-bg', '@link-color'],
      lessUrl: 'https://cdn.bootcdn.net/ajax/libs/less.js/2.7.2/less.min.js',
      publicPath: '',
    }),
  ]),
})
```

上面的配置涉及到两个我们本地主题文件，路径已经表明：

variables.less

```less
@import "~antd/lib/style/themes/default.less";

@primary-color: #1890ff; // 全局主色
@link-color: #1890ff; // 链接色
@btn-primary-bg: #1890ff; // 按钮色
@success-color: #52c41a; // 成功色
@warning-color: #faad14; // 警告色
@error-color: #f5222d; // 错误色
@font-size-base: 14px; // 主字号
@heading-color: rgba(0, 0, 0, 0.85); // 标题色
@text-color: rgba(0, 0, 0, 0.65); // 主文本色
@text-color-secondary : rgba(0, 0, 0, .45); // 次文本色
@disabled-color : rgba(0, 0, 0, .25); // 失效色
@border-radius-base: 4px; // 组件/浮层圆角
@border-color-base: #d9d9d9; // 边框色
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15); // 浮层阴影
```

index.less

```less
@import './variables.less';
// 这里可以定义自己的样式

// 背景色
.primary-bgColor{
  background-color:@primary-color;
}

// 字体色
.primary-fontColor{
  color:@primary-color;
}

// 左边框颜色
.primary-border-left-color{
  border-left-color: @primary-color;
}
```

这时候代码中动态修改主题主需要在项目中加入以下代码：

```js
window.less
  .modifyVars({ '@primary-color': '#66ffcc', '@link-color': '#66ffcc', '@btn-primary-bg': '#66ffcc' })
  .then(() => {
    console.log('主题变更成功');
  })
  .catch(error => {
    console.log(error);
  });
```



## 引入其他插件



sanitize.css：

一个css库，它提供了一致的、跨浏览器的HTML元素默认样式以及一些有用的默认样式。

```shell
$ npm install sanitize.css
```



styled-components：

`styled-components`是一个针对React的 css in js 类库。优点如下：

- 贯彻React的 everything in JS理念，降低js对css文件的依赖
- 组件的样式和其他组件完全解耦，有效避免了组件之间的样式污染

```shell
$ npm install styled-components
```



lodash：

Lodash 是一个一致性、模块化、高性能的 JavaScript 实用工具库。

```shell
$ npm install lodash
```



cross-env：

`cross-env`能够提供一个设置环境变量的scripts，让你能够以unix方式设置环境变量，然后在windows上也能兼容运行。

```shell
$ npm install cross-env
```



express：

我们这里用`express`作为我们的webServer。

```shell
$ npm install express
```



ngrok：

ngrok外网映射。

```shell
$ npm install ngrok
```



chalk：

`chalk` 是一个可以修改终端输出字符样式的 `npm` 包。我们需要让项目启动时输出一些有效信息。

```shell
$ npm install chalk
```



ip：

node.js的IP地址实用程序

```shell
$ npm install ip
```



minimist：

minimist是一个用于处理命令行调用node指令时，处理node之后的一系列参数的模块。

```shell
$ npm install minimist
```



compression：

Node.js压缩中间件。

```shell
$ npm install compression
```



rimraf：

`rimraf` 包的作用：以包的形式包装`rm -rf`命令，用来删除文件和文件夹的，不管文件夹是否为空，都可删除。

```shell
$ npm install rimraf -D
```



shelljs：

ShellJS是一个可移植的unix shell命令实现，位于Node.js API之上。用它来消除shell脚本对Unix的依赖性，同时保持其熟悉且强大的命令。

```shell
$ npm install shelljs -D
```



glob：

node的glob模块允许你使用 *等符号，来写一个glob规则，像在shell里一样，获取匹配对应规则的文件。

这个glob工具基于javascript。它使用了 `minimatch` 库来进行匹配。

```shell
$ npm install glob -D
```



invariant：

一种在开发中提供描述性错误，但在生产中提供一般性错误的方法。

```shell
$ npm install invariant
```



## ESLint配置



```shell
$ npm install eslint babel-eslint -D
```



eslint-config-airbnb：

这个包提供Airbnb的.eslintrc作为一个可扩展的共享配置。

```shell
$ npm install eslint-config-airbnb -D
```



eslint-plugin-prettier：

` eslint-plugin-prettier `插件会调用`prettier`对你的代码风格进行检查，其原理是先使用`prettier`对你的代码进行格式化，然后与格式化之前的代码进行对比，如果过出现了不一致，这个地方就会被`prettier`进行标记。

```shell
$ npm install prettier eslint-config-prettier eslint-plugin-prettier -D
```



eslint-plugin-react/eslint-plugin-react-hooks/eslint-plugin-jsx-a11y/eslint-plugin-redux-saga：

针对react、react-hooks、jsx、redux-saga的ESLint规则。

```shell
$ npm install eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-redux-saga -D
```



eslint-plugin-import：

此插件旨在支持ES2015+（ES6+）导入/导出语法的linting，并防止文件路径和导入名称拼写错误的问题。ES2015+静态模块语法打算提供的所有优点都在编辑器中标记出来。

```shell
$ npm install eslint-plugin-import -D
```



在根目录下新增四个文件：`.prettierrc`、`.prettierignore`和`.eslintrc.js`、`.eslintignore`

.prettierrc

prettier的一些配置

```json
{
  "printWidth": 100, // 超过最大值换行
  "tabWidth": 2, // 缩进字节数
  "useTabs": false, // 缩进不使用tab，使用空格
  "semi": true,  // 句末加分号
  "singleQuote": true,  // 用单引号
  "arrowParens": "avoid", // (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
  "bracketSpacing": true, // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
  "trailingComma": "all" // 在对象或数组最后一个元素后面是否加逗号
}
```

.prettierignore

prettier忽略文件

```.ignore
dist/
node_modules/
package-lock.json
yarn.lock
package.json
```

.eslintrc.js

```js
const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'));

module.exports = {
  // 检测ES6代码
  parser: 'babel-eslint',
  // 引入其他预设模块
  extends: ['airbnb', 'prettier'],
  // 引入规则插件
  plugins: ['prettier', 'redux-saga', 'react', 'react-hooks', 'jsx-a11y'],
  // 检测环境
  env: {
    browser: true, // 浏览器环境中的全局变量。
    node: true, // Node.js 全局变量和 Node.js 作用域。
    es6: true, // 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）。
  },
  // 指定支持的 JavaScript 语言选项
  parserOptions: {
    ecmaVersion: 6, //  ES6 语法
    sourceType: 'module', // 代码是 ECMAScript 模块
    ecmaFeatures: {
      jsx: true, // 启用jsx
    },
  },
  // 规则设置
  // 0或off：关闭规则
  // 1或warn：打开规则，并且作为一个警告（并不会导致检查不通过）
  // 2或error：打开规则，并且作为一个错误（退出码为1，检查不通过）
  // 数组：参数1：错误等级 参数2：处理方式
  rules: {
    'prettier/prettier': ['error', prettierOptions], // prettier规则
    'arrow-body-style': [2, 'as-needed'], // 要求箭头函数体使用大括号
    'class-methods-use-this': 0, // 强制类方法使用 this
    'import/order': 0, // 在模块导入顺序中执行约定
    'import/extensions': 0, // 确保在导入路径中一致使用文件扩展名
    'import/imports-first': 0, // 确保所有导入都出现在其他语句之前
    'import/named': 0, // 确保命名导入与远程文件中的命名导出相对应
    'import/newline-after-import': 0, // 在import语句后强制换行
    'import/no-dynamic-require': 0, // 禁止带表达式的require（）调用
    'import/no-duplicates': 0, // 报告同一模块在多个位置重复导入
    'import/no-cycle': 0, // 报告同一模块在多个位置重复导入
    'import/no-extraneous-dependencies': 0, // 禁止使用外来packages
    'import/no-named-as-default': 0, // 报告使用导出名称作为默认导出的标识符
    'import/no-named-as-default-member': 0, // 将导出名称的使用报告为默认导出的属性
    'import/no-unresolved': 0, // 确保导入指向可以解析的文件/模块
    'import/no-useless-path-segments': 0, // 在import和require语句中防止不必要的路径段
    'import/no-webpack-loader-syntax': 0, // 禁止导入中的webpack loader程序语法
    'import/no-self-import': 0, // 禁止模块将具有依赖路径的模块导入回其自身
    'import/prefer-default-export': 0, // 如果模块导出单个名称，则首选默认导出
    indent: [2, 2, { SwitchCase: 1 }], // 强制使用一致的缩进
    'jsx-a11y/aria-props': 2, // Enforce all aria-* props are valid.
    'jsx-a11y/heading-has-content': 0, // 强制标题（h1、h2等）元素包含可访问的内容。
    'jsx-a11y/label-has-associated-control': [2, { controlComponents: ['Input'] }], // 强制label标签具有文本标签和关联控件。
    'jsx-a11y/label-has-for': 0, // label需要htmlFor
    'jsx-a11y/mouse-events-have-key-events': 2, // 强制onMouseOver/onMouseOut与onFocus/onBlur一起用于仅键盘用户。
    'jsx-a11y/role-has-required-aria-props': 2, // 强制具有ARIA角色的元素必须具有该角色所需的所有属性。
    'jsx-a11y/role-supports-aria-props': 2, // 强制定义了显式或隐式角色的元素只包含该角色支持的aria-*属性。
    'max-len': 0, // 强制一行的最大长度
    'newline-per-chained-call': 0, // 要求方法链中每个调用都有一个换行符
    'no-confusing-arrow': 0, // 禁止在可能与比较操作符相混淆的地方使用箭头函数
    'no-console': 1, // 禁用 console
    'no-debugger': 1, // 禁用 debugger
    'no-unused-vars': 2, // 禁止出现未使用过的变量
    'no-use-before-define': 0, // 禁止在变量定义之前使用它们
    'prefer-template': 2, // 要求使用模板字面量而非字符串连接
    'react/destructuring-assignment': 0, // 组件中强制要求解构赋值
    'react-hooks/rules-of-hooks': 'error', // 强制执行hooks的规则
    'react/jsx-closing-tag-location': 0, // 验证闭标签的位置
    'react/forbid-prop-types': 0, // 禁止特定的propType
    'react/jsx-first-prop-new-line': [2, 'multiline'], // 限制首个属性的位置
    'react/jsx-filename-extension': 0, // 限制文件扩展名
    'react/jsx-no-target-blank': 0, // 避免使用不安全的target=_blank属性
    'react/jsx-props-no-spreading': 0, // 避免jsx使用解构赋值
    'react/jsx-uses-vars': 2, // 防止使用中的变量错误的标记为未使用
    'react/prop-types': 0, // 防止在react组件定义中缺少props验证
    'react/require-default-props': 0, // 为不是必需属性的每个属性强制默认属性定义
    'react/self-closing-comp': 0, // 防止没有孩子的组件有额外的闭标签
    'react/sort-comp': 0, // 强制组件方法顺序
    'redux-saga/no-yield-in-race': 2, // Prevent usage of yield in race entries
    'redux-saga/yield-effects': 2, // Ensure effects are yielded
    'require-yield': 0, // 	要求 generator 函数内有 yield
  },
  // ESLint 支持在配置文件添加共享设置。
  // 你可以添加 settings 对象到配置文件，它将提供给每一个将被执行的规则。
  // 如果你想添加的自定义规则而且使它们可以访问到相同的信息，这将会很有用，并且很容易配置。
  settings: {
    'import/resolver': {
      webpack: {
        config: './internals/webpack/webpack.prod.babel.js',
      },
    },
  },
};
```

.eslintignore

```.ignore
dist/
node_modules/
package-lock.json
yarn.lock
package.json
```



我们可以用eslint提供的Node.js API来结合`chalk`让输出更加美化一点，所以创建文件`/internals/scripts/eslint.js`，写一些自定义输出。

```js
/* eslint-disable no-console */
const { ESLint } = require('eslint');
const chalk = require('chalk');

const eslint = new ESLint({
  fix: true, // 自动修改
  useEslintrc: true, // 使用项目的eslint配置
  ignorePath: '.eslintignore', // eslint忽略文件
});

// 此方法的主要代码来自于ESLint官方文档：https://eslint.org/docs/developer-guide/nodejs-api
const startEslint = async () => {
  try {
    console.log('开始校验代码');

    const results = await eslint.lintFiles(['.']);

    await ESLint.outputFixes(results);

    const formatter = await eslint.loadFormatter('stylish');

    const resultText = formatter.format(results);

    if (resultText) {
      console.error(`代码校验未通过：
      ${chalk.red(resultText)}
      `);
    } else {
      console.log(`代码校验通过 ${chalk.green('✓')}`);
    }
  } catch (error) {
    process.exitCode = 1;
    console.error(`代码校验错误：
      ${chalk.red(error)}
      `);
  }
};

startEslint().then(() => console.log('校验结束'));
```



## stylelint配置



```shell
$ npm install stylelint -D
```



stylelint-config-recommended：

stylelint的推荐配置。

```shell
$ npm install stylelint-config-recommended -D
```



stylelint-processor-styled-components/stylelint-config-styled-components：

styled-components的配置规则。

```shell
$ npm install stylelint-processor-styled-components stylelint-config-styled-components -D
```



根目录下创建`.stylelintrc`

```json
{
  "processors": ["stylelint-processor-styled-components"],
  "extends": [
    "stylelint-config-recommended",
    "stylelint-config-styled-components"
  ]
}
```



## babel配置



```shell
$ npm install @babel/cli @babel/core @babel/preset-env @babel/preset-react @babel/register -D
$ npm install @babel/polyfill
```



babel-plugin-import：

babel的模块化导入插件，兼容antd、antd mobile、lodash、material ui等。

```shell
$ npm install babel-plugin-import babel-plugin-lodash -D
```



babel-plugin-formatjs/babel-plugin-react-intl：

国际化插件react-intl必要配置。

```shell
$ npm i babel-plugin-formatjs babel-plugin-react-intl -D
```



@babel/plugin-proposal-class-properties：

这个插件主要作用是用来编译类的。

```shell
$ npm install @babel/plugin-proposal-class-properties -D
```



@babel/plugin-syntax-dynamic-import：

用以解析识别import()动态导入语法---并非转换，而是解析识别

```shell
$ npm install @babel/plugin-syntax-dynamic-import -D
```



@babel/plugin-transform-modules-commonjs：

这个插件将ECMAScript模块转换为CommonJS。

```shell
$ npm install @babel/plugin-transform-modules-commonjs -D
```



@babel/plugin-transform-react-constant-elements：

这个插件可以通过将React元素提升到最大可能的范围来加速协调并减少垃圾收集压力，从而防止多次不必要的重新实例化。

```shell
$ npm install @babel/plugin-transform-react-constant-elements -D
```



@babel/plugin-transform-react-inline-elements：

转换react内联元素。

```shell
$ npm install @babel/plugin-transform-react-inline-elements -D
```



babel-plugin-transform-react-remove-prop-types：

从生产构建中删除React proptype，因为它们只在开发中使用。删除它们可以节省带宽。

```shell
$ npm install babel-plugin-transform-react-remove-prop-types -D
```



在根目录下创建[babel.config.js](https://babel.docschina.org/docs/en/config-files/#project-wide-configuration)

```js
module.exports = {
  // 处理此文件时要激活的预设数组。
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],
  // 处理此文件时要激活的插件数组。
  plugins: [
    'styled-components',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    // 按需引入antd模块
    ["import", { libraryName: "antd-mobile", style: "css" }]
  ],
  env: {
    production: {
      // 启用app目录中文件的Babel编译，同时禁用其他所有内容。
      only: ['app'],
      plugins: [
        'lodash',
        'transform-react-remove-prop-types',
        '@babel/plugin-transform-react-inline-elements',
        '@babel/plugin-transform-react-constant-elements',
      ],
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        'dynamic-import-node',
      ],
    },
  },
};
```



## 项目启动配置



在根目录下创建/server/middlewares

接着我们创建一些文件

```shell
$ cd /server
$ touch index.js
$ touch logger.js
$ touch argv.js
$ touch port.js
$ cd /middlewares
$ touch addDevMiddlewares.js
$ touch addPordMiddlewares.js
$ touch frontendMiddlewares.js
```



文件有点多，我们先看中间件：

frontendMiddlewares.js

```js
// 这个文件很简单 就是判断当前环境加载不同的webpack配置
// 这里的app就是express()
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    const addProdMiddlewares = require('./addProdMiddlewares')
    addProdMiddlewares(app, options)
  } else {
    const webpackConfig = require('../../internals/webpack/webpack.dev.babel')
    const addDevMiddlewares = require('./addDevMiddlewares')
    addDevMiddlewares(app, webpackConfig)
  }

  return app
}
```

addDevMiddlewares.js

```js
const path = require('path')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

function createWebpackMiddleware (compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    // 绑定中间件的公共路径,与webpack配置的路径相同
    publicPath,
    // 仅打印错误信息
    stats: 'errors-only'
  })
}

module.exports = function addDevMiddlewares (app, webpackConfig) {
  // 导入webpack配置
  const compiler = webpack(webpackConfig)
  // 创建webpack开发环境中间件
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath
  )

  // 应用开发环境中间件
  app.use(middleware)
  // 应用热加载中间件
  app.use(webpackHotMiddleware(compiler))

  // 因为webpackDevMiddleware在内部使用memory-fs来存储构建工件，所以我们也替代使用
  const fs = middleware.context.outputFileSystem

  // 使用express获取客户端get请求
  app.get('*', (req, res) => {
    // 设置访问静态文件的路径
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404)
      } else {
        res.send(file.toString())
      }
    })
  })
}
```

addPordMiddlewares.js

```js
const path = require('path')
const express = require('express')
const compression = require('compression')

module.exports = function addProdMiddlewares (app, options) {
  const publicPath = options.publicPath || '/'
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'dist')

  // compression中间件会压缩服务器响应，使它们更小。
  app.use(compression())
  // 设置访问静态文件的路径
  app.use(publicPath, express.static(outputPath))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(outputPath, 'index.html'))
  )
}
```



再看一下server下面的文件：

argv.js

```js
// 此文件处理运行命令行上的参数
// 把命令行中的参数解析成一个字典
module.exports = require('minimist')(process.argv.slice(2))
```

port.js

```js
// 此文件会导出一个端口数
const argv = require('./argv')
// argv.port命令行中指定的端口 process.env.PORT环境变量中设置的端口
module.exports = parseInt(argv.port || process.env.PORT || '3000', 10)
```

logger.js

```js
// 此文件处理项目启动时终端打印的信息，使打印的信息更加人性化
/* eslint-disable no-console */
// noinspection HttpUrlsUsage

const chalk = require('chalk')
const ip = require('ip')

const divider = chalk.gray('\n-----------------------------------')

const logger = {
    // 错误时的信息
    error: err => {
        try{
            let msg = ''
            if(Object.prototype.toString.call(err)==='[object String]'){
                msg = err
            } else {
                msg = err.msg? err.msg:JSON.stringify(err)
            }
            console.error(chalk.red(msg))
        }catch (e){
            console.error(chalk.red(err))
        }
    },

    // 运行成功时执行的函数
    appStarted: (port, host, tunnelStarted) => {
        console.log(`服务启动成功 ! ${chalk.green('✓')}`)

        // 启动成功打印可访问的url信息
        if (tunnelStarted) {
            console.log(`通道初始化完成 ${chalk.green('✓')}`)
        }
				/* eslint-disable indent */
        console.log(`
${chalk.bold('访问URL:')}${divider}
			本地地址: ${chalk.magenta(`http://${host}:${port}`)}
      局域网: ${chalk.magenta(`http://${ip.address()}:${port}`) +
        (tunnelStarted
            ? `\n    Proxy: ${chalk.magenta(tunnelStarted)}`
            : '')}${divider}
${chalk.blue(`输入 ${chalk.italic('CTRL-C')} 停止项目`)}
    `)
    }
}

module.exports = logger
```

index.js

```js
/* eslint consistent-return:0 import/order:0 */
const { resolve } = require('path');
const express = require('express')
const logger = require('./logger')
const argv = require('./argv')
const port = require('./port')
const setup = require('./middlewares/frontendMiddleware')
const isDev = process.env.NODE_ENV !== 'production'
// 判断是否开启外网映射
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false
const app = express()

// 在生产中，我们需要传递这些值，而不是依赖于webpack
setup(app,{
  outputPath: resolve(process.cwd(), 'dist'),
  publicPath: '/',
})

// 获取目标主机，如果没有指定默认为localhost
const customHost = argv.host || process.env.HOST
const host = customHost || null
const prettyHost = customHost || 'localhost'

// 使用gzip包
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip')
  next()
})

// 启动应用程序
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message)
  }

  // 在开发模式下连接到ngrok
  // 最后输出处理过的打印信息
  if (ngrok) {
    let url
    try {
      url = await ngrok.connect(port)
    } catch (e) {
      return logger.error(e)
    }
    logger.appStarted(port, prettyHost, url)
  } else {
    logger.appStarted(port, prettyHost)
  }
})
```



## 编写入口文件



编写入口文件前我们需要创建一些初始化项目的必要文件，它们各自负责自己的模块，确保在项目中的正常导入与使用。

下面是需要初始化的文件目录结构：

![image-20210722181035333](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-15.png)

文件有点多，我们按模块查看。

### Reducer

/app/utils/history.js

```js
// 生成浏览器历史记录实例
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();
export default history;
```

/app/reducers.js

```js
// 合并此文件中的所有Reducer并导出合并的Reducer。
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';

import history from 'utils/history';
import languageProviderReducer from 'containers/LanguageProvider/reducer';

// 将各个模块的Reducer合并
export default function createReducer(injectedReducers = {}) {
  return combineReducers({
    language: languageProviderReducer, // 语言信息
    router: connectRouter(history),
    ...injectedReducers,
  });
}
```

/app/configureStore.js

```js
/**
 * 使用动态Reducers创建store
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';

export default function configureStore(initialState = {}, history) {
  let composeEnhancers = compose;
  const reduxSagaMonitorOptions = {};

  // 如果安装了Redux DevTools扩展，就使用扩展，否则使用Redux compose
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});
  }

  // 创建一个Saga中间件
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);

  // 创建具有两个中间件的store
  // 1. sagaMiddleware: 使redux sagas发挥作用
  // 2. routerMiddleware: 将location/URL路径同步到state
  const middlewares = [sagaMiddleware, routerMiddleware(history)];
	// 应用中间件
  const enhancers = [applyMiddleware(...middlewares)];

  const store = createStore(
      createReducer(),
      initialState,
      composeEnhancers(...enhancers),
  );

  // 扩充功能
  store.runSaga = sagaMiddleware.run
  store.injectedReducers = {} // 合并当前容器的Reducer
  store.injectedSagas = {} // 当前容器的Saga

  // 使reducers可热重新加载
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}
```

### i18n国际化配置

/app/i18n.js

```js
// 这个文件为应用程序设置i18n语言文件和区域设置数据。
const { addLocaleData } = require('react-intl');
// 注意react-intl新版本里没有react-intl/locale-data文件的，版本不要搞错了
const enLocaleData = require('react-intl/locale-data/en')
const zhLocaleData = require('react-intl/locale-data/zh')

// 下面是App国际化的一些文本信息，初始化的时候是两个空json，我们需要手动创建一下
const enTranslationMessages = require('./translations/en.json')
const zhTranslationMessages = require('./translations/zh.json')

// 引入本地的 localedata 
addLocaleData(enLocaleData)
addLocaleData(zhLocaleData)
// 默认语言
const DEFAULT_LOCALE = 'zh'
// App支持语言列表
// prettier-ignore
const appLocales = [
  'en',
  'zh',
]

// 格式化App内的国际化文本信息
const formatTranslationMessages = (locale, messages) => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE
      ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
      : {}
  const flattenFormattedMessages = (formattedMessages, key) => {
    const formattedMessage =
      !messages[key] && locale !== DEFAULT_LOCALE
        ? defaultFormattedMessages[key]
        : messages[key]
    return Object.assign(formattedMessages, { [key]: formattedMessage })
  }
  return Object.keys(messages).reduce(flattenFormattedMessages, {})
}

const translationMessages = {
  en: formatTranslationMessages('en', enTranslationMessages),
  zh: formatTranslationMessages('zh', zhTranslationMessages)
}

exports.appLocales = appLocales
exports.formatTranslationMessages = formatTranslationMessages
exports.translationMessages = translationMessages
exports.DEFAULT_LOCALE = DEFAULT_LOCALE
```

### i18n国际化组件

组件的文件结构是react模块化编程的一种写法，详细的后面会说

/app/containers/LanguageProvider/constants.js

```js
// 组件常量文件
// 改变语言
export const CHANGE_LOCALE = 'app/LanguageToggle/CHANGE_LOCALE';
```

/app/containers/LanguageProvider/actions.js

```js
// 定义组件actions
import { CHANGE_LOCALE } from './constants';

// 改变语言action
export function changeLocale(languageLocale) {
  return {
    type: CHANGE_LOCALE,
    locale: languageLocale,
  };
}
```

/app/containers/LanguageProvider/reducer.js

```js
import produce from 'immer';

import { CHANGE_LOCALE } from './constants';
import { DEFAULT_LOCALE } from '../../i18n';

// 当前组件state
export const initialState = {
  locale: DEFAULT_LOCALE,
};

// 每一次触发action都会执行一次languageProviderReducer
// 如果存在对state的修改就会通过produce方法进行更新
/* eslint-disable default-case, no-param-reassign */
const languageProviderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CHANGE_LOCALE:
        draft.locale = action.locale;
        break;
    }
  });

export default languageProviderReducer;
```

/app/containers/LanguageProvider/selectors.js

```js
import { createSelector } from 'reselect';
import { initialState } from './reducer';

// 选择languageToggle state
const selectLanguage = state => state.language || initialState;

// 选择语言区域设置
const makeSelectLocale = () =>
  createSelector(
    selectLanguage,
    languageState => languageState.locale,
  );

export { selectLanguage, makeSelectLocale };
```

/app/containers/LanguageProvider/index.js

```js
// 此组件将redux state语言区域设置连接到IntlProvider组件和i18n信息（从“app/translations”加载）
// 这里的写法不做过多说明，后面说到模块化会做分析
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { IntlProvider } from 'react-intl';
import { ConfigProvider } from 'antd';
import enGB from 'antd/es/locale/en_GB';
import zhCN from 'antd/es/locale/zh_CN';

import { makeSelectLocale } from './selectors';

export function LanguageProvider(props) {
  const [antdLanguage, setAntdLanguage] = useState(zhCN);
  useEffect(() => {
    setAntdLanguage(props.locale === 'en' ? enGB : zhCN);
  }, [props.locale]);
  return (
    <IntlProvider locale={props.locale} key={props.locale} 
			messages={props.messages[props.locale]}>
      <ConfigProvider locale={antdLanguage}>
        {React.Children.only(props.children)}
      </ConfigProvider>
    </IntlProvider>
  );
}

LanguageProvider.propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.object,
    children: PropTypes.element.isRequired,
};

const mapStateToProps = createSelector(
    makeSelectLocale(),
    locale => ({ locale }),
);

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LanguageProvider);
```

### i18n国际化信息构建



开发的时候每个组件的国际化信息是在各自的文件夹下面的，所以生产前我们需要把这些国际化信息整合到一起。

保存到`app/translations/en.json`和`app/translations/zh.json`中。



构建文件我们分为三个

- `internals/scripts/extract-intl.js`
- `internals/scripts/helpers/checkmark.js`
- `internals/scripts/helpers/progress.js`



checkmark.js

```js
// 在构建输出的时候在输出文本上加上勾或叉（纯美化输出配置）
const chalk = require('chalk');

function addCheckMark(callback, fail = false) {
  if (fail) {
    process.stdout.write(chalk.red(' ×'));
  } else {
    process.stdout.write(chalk.green(' ✓'));
  }
  if (callback) callback();
}

module.exports = addCheckMark;
```



progress.js

```js
// 在构建输出的时候在输出文本上加上进度显示（纯美化输出配置）
const readline = require('readline');

/**
 * 添加动画进度指示器
 *
 * @param  {string} message 要在指示器旁边写入的消息
 * @param  {number} [amountOfDots=10] 要设置进度动画的点的数量
 */
function animateProgress(message, amountOfDots = 10) {
  let i = 0;
  return setInterval(() => {
    readline.cursorTo(process.stdout, 0);
    i = (i + 1) % (amountOfDots + 1);
    const dots = new Array(i + 1).join('.');
    process.stdout.write(message + dots);
  }, 500);
}

module.exports = animateProgress;
```



extract-intl.js

```js
// 此脚本将从所有组件中提取国际化消息，并将它们打包到translations文件中的翻译json文件中。

require('shelljs/global');

const fs = require('fs');
const nodeGlob = require('glob');
const { transform } = require('@babel/core');
const get = require('lodash/get');

const animateProgress = require('./helpers/progress');
const addCheckmark = require('./helpers/checkmark');

const { appLocales, DEFAULT_LOCALE } = require('../../app/i18n');

const babel = require('../../babel.config.js');
const { presets } = babel;
let plugins = babel.plugins || [];

plugins.push('react-intl');

// 注意：styled-components插件会被过滤掉，因为它在与transform一起使用时会产生错误
plugins = plugins.filter(p => p !== 'styled-components');

// Glob匹配每个模块的messages.js文件
const FILES_TO_PARSE = 'app/**/messages.js';

const newLine = () => process.stdout.write('\n');
// 整个过程的是否有失败
let FAIL_TO_LOAD = false;

// 进度条
let progress;
const task = message => {
  progress = animateProgress(message);
  process.stdout.write(message);

  return error => {
    if (error) {
      process.stderr.write(error);
    }
    clearTimeout(progress);
    return addCheckmark(() => newLine(), FAIL_TO_LOAD);
  };
};

// 将下面的异步函数包装成一个Promise
const glob = pattern =>
  new Promise((resolve, reject) => {
    nodeGlob(
      pattern,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

const readFile = fileName =>
  new Promise((resolve, reject) => {
    fs.readFile(
      fileName,
      'utf8',
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

// 将现有国际化信息存储到内存中
const oldLocaleMappings = [];
const localeMappings = [];

// 每个语言运行一次循环，先把项目的语言json文件读取出来
for (const locale of appLocales) {
  oldLocaleMappings[locale] = {};
  localeMappings[locale] = {};
  // 将国际化信息存储到的文件
  const translationFileName = `app/translations/${locale}.json`;
  try {
    // 解析旧的国际化信息JSON文件
    const messages = JSON.parse(fs.readFileSync(translationFileName));
    const messageKeys = Object.keys(messages);
    for (const messageKey of messageKeys) {
      oldLocaleMappings[locale][messageKey] = messages[messageKey];
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      process.stderr.write(
        `加载当前国际化信息文件出错: ${translationFileName}
        \n${error}`,
      );
      FAIL_TO_LOAD = true;
    }
  }
}
// 提取messages.js文件中的信息，合并到对应的json文件中
const extractFromFile = async filename => {
  try {
    // 读取messages.js
    const code = await readFile(filename);
		// 解析出messages信息
    const output = await transform(code, { filename, presets, plugins });
    const messages = get(output, 'metadata.react-intl.messages', []);
		// 循环messages信息与旧数据进行合并
    for (const message of messages) {
      for (const locale of appLocales) {
        // 用新提取的信息合并到旧的信息中
        const oldLocaleMapping = oldLocaleMappings[locale][message.id] || '';
        let newMsg = '';
        if (locale === DEFAULT_LOCALE) {
          newMsg = message.defaultMessage;
        } else if (message.description) {
          newMsg = message.description;
        }
        localeMappings[locale][message.id] = newMsg || oldLocaleMapping;
      }
    }
  } catch (error) {
    process.stderr.write(`\n国际化信息文件出错: ${filename}\n${error}\n`);
    FAIL_TO_LOAD = true;
  }
};

const memoryTask = glob(FILES_TO_PARSE);
const memoryTaskDone = task('在内存中存储语言文件');

memoryTask.then(files => {
  memoryTaskDone();

  const extractTask = Promise.all(
    files.map(fileName => extractFromFile(fileName)),
  );
  const extractTaskDone = task('对所有文件进行国际化信息提取');
  extractTask.then(() => {
    extractTaskDone();
    
    let localeTaskDone;
    let translationFileName;

    for (const locale of appLocales) {
      translationFileName = `app/translations/${locale}.json`;
      localeTaskDone = task(
        `将国际化信息 ${locale} 写入: ${translationFileName}`,
      );

      // 对国际化JSON文件进行排序，以便git差异化更容易
      const messages = {};
      Object.keys(localeMappings[locale])
        .sort()
        .forEach(key => {
          messages[key] = localeMappings[locale][key];
        });

      // 将国际化信息的JSON表示形式写入文件
      const prettified = `${JSON.stringify(messages, null, 2)}\n`;

      try {
        // 如果读取文件信息过程中出现错误则不写入json文件
        if (!FAIL_TO_LOAD) {
          fs.writeFileSync(translationFileName, prettified);
          localeTaskDone();
        } else {
          localeTaskDone(' 失败');
        }
      } catch (error) {
        localeTaskDone(
          `保存当前国际化文件的时候出现错误: ${translationFileName}
          \n${error}`,
        );
        FAIL_TO_LOAD = true;
      }
    }

    process.exit();
  });
});
```



### 全局样式

/app/global-styles.js

```js
// 这里写一些全局样式，也可以用来覆盖antd组件的一些样式
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html{
    height: auto;
  }
`

export default GlobalStyle;
```

### App组件（项目根组件）

/app/App/index.js

```js
// 这里就是我们整个项目的页面结构的开始
// 后面我们还会在这里定义路由
import React from 'react';

import GlobalStyle from '../../global-styles';

export default function App() {
    return (
        <div>
            React App
            <GlobalStyle />
        </div>
    );
}
```

### 入口文件

/app/app.js

```js
// 需要 redux-saga es6 generator 支持
import '@babel/polyfill';

// 导入所有第三方的东西
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from 'utils/history';
import 'sanitize.css/sanitize.css';
import 'antd/dist/antd.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import configureStore from './configureStore';

// 引入国际化信息
import { translationMessages } from './i18n';

// 创建具有历史记录的redux store
const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app');

// reactDOM渲染 
// 第一层是redux store注入，Provider使用context将store传给子组件
// 第二层国际化注入
// 第三层绑定react-router到redux的组件，ConnectedRouter传递history对象作为props
// 第四层主应用
const render = messages => {
    ReactDOM.render(
        <Provider store={store}>
            <LanguageProvider messages={messages}>
                <ConnectedRouter history={history}>
                    <App />
                </ConnectedRouter>
            </LanguageProvider>
        </Provider>,
        MOUNT_NODE,
    );
};

if (module.hot) {
		// 当启动热更新的时候，国际化信息和App的任何变化都会触发热更新
    module.hot.accept(['./i18n', 'containers/App'], () => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE);
        render(translationMessages);
    });
}

// 为不支持Intl的浏览器做兼容
if (!window.Intl) {
    new Promise(resolve => {
        resolve(import('intl'));
    })
        .then(() => Promise.all([import('intl/locale-data/jsonp/en.js')]))
        .then(() => render(translationMessages))
        .catch(err => {
            throw err;
        });
} else {
    render(translationMessages);
}

// 在最后才安装 ServiceWorker 和 AppCache
// 它不是最重要的，所以放在最后
// 主应用构建过程中发生任何错误都不需要构建它
if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line global-require
    require('offline-plugin/runtime').install();
}
```



这里有一点可以[展开说明](https://blog.csdn.net/u010377383/article/details/79407241)，就是 redux 提供的 `Provider` 组件：

一个应用中，最好只有一个地方需要直接导入 Store ，这个位置当然应该是在调用最顶层 React 组件的位置 。但是这样需要把Store，从顶层一层层往下传递，首先我们想到的就是props（父子组件通信方案）。这种方法有一个很大的缺陷，就是从上到下，所有的组件都要帮助传递这个 props 。

设想在一个嵌套多层的组件结构中，只有最里层的组件才需要使用 store ，但是为了把 store 从最外层传递到最里层，就要求中间所有的组件都需要增加对这个 store prop 的支持，即使根本不使用它，这无疑增加程序的耦合度，复杂度和不可维护性 。

React 提供了一个 叫 Context 的功能，能够完美地解决这个问题 。所谓 Context ，就是“上下文环境”，让一个树状组件上所有组件都能访问一个共同的对象，为了完成这个任务，需要上级组件和下级组件配合 。然后，这个上级组件之下的所有子孙组件，只要宣称自己需要这个 context ，就可以通过 this.context 访问到这个共同的环境对象。

> 这里是官方文档对Provider的说明
>
> `<Provider store>` 使组件层级中的 `connect()` 方法都能够获得 Redux store。正常情况下，你的根组件应该嵌套在 `<Provider>` 中才能使用 `connect()` 方法。
>
> 如果你**真的**不想把根组件嵌套在 `<Provider>` 中，你可以把 `store` 作为 props 传递到每一个被 `connect()` 包装的组件，但是我们只推荐您在单元测试中对 `store` 进行伪造 (stub) 或者在非完全基于 React 的代码中才这样做。正常情况下，你应该使用 `<Provider>`。

下面是`<Provider>`组件的源码，我们可以简单看一下：

```js
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Subscription from '../utils/Subscription';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';
// 创建了一个context
var ReactReduxContext = /*#__PURE__*/React.createContext(null);

if (process.env.NODE_ENV !== 'production') {
  ReactReduxContext.displayName = 'ReactRedux';
}

function Provider(_ref) {
  var store = _ref.store,
      context = _ref.context,
      children = _ref.children;
  // 给memo组件注入了 store 和 subscription
  var contextValue = useMemo(function () {
    var subscription = new Subscription(store);
    subscription.onStateChange = subscription.notifyNestedSubs;
    return {
      store: store,
      subscription: subscription
    };
  }, [store]);
  var previousState = useMemo(function () {
    return store.getState();
  }, [store]);
  useIsomorphicLayoutEffect(function () {
    var subscription = contextValue.subscription;
    subscription.trySubscribe();

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }

    return function () {
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;
    };
  }, [contextValue, previousState]);
  var Context = context || ReactReduxContext;
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: contextValue
  }, children);
}
// 给组件加上 store 的方法
if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    context: PropTypes.object,
    children: PropTypes.any
  };
}

export default Provider;
```



## 编写npm指令

到目前为止，我们已经可以启动我们的项目了。我们预设了两种模式开发环境和生产环境，那么我们现在根据我们之前的配置编写几个指令。

package.json

```json
"scripts": {
  // 给定环境变量development，执行server/index.js，这个就是我们的开发环境
  "start": "cross-env NODE_ENV=development node server",
  // 先打包，再给定环境变量production，执行server/index.js，这个就是我们的生产环境
  // 这里运行就是打包文件dist里面的内容
  "start:prod": "npm run build && cross-env NODE_ENV=production node server",
  // 开发环境下，用ngrok把本地项目映射到外网，方便他人访问（免费映射，速度随缘）
  "start:tunnel": "cross-env NODE_ENV=development ENABLE_TUNNEL=true node server",
  // 执行build命令会自动执行的前置命令，清理之前的打包文件
  "prebuild": "npm run build:clean",
  // 项目打包，指定生产环境webpack配置文件
  "build": "cross-env NODE_ENV=production webpack --config internals/webpack/webpack.prod.babel.js --color --progress",
  // 清理之前的打包文件
  "build:clean": "rimraf ./dist",
  // 执行国际化信息的整合
  "extract-intl": "node ./internals/scripts/extract-intl.js",
  // 校验项目代码以及样式
  "lint": "npm run lint:js && npm run lint:css",
  // 校验项目样式
  "lint:css": "stylelint app/**/*.js",
  // 校验项目代码
  "lint:js": "node ./internals/scripts/eslint.js",
}
```

这里暂时只写了这几个命令，已经可以满足我们平时开发的需求，后面我们还会添加一些指令，用于其他模块。



## 组件化与模块化



### 组件化与模块化思想



首先我们要明确一点，是什么问题导致了我们需要模块化和组件化。

- 代码都是很多很多写在一起
- 没有好的功能划分
- 不能实现组件复用
- 页面 UI 和数据没有实现分离
- 页面逻辑条理不清晰
- 可读性差
- 可维护性差

所以针对以上问题前端出现了组件化和模块化的思想，以前的Jquery到现在的Angular，React，Vue在基于 MVC/MVVM的设计思想对于组件化模块化的思想越来越规范。



再看看React是怎么做的。

**React的主要思想就是数据和DOM操作分离，而且都利用JS去实现所有功能（UI 渲染、数据处理），分离之后我们只需要关注数据层面的增删改查，而不需要关心怎样把数据渲染到DOM元素上，关于DOM挂载这些事情React都帮我们做了。**



但其实在实际开发中，项目在架构之时如果没有一定的规范，其实代码依旧会很乱，并不能有效解决上述的问题。所以作为一个多人长期开发维护的项目，在建项的时候就要考虑到如何从根源上解决这些问题。



下面我们将实现React思想中的数据和DOM操作分离、利用JS去实现所有功能、只关注数据层面的增删改查。



### [函数式编程](https://blog.csdn.net/deng1456694385/article/details/87213594)



函数是编程是一种设计思想，就像面向对象编程也是一种设计思想。函数式编程总的来说就是用尽量用函数组合来进行编程，先声明函数，然后调用函数的每一步都有返回值，将具体的每一步逻辑运算抽象，封装在函数中。再将函数组合来编写程序。



**React中子组件受父组件传入的`props`控制，但是子组件不能直接修改`props`，也就是单项数据流，这样就有点类似于纯函数的特性，不改变外部状态。所以我们在开发组件是，应当尽量将具有副作用的操作交给外部控制，这样的组件才是独立的，也具有高度的适应性。**



**为什么要使用函数式编程？**

1. 开发速度快，高度使用函数可以不断复用逻辑，函数对外为黑盒可直接无副作用的使用。
2. 通过函数名就可以直接理解用处，不需要了解内部实现，接近自然语言，相当于我们使用吹风机，不需要一步步制作吹风机。
3. 代码更清晰，真正调用的代码很简单，所有细节逻辑都封装在函数内。
4. 方便并发处理，因为方法为纯函数不影响外部变量，可以随意排放处理顺序。



### 编写路由



开始具体说组件化和模块化之前我们需要一个默认路由指向我们的首页容器。

```js
import React from 'react';

import GlobalStyle from '../../global-styles';
import { Switch, Route } from 'react-router-dom';
import Home from 'app/containers/Home';

export default function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Home} />
      </Switch>
      <GlobalStyle />
    </div>
  );
}
```



### 编写容器



一个容器本质上也是一种组件，它是可以进行异步操作的，所以容器是需要用到redux+Saga来处理异步操作的。但是组件是容器中抽离出来的一块块功能，它不需要redux+Saga的支持，它的逻辑应该都是内部实现的，它只接收一些需要的参数就能完成渲染，所以组件有时候也不一定需要复用性很强，或者是我觉得某一块就是一块整体，那么就可以把它抽离出来当作一个组件。

试想一下，我们的每个页面容器里面都是一个个组件拼装而成，那么这个页面的布局是不是一下就能看清楚，如同前面函数式编程说的，我不需要关心每个组件内部是怎么实现的，因为容器我只需要看清它的结构就好了。



那么我们先看一下一个页面容器模块化需要用到的文件有哪些：

- `constants.js` action常量
- `actions.js` action定义
- `reducer.js` reducer函数
- `selectors.js` reselect包装的state取值方法
- `Loadable.js` 利用react的延迟加载方法，延迟加载组件
- `saga.js` saga模块
- `mseeages.js` 国际化信息
- `node.js` 样式
- `index.js` 组件



乍一看，文件很多，好像很乱的样子，我们一个一个来捋：



#### constants.js

给其他文件提供常量，常量值的定义一定要对应到容器名，因为我们的store是全局的，它需要知道这个action是哪个容器的。

```js
export const DEFAULT_ACTION = 'app/Home/DEFAULT_ACTION';
```



#### actions.js

action定义的文件，组件和saga会执行对它们的调用来修改state中的值。

```js
import { DEFAULT_ACTION } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}
```



#### reducer.js



简单来说 redux 就是一组 state ，想要修改它里面的值就要发起一个 action ， action 就是一个普通 JavaScript 对象。强制使用 action 来描述所有变化带来的好处是可以清晰地知道应用中到底发生了什么。如果一些东西改变了，就可以知道为什么变。action 就像是描述发生了什么的指示器。最终，为了把 action 和 state 串起来，开发一些函数，这就是 reducer。最后存放 state 的地方就是 store ，能够触发 action 方法的就是 dispatch 。



那么之前我们在入口文件用了`<Provider>`组件实现了 store 的全局共享，但是回头看一下`/app/reducers.js`的代码，我们预留了一个`injectedReducers`的入参，就是让每个容器的redux能够在组件初始化的时候合并到store中。所以我们现在需要一个方法，能够在每次容器初始化的时候自动帮我们把当前容器的redux合并到store中。

那么我们先在`/app/utils`里面创建一些文件来实现合并redux的方法。

injectReducer.js

```js
import React from 'react';
import { ReactReduxContext } from 'react-redux';

import getInjectors from './reducerInjectors';

/**
 * 动态注入一个reducer
 *
 * @param {string} key reducer的模块名称
 * @param {function} reducer 一个将被注入的reducer函数
 *
 */
const useInjectReducer = ({ key, reducer }) => {
  // 获取顶级父组件的context
  const context = React.useContext(ReactReduxContext);
  // 当前组件初始化的时候执行一次Reducer注入
  React.useEffect(() => {
    getInjectors(context.store).injectReducer(key, reducer);
  }, []);
};

export { useInjectReducer };
```

reducerInjectors.js

```js
import invariant from 'invariant';
import { isEmpty, isFunction, isString } from 'lodash';

import checkStore from './checkStore';
import createReducer from '../reducers';

export function injectReducerFactory(store, isValid) {
  return function injectReducer(key, reducer) {
    if (!isValid) checkStore(store);
		// 验证参数合法性
    invariant(
      isString(key) && !isEmpty(key) && isFunction(reducer),
      '(app/utils...) injectReducer: 模块名称key应为非空字符串且reducer应该是一个reducer function',
    );

    // 开发过程中我们可能会修改Reducer
    // 判断 `store.injectedReducers[key] === reducer` 以便在模块key相同但是reducer不同时执行热加载
    if (Reflect.has(store.injectedReducers, key) && store.injectedReducers[key] === reducer) return;

    // 替换新的Reducer
    store.injectedReducers[key] = reducer; // eslint-disable-line no-param-reassign
    store.replaceReducer(createReducer(store.injectedReducers));
  };
}

export default function getInjectors(store) {
  // 检查store的有效性
  checkStore(store);

  return {
    injectReducer: injectReducerFactory(store, true),
  };
}
```

checkStore.js

```js
import { conformsTo, isFunction, isObject } from 'lodash';
import invariant from 'invariant';

/**
 * 验证 redux store 的有效性
 */
export default function checkStore(store) {
  const shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    runSaga: isFunction,
    injectedReducers: isObject,
    injectedSagas: isObject,
  };
  invariant(conformsTo(store, shape), '(app/utils...) injectors: 需要有效的 redux store');
}
```



好了，到这里我们把合并redux的通用方法写完了，后面我们只需要在`index.js`里面调用一次就可以了。

再说回我们当前容器的`reducer.js`

前面引入react插件的时候我们提到了`immer`，前面给出的解释如果有点难理解的话，这篇[文章](https://blog.csdn.net/zsy_snake/article/details/104431600)很好的作出了解释。我这里总结一下就是：

利用 ES6 的 proxy，几乎以最小的成本实现了 js 的不可变数据结构。当数据需要变动时，也不会对整个结构树进行重新的深拷贝，而是只改变需要改变的数据。看个例子，体会一下：

```js
const currentState = {
  a: [],
  p: {
    x: 1
  }
}

let nextState = produce(currentState, (draft) => {
  draft.a.push(2);
})

currentState.a === nextState.a; // false
currentState.p === nextState.p; // true
```

reducer.js

```js
import produce from 'immer';
import { DEFAULT_ACTION } from './constants';

export const initialState = {
  title: 'Home'
  msg: 'rainbow in paper',
};

/* eslint-disable default-case, no-param-reassign */
const homeReducer = (state = initialState, action) =>
  // eslint-disable-next-line no-unused-vars
  produce(state, draft => {
    switch (action.type) {
      case DEFAULT_ACTION:
        break;
    }
  });

export default homeReducer;
```



#### selectors.js

这里面用到了`reselect`对state进行取值，我们在saga和index中使用state的值都从这些选择器中获取，可以提高性能。

```js
import { createSelector } from 'reselect';
import { initialState } from './reducer';

// Home状态域的直接选择器
// 返回当前模块的state
const selectHomeDomain = state => state.home || initialState;

/**
 * reselect可以对传入的依赖做一个缓存，如果传入的函数的结果不变，那返回的结果也不会变
 * 在依赖函数中只直接取值，不针对值进行计算，将计算放到createSelector中最后一个参数的函数中
 */

const makeSelectHome = () => createSelector(selectHomeDomain, subState => subState);
const makeSelectHomeMsg = () => createSelector(selectHomeDomain, subState => subState.msg);

export default makeSelectHome;
export { makeSelectHome, makeSelectHomeMsg };
```



#### Loadable.js

编写路由的时候我们都使用延迟加载来加载容器来提高性能，所以这个文件就是当前容器或者是组件的入口，它会返回一个包装好的延迟加载组件。想要了解延迟加载的实现的可以看下这篇[文章](https://zhuanlan.zhihu.com/p/34210780)。

因为所有的延迟加载包装都是一样的操作，所以我们先在`/app/utils/loadable.js`里面写个包装方法。包装方法是固定的 这里不作过多解释。

```js
import React, { lazy, Suspense } from 'react';

const loadable = (importFunc, { fallback = null } = { fallback: null }) => {
  const LazyComponent = lazy(importFunc);

  return props => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default loadable;
```

Loadable.js

因为已经有包装方法了，所以实现很简单了。

```js
import loadable from '../../utils/loadable';

export default loadable(() => import('./index'));
```



#### saga.js

saga是用来处理异常和异步等副作用操作的，而且saga的运行是依赖于redux的，所以，saga也是需要动态注册的，那么我们需要像处理redux那样，写一个注册saga的公共方法，在每个容器初始化的时候调用，组件卸载的时候自动注销。



那么我们接着在`/app/utils`下面创建我们的注册方法：

injectSaga.js

```js
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ReactReduxContext } from 'react-redux';

import getInjectors from './sagaInjectors';

/**
 * 动态注入Saga，将组件的props作为Saga参数传递
 * @param {string} Saga的模块
 * @param {function} 将被注入的Saga
 * @param {string} [mode] 注册模式
 */

const useInjectSaga = ({ key, saga, mode }) => {
  // 获取顶级父组件的context
  const context = React.useContext(ReactReduxContext);
  // 当前组件初始化的时候执行一次Saga注册
  React.useEffect(() => {
    const injectors = getInjectors(context.store);
    // 注册saga
    injectors.injectSaga(key, { saga, mode });

    return () => {
      // 组件卸载时执行注销saga
      injectors.ejectSaga(key);
    };
  }, []);
};

export { useInjectSaga };
```

sagaInjectors.js

```js
import invariant from 'invariant';
import { isEmpty, isFunction, isString, conformsTo } from 'lodash';

import checkStore from './checkStore';
import { DAEMON, ONCE_TILL_UNMOUNT, RESTART_ON_REMOUNT } from './constants';

const allowedModes = [RESTART_ON_REMOUNT, DAEMON, ONCE_TILL_UNMOUNT];

const checkKey = key =>
  invariant(isString(key) && !isEmpty(key), '(app/utils...) injectSaga: 模块名称key应为非空字符串');

const checkDescriptor = descriptor => {
  const shape = {
    saga: isFunction,
    mode: mode => isString(mode) && allowedModes.includes(mode),
  };
  invariant(
    conformsTo(descriptor, shape),
    '(app/utils...) injectSaga: 应该传入一个有效的 saga descriptor',
  );
};

export function injectSagaFactory(store, isValid) {
  return function injectSaga(key, descriptor = {}, args) {
    if (!isValid) checkStore(store);

    const newDescriptor = {
      ...descriptor,
      mode: descriptor.mode || DAEMON,
    };
    const { saga, mode } = newDescriptor;
    // 验证参数合法性
    checkKey(key);
    checkDescriptor(newDescriptor);
    // 是否已经有saga注册过
    let hasSaga = Reflect.has(store.injectedSagas, key);
    // 如果不是生产环境，则执行热更新判断，因为在开发环境下saga是不会改变的
    if (process.env.NODE_ENV !== 'production') {
      const oldDescriptor = store.injectedSagas[key];
      // 如果新的saga与旧的不同则注销旧的
      if (hasSaga && oldDescriptor.saga !== saga) {
        oldDescriptor.task.cancel();
        hasSaga = false;
      }
    }
    // 如果没有注册过saga或者注册模式为重新装载时重新启动则注册当前saga
    if (!hasSaga || (hasSaga && mode !== DAEMON && mode !== ONCE_TILL_UNMOUNT)) {
      /* eslint-disable no-param-reassign */
      store.injectedSagas[key] = {
        ...newDescriptor,
        task: store.runSaga(saga, args),
      };
      /* eslint-enable no-param-reassign */
    }
  };
}

export function ejectSagaFactory(store, isValid) {
  return function ejectSaga(key) {
    if (!isValid) checkStore(store);
    // 验证参数合法性
    checkKey(key);
    // 判断是否存在当前模块的saga
    if (Reflect.has(store.injectedSagas, key)) {
      const descriptor = store.injectedSagas[key];
      // 如果不是默认注册模式，则每次都要注销当前saga
      if (descriptor.mode && descriptor.mode !== DAEMON) {
        descriptor.task.cancel();
        // 生产过程中的清理；在开发过程中，我们需要“descriptor.saga”进行热重新加载
        if (process.env.NODE_ENV === 'production') {
          // 需要一些值才能检测“ONCE_TILL_UNMOUNT”saga中的`injectSaga`
          store.injectedSagas[key] = 'done'; // eslint-disable-line no-param-reassign
        }
      }
    }
  };
}

export default function getInjectors(store) {
  // 检查store的有效性
  checkStore(store);

  return {
    // 注册sage
    injectSaga: injectSagaFactory(store, true),
    // 注销saga
    ejectSaga: ejectSagaFactory(store, true),
  };
}
```

constants.js

```js
// RESTART_ON_REMOUNT saga将在安装组件时启动，并在卸载组件时使用'task.cancel()'取消，以提高性能。
export const RESTART_ON_REMOUNT = '@@saga-injector/restart-on-remount';
// 默认情况下（DAEMON）在组件装载时将启动saga，从未取消或重新启动。
export const DAEMON = '@@saga-injector/daemon';
// ONCE_TILL_UNMOUNT 行为类似于“重新装入时重新启动”，重新装入前不会再次运行它。
export const ONCE_TILL_UNMOUNT = '@@saga-injector/once-till-unmount';
```



好了，到这里我们把注册注销saga的通用方法写完了，后面我们只需要在`index.js`里面调用一次就可以了。

再说回我们当前容器的`saga.js`



saga是Middleware的一种，工作于action和reducer之间。如果按照原始的redux工作流程，当组件中产生一个

action后会直接触发reducer修改state；而往往实际中，组件中发生的action后，在进入reducer之前需要完成一

个异步任务，显然原生的redux是不支持这种操作的。

 不过，实现异步操作的整体步骤是很清晰的：action被触发后，首先执行异步任务，待完成后再将这个action交给

reducer。

saga需要一个全局监听器（watcher saga），用于监听组件发出的action，将监听到的action转发给对应的接收器

（worker saga），再由接收器执行具体任务，任务执行完后，再发出另一个action交由reducer修改state，所以

这里必须注意：watcher saga监听的action和对应worker saga中发出的action不能是同一个，否则造成死循环

 在saga中，全局监听器和接收器都使用Generator函数和saga自身的一些辅助函数实现对整个流程的管控

 整个流程可以简单描述为

 `Component —> Action1 —> Watcher Saga —> Worker Saga —> Action2 —> Reducer —> Component`



saga.js

```js
import { takeLatest, delay } from 'redux-saga/effects';

import { DEFAULT_ACTION } from './constants';

// 页面初始化
export function* defaultSaga() {
  try {
    yield delay(3000);
    console.log('delay 3s log');
  } catch (error) {
    console.log(error);
  }
}

export default function* homeSaga() {
  // takeLatest 不允许多个 saga 任务并行地执行。
  // 一旦接收到新的发起的 action，它就会取消前面所有 fork 过的任务（如果这些任务还在执行的话）。
  yield takeLatest(DEFAULT_ACTION, defaultSaga);
}
```



#### mseeages.js



为了避免多人协同开发一个`zh.json`文件导致频繁冲突，翻译先放分别置于每个模块下message.js文件，开发完成统一用node工具自动生成到`zh.json`，`en.json`文件。



```js
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Home';

export default defineMessages({
  changeLang: {
    id: `${scope}.changeLang`,
    defaultMessage: '切换语言', // 默认中文
    // 语言描述，这里我们就写英文信息
		// 使用npm run extract-intl时会把description赋值到对应英文信息里面
    description: 'Change Language', 
  },
  webTitle: {
    id: `${scope}.webTitle`,
    defaultMessage: '纸上的彩虹',
    description: 'Rainbow In Paper',
  },
});
```



#### nodes.js



nodes是`styled-components`包装的当前页面的所有节点样式，供index页面引用，那么页面布局就像是一个个语义化的标签构成的，可以是页面的结构清晰明了。

```js
import styled, { css } from 'styled-components';

const container = css`
  text-align: center;
  margin: 50px;
`;

/* eslint-disable prettier/prettier */
const Container = styled.div`${container}`;

export default { Container };
```



#### index.js



```js
/**
 React.memo(...)是React v16.6引进来的新属性。
 它的作用和React.PureComponent类似，是用来控制函数组件的重新渲染的。
 React.memo(...) 其实就是函数组件的React.PureComponent。
 用memo包装组件就是尽可能优化组件的性能，避免不必要的无用或者重复的渲染
 */
import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { FormattedMessage } from 'react-intl';
import { useInjectReducer } from '../../utils/injectReducer';
import { useInjectSaga } from '../../utils/injectSaga';
import reducer from './reducer';
import saga from './saga';
import { makeSelectHome } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { defaultAction } from './actions';
import messages from './messages';
import Nodes from './nodes';
import { Button } from 'antd';
import { changeLocale } from '../LanguageProvider/actions';

export function Home(props) {
  // 注册reducer
  useInjectReducer({ key: 'home', reducer });
  // 注册saga
  useInjectSaga({ key: 'home', saga });
  const { msg } = props.home;
  // useEffect相当于函数组件的生命周期
  useEffect(() => {
    props.defaultAction();
    console.log('组件加载');
    return () => {
      console.log('组件卸载');
    }
  }, []);
  return (
    <div>
      <FormattedMessage {...messages.webTitle}>
        {title => (
          <Helmet>
            <title>{title}</title>
            <meta name="description" content="Description of Home" />
          </Helmet>
        )}
      </FormattedMessage>
      <Nodes.Container>
        <Nodes.Title>
          <FormattedMessage {...messages.webTitle} />
        </Nodes.Title>
        <Button
          type="primary"
          onClick={() => {
            props.changeLang(props.locale === 'zh' ? 'en' : 'zh');
          }}
        >
          <FormattedMessage {...messages.changeLang} />
        </Button>
      </Nodes.Container>
    </div>
  );
}

/**
 使用属性类型来记录传递给组件的属性的预期类型。
 运行时对props进行类型检查。
 */
// eslint-disable-next-line react/no-typos
Home.PropTypes = {
  dispatch: PropTypes.func.isRequired,
};

// 为当前组件的props注入需要的state
const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  home: makeSelectHome(),
});
// 为当前组件的props导入需要的action
function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    defaultAction: () => {
      dispatch(defaultAction());
    },
    changeLang: lang => {
      dispatch(changeLocale(lang));
    },
  };
}

/**
 连接 React 组件与 Redux store。
 连接操作不会改变原来的组件类。
 反而返回一个新的已与 Redux store 连接的组件类。

 mapStateToProps: 如果定义该参数，组件将会监听 Redux store 的变化。
 任何时候，只要 Redux store 发生改变，mapStateToProps 函数就会被调用。
 该回调函数必须返回一个纯对象，这个对象会与组件的 props 合并。
 如果你省略了这个参数，你的组件将不会监听 Redux store。

 mapDispatchToProps: 如果传递的是一个对象，
 那么每个定义在该对象的函数都将被当作 Redux action creator，对象所定义的方法名将作为属性名；
 每个方法将返回一个新的函数，函数中dispatch方法会将action creator的返回值作为参数执行。
 这些属性会被合并到组件的 props 中。

 根据配置信息，返回一个注入了 state 和 action creator 的 React 组件。
 */
const withConnect = connect(mapStateToProps, mapDispatchToProps);

/**
 从右到左来组合多个函数。

 这是函数式编程中的方法，为了方便，被放到了 Redux 里。
 当需要把多个 store 增强器 依次执行的时候，需要用到它。

 返回值: 从右到左把接收到的函数合成后的最终函数。
 */
export default compose(withConnect, memo)(Home);
```



### 编写组件



前面说到组件我们是不需要处理异步的，同样也不需要state，它只需要接收外部传入的数据然后在内部进行消化就好了，那么相对于容器来说组件需要的模块化文件就少很多了。

- `Loadable.js` 利用react的延迟加载方法，延迟加载组件，如果组件很大则需要延迟加载，否则直接引入index即可
- `mseeages.js` 国际化信息
- `node.js` 样式
- `index.js` 组件



我这里就写一个动态修改主题色的组件`<ThemeSelect>`：



这里我们用到一个颜色选择的插件：

```shell
$ npm install react-color
```



#### Loadable.js



```js
import loadable from '../../utils/loadable';

export default loadable(() => import('./index'));
```



#### mseeages.js



```js
import { defineMessages } from 'react-intl';

export const scope = 'app.components.ThemeSelect';

export default defineMessages({
  changeTheme: {
    id: `${scope}.changeTheme`,
    defaultMessage: '切换主题',
    description: 'Change Theme',
  },
});
```



#### node.js



```js
import { createGlobalStyle } from 'styled-components';

const ContainerStyle = createGlobalStyle`
  .ant-popover-inner{
    background-color: transparent !important;
    box-shadow: none !important;
  }
`;

export default {
  ContainerStyle,
};
```



#### index.js



```js
import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { Popover, Button, message } from 'antd';
import { BlockPicker, CirclePicker } from 'react-color';
import Nodes from './nodes';

function ThemeSelect(props) {
  const [visible, setVisible] = useState(false);
  const type = props.type === 'circle' ? 'circle' : 'default';

  const handleColorChange = color => {
    window.less
      .modifyVars({ '@primary-color': color.hex, '@btn-primary-bg': color.hex })
      .then(() => {
        setVisible(false);
        message.success('主题变更成功');
      })
      .catch(error => {
        message.error(error);
      });
  };

  const handleVisibleChange = v => {
    setVisible(v);
  };

  return (
    <>
      <Popover
        content={
          type === 'circle' ? (
            <CirclePicker onChange={handleColorChange} />
          ) : (
            <BlockPicker onChange={handleColorChange} />
          )
        }
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        <Button type="primary">
          <FormattedMessage {...messages.changeTheme} />
        </Button>
      </Popover>
      <Nodes.ContainerStyle />
    </>
  );
}
// 默认参数
ThemeSelect.defaultProps = {
  type: 'default',
};
// 传入参数
ThemeSelect.propTypes = {
  type: PropTypes.string,
};

export default memo(ThemeSelect);
```



然后我们在之前的Home里面引用一下：

```js
...
import ThemeSelect from '../../components/ThemeSelect';
...
export function Home(props) {
  ...
  return (
  	...
    <ThemeSelect type="circle" />
    ...
  )
}
```



大功告成，目前为止我们已经走完了工程化的一整套流程。可是还有一个问题，虽然我们每个容器的模块化做的很好，但是这创建的文件也太多了，而且很多代码都是一样的，所以我们需要一个模版构建的工具，让我们能容器和组件能够自动初始化，我们只要直接写业务就行。还有既然有国际化那么我们现在默认的是中英文，怎么动态再添加一门语言呢？那么接下来我们进行最后一步：模版构建。



## 模版构建



模版构建这里用到的脚手架工具是`plop`，它是一个微型的脚手架工具，它的特点是可以根据一个模板文件批量的生成文本或者代码，不再需要手动复制粘贴，省事省力。



首先我们安装一下：

```shell
$ npm install plop -D
```



然后我们在`/internals`下面创建新文件夹`generators`，再创建`index.js`。



```js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// 组件生成器
const componentGenerator = require('./component/index.js');
// 容器生成器
const containerGenerator = require('./container/index.js');
// 语言生成器
const languageGenerator = require('./language/index.js');

// 备份文件后缀名
const BACKUPFILE_EXTENSION = 'rbgen';

module.exports = plop => {
  // 创建生成器
  plop.setGenerator('component', componentGenerator);
  plop.setGenerator('container', containerGenerator);
  plop.setGenerator('language', languageGenerator);
	// 自定义plop的Action Type
  // 格式化代码格式
  plop.setActionType('prettify', (answers, config) => {
    const folderPath = `${path.join(
      __dirname,
      '/../../app/',
      config.path,
      plop.getHelper('properCase')(answers.name),
      '**',
      '**.js',
    )}`;

    // eslint-disable-next-line no-useless-catch
    try {
      execSync(`npm run prettify -- "${folderPath}"`);
      return folderPath;
    } catch (err) {
      throw err;
    }
  });
  // 备份文件
  plop.setActionType('backup', (answers, config) => {
    // eslint-disable-next-line no-useless-catch
    try {
      fs.copyFileSync(
        path.join(__dirname, config.path, config.file),
        path.join(
          __dirname,
          config.path,
          `${config.file}.${BACKUPFILE_EXTENSION}`,
        ),
        'utf8',
      );
      return path.join(
        __dirname,
        config.path,
        `${config.file}.${BACKUPFILE_EXTENSION}`,
      );
    } catch (err) {
      throw err;
    }
  });
};

module.exports.BACKUPFILE_EXTENSION = BACKUPFILE_EXTENSION;
```



我们还需要一个方法，就是每次创建新组件的时候要去检查我们是否已经创建过同名的组件或容器。这里我们在`generators`里面创建一个`utils`文件夹，然后再创建一个`componentExists.js`。

```js
const fs = require('fs');
const path = require('path');
const pageComponents = fs.readdirSync(path.join(__dirname, '../../../app/components'));
const pageContainers = fs.readdirSync(path.join(__dirname, '../../../app/containers'));
const components = pageComponents.concat(pageContainers);

function componentExists(comp) {
  return components.indexOf(comp) >= 0;
}

module.exports = componentExists;

```



### 容器构建



我们在`generators`文件下创建文件夹`container`，再创建`index.js`。



```js
const componentExists = require('../utils/componentExists');

module.exports = {
  description: '添加一个容器',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '容器名是什么？',
      default: 'Form',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value) ? '已经存在相同的容器名或者组件名' : true;
        }

        return '容器名为必填';
      },
    },
    {
      type: 'confirm',
      name: 'memo',
      default: true,
      message: '是否要将容器包装在React.memo中？',
    },
    {
      type: 'confirm',
      name: 'wantHeaders',
      default: true,
      message: '是否需要页面头部信息？',
    },
    {
      type: 'confirm',
      name: 'wantActionsAndReducer',
      default: true,
      message:
        '容器是否需要 actions/constants/selectors/reducer ？',
    },
    {
      type: 'confirm',
      name: 'wantSaga',
      default: true,
      message: '容器是否需要Saga？',
    },
    {
      type: 'confirm',
      name: 'wantMessages',
      default: true,
      message: '容器是否需要国际化组件？',
    },
    {
      type: 'confirm',
      name: 'wantLoadable',
      default: true,
      message: '容器是否要异步加载？',
    },
  ],
  actions: data => {
    // 生成页面
    const actions = [
      {
        type: 'add',
        path: '../../app/containers/{{properCase name}}/index.js',
        templateFile: './container/index.js.hbs',
        abortOnFail: true, // 如果此操作因任何原因失败，中止所有后续操作
      },
      {
        type: 'add',
        path: '../../app/containers/{{properCase name}}/nodes.js',
        templateFile: './container/nodes.js.hbs',
        abortOnFail: true,
      },
    ];

    if (data.wantMessages) {
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/messages.js',
        templateFile: './container/messages.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.wantActionsAndReducer) {
      // Actions
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/actions.js',
        templateFile: './container/actions.js.hbs',
        abortOnFail: true,
      });

      // Constants
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/constants.js',
        templateFile: './container/constants.js.hbs',
        abortOnFail: true,
      });

      // Selectors
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/selectors.js',
        templateFile: './container/selectors.js.hbs',
        abortOnFail: true,
      });

      // Reducer
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/reducer.js',
        templateFile: './container/reducer.js.hbs',
        abortOnFail: true,
      });
    }

    // Sagas
    if (data.wantSaga) {
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/saga.js',
        templateFile: './container/saga.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.wantLoadable) {
      actions.push({
        type: 'add',
        path: '../../app/containers/{{properCase name}}/Loadable.js',
        templateFile: './container/loadable.js.hbs',
        abortOnFail: true,
      });
    }
		
    // 格式化
    actions.push({
      type: 'prettify',
      path: '/containers/',
    });

    return actions;
  },
};
```



如上面的代码所示，每个容器有九个文件需要创建，同样就对应9个模版：

- `constants.js.hbs` 
- `actions.js.hbs` 
- `reducer.js.hbs` 
- `selectors.js.hbs` 
- `loadable.js.hbs` 
- `saga.js.hbs` 
- `mseeages.js.hbs` 
- `node.js.hbs` 
- `index.js.hbs` 



模版文件都是`.hbs`，全称`Handlebars`，一个单纯的模板引擎。**hbs模板模板引擎语法**：`{{ ... }}`，**两个大括号**。模版文件内容很好理解，不过多解释。

> Handlebars 是 **JavaScript** 一个语义模板库，**通过对view和data的分离来快速构建Web模板**。它用"Logic-less template"（无逻辑模版）的思路，在**加载时被预编译**，而不是到了客户端执行到代码时再去编译， 这样可以保证模板加载和运行的速度。



#### constants.js.hbs



```handlebars
// 每个常量需要备注，说明作用 

// 容器初始化
export const COMPONENT_DID_MOUNT = 'app/{{ properCase name }}/COMPONENT_DID_MOUNT';
```



#### actions.js.hbs



```handlebars
import { COMPONENT_DID_MOUNT } from './constants';

export function componentDidMountAction() {
  return {
    type: COMPONENT_DID_MOUNT,
  };
}
```



#### reducer.js.hbs



```handlebars
import produce from 'immer';
import { COMPONENT_DID_MOUNT } from './constants';

export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const {{ camelCase name }}Reducer = (state = initialState, action) =>
	// eslint-disable-next-line no-unused-vars
  produce(state, draft => {
    switch (action.type) {
      case COMPONENT_DID_MOUNT:
        break;
    }
  });

export default {{ camelCase name }}Reducer;
```



#### selectors.js.hbs



```handlebars
import { createSelector } from 'reselect';
import { initialState } from './reducer';

const select{{ properCase name }}Domain = state => state.{{ camelCase name }} || initialState;

const makeSelect{{ properCase name }} = () => createSelector(select{{ properCase name }}Domain, subState => subState);

export default makeSelect{{ properCase name }};
export { select{{ properCase name }}Domain, makeSelect{{ properCase name }} };
```



#### loadable.js.hbs



```handlebars
import loadable from '../../utils/loadable';

export default loadable(() => import('./index'));
```



#### saga.js.hbs



```handlebars
import { take, takeLatest, put, select } from 'redux-saga/effects';
import { COMPONENT_DID_MOUNT } from './constants';

// 页面初始化
export function* componentDidMountSaga() {
  try {
    console.log('componentDidMountSaga');
  } catch (error) {
    console.log(error);
  }
}

export default function* {{ camelCase name }}Saga() {
  yield takeLatest(COMPONENT_DID_MOUNT, componentDidMountSaga)
}
```



#### mseeages.js.hbs



```handlebars
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.{{ properCase name }}';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the {{ properCase name }} container!',
  },
});
```



#### node.js.hbs



```handlebars
/*

import styled, { css } from 'styled-components'

const containerStyle = css`
  width: 100%;
`

const container = styled.div`${containerStyle}`

export default {

  container

}

*/
```



#### index.js.hbs



```handlebars
{{#if memo}}
import React, { memo, useEffect } from 'react';
{{else}}
import React from 'react';
{{/if}}
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
{{#if wantHeaders}}
import { Helmet } from 'react-helmet';
{{/if}}
{{#if wantMessages}}
import { FormattedMessage } from 'react-intl';
{{/if}}
{{#if wantActionsAndReducer}}
import { createStructuredSelector } from 'reselect';
{{/if}}
import { compose } from 'redux';

{{#if wantSaga}}
import { useInjectSaga } from 'utils/injectSaga';
{{/if}}
{{#if wantActionsAndReducer}}
import { useInjectReducer } from 'utils/injectReducer';
import makeSelect{{properCase name}} from './selectors';
import reducer from './reducer';
import { componentDidMountAction } from './actions';
{{/if}}
{{#if wantSaga}}
import saga from './saga';
{{/if}}
{{#if wantMessages}}
import messages from './messages';
{{/if}}

// import Nodes from './nodes';

export function {{ properCase name }}(props) {
  {{#if wantActionsAndReducer}}
  useInjectReducer({ key: '{{ camelCase name }}', reducer });
  {{/if}}
  {{#if wantSaga}}
  useInjectSaga({ key: '{{ camelCase name }}', saga });
  useEffect(() => {
    props.componentDidMountAction();
  }, []);
  {{/if}}

  return (
    <div>
    {{#if wantHeaders}}
      <Helmet>
        <title>{{properCase name}}</title>
        <meta name="description" content="Description of {{properCase name}}" />
      </Helmet>
    {{/if}}
    {{#if wantMessages}}
      <FormattedMessage {...messages.header} />
    {{/if}}
    </div>
  );
}

{{ properCase name }}.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

{{#if wantActionsAndReducer}}
const mapStateToProps = createStructuredSelector({
  {{ camelCase name }}: makeSelect{{properCase name}}(),
});
{{/if}}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    componentDidMountAction: () => dispatch(componentDidMountAction()),
  };
}

{{#if wantActionsAndReducer}}
const withConnect = connect(mapStateToProps, mapDispatchToProps);
{{else}}
const withConnect = connect(null, mapDispatchToProps);
{{/if}}

export default compose(
  withConnect,
{{#if memo}}
  memo,
{{/if}}
)({{ properCase name }});
```



### 组件构建



我们在`generators`文件下创建文件夹`component`，再创建`index.js`。构建方法与容器的相同这里不作解释。



```js
const componentExists = require('../utils/componentExists');

module.exports = {
  description: '添加一个组件',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: '组件名是什么？',
      default: 'Button',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value) ? '已经存在相同的容器名或者组件名' : true;
        }

        return '组件名为必填';
      },
    },
    {
      type: 'confirm',
      name: 'memo',
      default: true,
      message: '是否要将组件包装在React.memo中？',
    },
    {
      type: 'confirm',
      name: 'wantMessages',
      default: true,
      message: '组件是否需要国际化组件？',
    },
    {
      type: 'confirm',
      name: 'wantLoadable',
      default: true,
      message: '组件是否要异步加载？',
    },
  ],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: '../../app/components/{{properCase name}}/index.js',
        templateFile: './component/index.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../app/components/{{properCase name}}/nodes.js',
        templateFile: './container/nodes.js.hbs',
        abortOnFail: true,
      },
    ];

    if (data.wantMessages) {
      actions.push({
        type: 'add',
        path: '../../app/components/{{properCase name}}/messages.js',
        templateFile: './component/messages.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.wantLoadable) {
      actions.push({
        type: 'add',
        path: '../../app/components/{{properCase name}}/Loadable.js',
        templateFile: './container/loadable.js.hbs',
        abortOnFail: true,
      });
    }

    actions.push({
      type: 'prettify',
      path: '/components/',
    });

    return actions;
  },
};
```



如上面的代码所示，每个组件有四个文件需要创建，同样就对应4个模版：

- `loadable.js.hbs`  这个文件与容器的一样所以不需要再写模版。
- `mseeages.js.hbs` 
- `node.js.hbs`  这个文件与容器的一样所以不需要再写模版。
- `index.js.hbs` 



#### mseeages.js.hbs



```handlebars
import { defineMessages } from 'react-intl';

export const scope = 'app.components.{{ properCase name }}';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'This is the {{ properCase name }} component!',
  },
});
```



#### index.js.hbs



```js
{{#if memo}}
import React, { memo } from 'react';
{{else}}
import React from 'react';
{{/if}}
// import PropTypes from 'prop-types';

{{#if wantMessages}}
import { FormattedMessage } from 'react-intl';
import messages from './messages';
{{/if}}
import Nodes from './nodes';

function {{ properCase name }}() {
  return (
    <div>
    {{#if wantMessages}}
      <FormattedMessage {...messages.header} />
    {{/if}}
    </div>
  );
}

{{ properCase name }}.defaultProps = {};

{{ properCase name }}.propTypes = {};

{{#if memo}}
export default memo({{ properCase name }});
{{else}}
export default {{ properCase name }};
{{/if}}
```



### 添加语言



在之前的`/app/i18n.js`文件我们对项目的国际化做了配置，那么要添加一个语言也需要在这个文件内进行操作。因为是对已有文件进行修改，所以我们需要利用正则匹配文件中的位置，然后把模版中的语句添加进去。所以根据之前`i18n.js`文件，确定有几个地方需要添加的，然后确定需要以下文件模版：

- `intl-locale-data.hbs`

  ```handlebars
  $&const {{language}}LocaleData = require('react-intl/locale-data/{{language}}');
  ```

- `translation-messages.hbs`

  ```handlebars
  $1const {{language}}TranslationMessages = require('./translations/{{language}}.json');
  ```

- `add-locale-data.hbs`

  ```handlebars
  $1addLocaleData({{language}}LocaleData);
  ```

- `format-translation-messages.hbs`

  ```handlebars
  $1  {{language}}: formatTranslationMessages('{{language}}', {{language}}TranslationMessages),
  ```

- `translations-json.hbs`

  ```handlebars
  {}
  ```

- `polyfill-intl-locale.hbs`

  ```handlebars
  $1        import('intl/locale-data/jsonp/{{language}}.js'),
  ```



首先我们在`generators`文件下创建文件夹`language`，再创建`index.js`。



```js
const fs = require('fs');
const { exec } = require('child_process');
// 查看语言是否已经添加
function languageIsSupported(language) {
  try {
    fs.accessSync(`app/translations/${language}.json`, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  description: '添加一种语言',
  prompts: [
    {
      type: 'input',
      name: 'language',
      message: '您希望添加i18n支持的语言是什么（例如 "fr", "de"）？',
      default: 'en',
      validate: value => {
        if (/.+/.test(value) && value.length === 2) {
          return languageIsSupported(value) ? `已经支持语言 "${value}" 了` : true;
        }

        return '需要2个字符的语言说明符';
      },
    },
  ],

  actions: ({ test }) => {
    const actions = [];

    if (test) {
      // 备份将被修改的文件以便我们可以还原它们
      actions.push({
        type: 'backup',
        path: '../../app',
        file: 'i18n.js',
      });

      actions.push({
        type: 'backup',
        path: '../../app',
        file: 'app.js',
      });
    }

    actions.push({
      type: 'modify', // 在指定文件中执行修改操作
      path: '../../app/i18n.js',
      // 用于匹配应替换文本的正则表达式，会在最后一个匹配的后一行写入模版内容
      pattern: /(const ..LocaleData = require\('react-intl\/locale-data\/..'\);\n)+/g,
      templateFile: './language/intl-locale-data.hbs',
    });
    actions.push({
      type: 'modify',
      path: '../../app/i18n.js',
      pattern: /(\s+'[a-z]+',\n)(?!.*\s+'[a-z]+',)/g,
      templateFile: './language/app-locale.hbs',
    });
    actions.push({
      type: 'modify',
      path: '../../app/i18n.js',
      pattern:
        /(const ..TranslationMessages = require\('\.\/translations\/..\.json'\);\n)(?!const ..TranslationMessages = require\('\.\/translations\/..\.json'\);\n)/g,
      templateFile: './language/translation-messages.hbs',
    });
    actions.push({
      type: 'modify',
      path: '../../app/i18n.js',
      pattern: /(addLocaleData\([a-z]+LocaleData\);\n)(?!.*addLocaleData\([a-z]+LocaleData\);)/g,
      templateFile: './language/add-locale-data.hbs',
    });
    actions.push({
      type: 'modify',
      path: '../../app/i18n.js',
      pattern:
        /([a-z]+:\sformatTranslationMessages\('[a-z]+',\s[a-z]+TranslationMessages\),\n)(?!.*[a-z]+:\sformatTranslationMessages\('[a-z]+',\s[a-z]+TranslationMessages\),)/g,
      templateFile: './language/format-translation-messages.hbs',
    });
    actions.push({
      type: 'add',
      path: '../../app/translations/{{language}}.json',
      templateFile: './language/translations-json.hbs',
      abortOnFail: true,
    });
    actions.push({
      type: 'modify',
      path: '../../app/app.js',
      pattern:
        /(import\('intl\/locale-data\/jsonp\/[a-z]+\.js'\),\n)(?!.*import\('intl\/locale-data\/jsonp\/[a-z]+\.js'\),)/g,
      templateFile: './language/polyfill-intl-locale.hbs',
    });

    if (!test) {
      // 代码都添加好之后执行一次国际化信息的整合
      actions.push(() => {
        const cmd = 'npm run extract-intl';
        exec(cmd, (err, result) => {
          if (err) throw err;
          process.stdout.write(result);
        });
        return 'modify translation messages';
      });
    }

    return actions;
  },
};
```



### 添加模版构建指令



```json
"scripts": {
  "generate": "plop --plopfile internals/generators/index.js",
  "prettify": "prettier --write"
}
```



好了，到这里我们已经完成了模版构建，可以尝试`npm run generate`试试效果。



## 工程化总结



到这里为止，我们回顾一下工程化做了哪些工作：

- 初始化`package.json`

- 构建webpack脚手架

  - `html-webpack-plugin`

    生成一个 HTML5 文件， 在 body 中使用 `script` 标签引入你所有 webpack 生成的 bundle。

  - `loader`

    将匹配到的文件进行转换

  - `circular-dependency-plugin`

    在 webpack 打包时，检测循环依赖的模块。

  - `react-app-polyfill`

    包括各种浏览器的兼容。它包括`Create React App`项目使用的最低要求和常用语言特性。

  - `webpack-dev-middleware webpack-hot-middleware`

    编写自己的后端服务然后使用它，开发更灵活。
    
  - `offline-plugin`
  
    `offline-plugin`应用PWA技术，帮我们生成`service-worker.js`，sw的资源列表会记录我们项目资源文件。每次更新代码，通过更新sw文件版本号来通知客户端对所缓存的资源进行更新，否则就使用缓存文件。
  
  - `terser-webpack-plugin` 
  
    使用 `terser` 来压缩 JavaScript。
  
  - `compression-webpack-plugin`
  
    对文件进行Gzip压缩，提升网络传输速率，优化web页面加载时间。
  
- React全家桶

  - `react-helmet`

    React Helmet是一个HTML文档head管理工具，管理对文档头的所有更改。

  - `react-intl`

    国际化。

  - `redux-saga`

    使用saga来模块化处理异步业务。
    
  - `connected-react-router`
  
    在action中实现对路由的操作。
  
  - `history`
  
    在组件外跳转，用到react路由的history。
  
  - `prop-types`
  
    使用属性类型来记录传递给组件的属性的预期类型。运行时对props进行类型检查。
  
  - `resclect`
  
    Redux 的选择器库，可以提高使用redux数据的效率。
  
  - `immer`
  
    对`reducer`进行包装，让state中的数据不可更改，只能通过特定方法替换。
  
- antd组件库

  一个是在babel里面设置按需引入style文件，一个是`antd-theme-webpack-plugin`插件动态设置主题色。

- 其他插件

  主要一个`styled-components`用来分离页面中的样式，实现样式的JS化。其他的插件都主要用在辅助Node.js中。

- ESLint配置

  利用`prettier`和`eslint`的配合，引入一些常用配置插件，然后配置一些ESLint的规则。然后我们又通过ESLint的Node API来自定义执行ESLint时的输出。

- stylelint配置

  样式校验，引入`styled-components`的校验规则，配合当前项目。

- babel配置

  引入了很多转换的插件，用来兼容JS语法。

- 项目启动配置

  这里我们配置了两种环境热启动的方式，自定义了命令行传参，启动输出美化等等。

- 编写入口文件

  - Reducer

    项目的 Reducer 初始化模块。

  - i18n国际化

    从配置到国际化组件包裹项目，最后是国际化信息的整合方法。

  - 全局样式

  - App组件即项目根组件

  - 入口文件

- 编写npm指令

  生产环境和开发环境的几种启动方式，国际化以及ESLint校验等等。

- 项目的组件化与模块化

  - 组件化、模块化
  - 函数式编程
  - 路由
  - 容器
  - 组件

- 模版构建

  - 容器构建
  - 组件构建
  - 添加语言
  - 模版构建指令



## 说在后面



到这里，我要说的工程化已经全部说完了，不知道能看到这里的你是否对工程化有了自己的理解。其实不难看出，工程化就是把很多前端思想与理念实践于项目之中，还有很多方面的优化，让我们在开发和生产两种环境下都能够快速高效地开发。当然工程化的东西还有很多，比如：Jest测试、git操作的预检查等等。

摩天大楼不是一天盖成的，我文章中提到的所有也都是在更厉害的项目中提炼出来的，或许把里面的每一个点提出来可能都是很简单的东西，你可能会觉得这东西看一眼文档就能运用自如，但是我们缺的就是没有把它们都整合起来的能力。所以这篇文章就是给大家传递一种思想，让我们以后在自己建项的时候，能考虑到组件化、模块化等等以及多人开发的规范。

最后，咱们下篇文章见！


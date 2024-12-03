---
title: 一篇文章让你的网站拥有CDN级的访问速度，告别龟速个人服务器~
tags:
  - 方法论
createTime: 2023/10/31
permalink: /article/ggbw7lir/
---
通常来说，前端加快页面加载的手段无非是缩小文件、减少请求等几种常见的方式，但如果说页面加载慢的本质原因是因为没有CDN服务和服务器带宽限制这些非前端代码因素，那么前端代码再怎么优化，加载速度还是会差强人意。

最常见的就是我们在各大云平台白嫖的新人专享的服务器或者是那种配置很低的服务器，虽说能用，但是用个IP访问网站就算了，关键是还是很慢，一个1M的JS文件都能加载几秒钟。

关于彻底解决这个问题，我有一个一劳永逸的办法……

首先我们要明确的是，访问速度慢是因为服务器带宽限制以及没有CDN的支持，带宽限制就是从服务器获取资源的最大速度，CDN就是内容分发网络，简单理解就是你在世界上任意位置访问某个CDN资源，通过CDN服务就可以从离你最近的一台CDN服务器上获取资源，简单粗暴地优化远距离访问导致的物理延迟的问题。

### CDN前后对比

首先我们来看一个小网站直接部署在一个某云平台最基础的服务器上访问的速度：


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-169.png)
可以看到的是加载速度惨不忍睹，这还只是一个页面的网站，如果再大一点加上没有浏览器缓存的第一次访问，网站的响应速度应该随随便便破10秒。

接着我们再看看经过CDN加速的网站访问速度：

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-170.png)

可以看到的是速度有了极大的提升，而且我们访问的资源除了`index.html`，也就是上图中的第一行请求是直接访问我们自己的服务器获取的，其他都是走的CDN服务。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="http://static.admin.rainbowinpaper.cn/logo.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>纸上的彩虹-管理端</title>
    <script type="module" crossorigin src="http://static.admin.rainbowinpaper.cn/assets/index.f1217c6c.js"></script>
    <link rel="stylesheet" href="http://static.admin.rainbowinpaper.cn/assets/index.a5fafcaf.css">
  </head>
  <body>
    <div id="main-app"></div>
  </body>
</html>
```

首先我们访问的地址是：`admin.rainbowinpaper.cn`，而网站中所有资源的加载地址是：`static.admin.rainbowinpaper.cn`，所以后者就是一个映射到CDN服务的地址。

### 准备域名

在我们准备把自己的项目接入CDN之前我们首先要注册一个域名并且备案好，关于域名如何注册备案的问题，我这里不过多赘述，你可以去的买服务器的云平台搜索域名注册，随便买个几块钱一年的便宜域名，然后按照平台提示的备案流程完成后续操作，我这里从准备好域名说起。

有了域名后我们就可以先把自己用IP访问服务器改用域名访问，操作方法也很简单，就是在你所购买的平台的域名管理里面加一行解析：


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-171.png)

如图所示，类型为A，将域名指向ipv4地址，**注意打开解析域名必须要备案，不然会被屏蔽访问**。

现在试试直接用域名能不能访问到你的网站。

### 准备CDN

网上提供CDN服务的平台有很多，我这里以七牛云作为CDN服务平台，毕竟免费的CDN服务真的很香。

首先我们去七牛云注册一个账号，然后新建一个存储空间：

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-172.png)
然后绑定自定义域名：

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-173.png)

这里我们可以随便写一个二级域名，比如我们的域名是`rainbowinpaper.cn`，那我们的加速域名就可以填写`img.rainbowinpaper.cn`。

其他的保持默认，我们直接创建，当我们在七牛云新建域名的时候需要验证你对当前域名的所有权，所以需要按照七牛云的提示去管理你域名的平台加一条解析记录，这一条仅作为验证所有权，无实际作用，大致如下：

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-174.png)

当七牛云验证成功后，你需要再加一条域名的解析记录，就是解析你刚才在七牛云填写的加速域名：


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-175.png)

注意值那一行，是七牛云提供的CNAME。关于如何配置，七牛云也有[帮助文档](https://developer.qiniu.com/fusion/kb/1322/how-to-configure-cname-domain-name)可以查看，都很简单。

当我们配置好了再回七牛云域名管理就能看到如下的状态：

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-176.png)

现在我们可以去刚刚创建的空间里面上传一张图片，查看详情里面的链接是否能访问，如果访问到我们刚才上传的图片，就说明成功了。

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-177.png)

到此为止我们的准备工作都完成了，准备上代码！

### 自动化上传打包文件

前面我提到了，访问网站除了`index.html`是从服务器获取的其他文件都是从CDN服务器上获取的，其原理就是修改了项目打包时的`base`值（图中所示的是vite项目的配置，其他打包工具请自行兼容），让所有引入的静态文件指向CDN的加速域名，而不是从源服务器去获取。


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-178.png)

到这里指向变了，但是我们不可能每次更新项目都要手动上传打包文件到七牛云里面，所以我们需要写一个脚本自动将打包文件上传到七牛云。话不多说直接上代码：

```js
/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');
const chalk = require('chalk');

const { ak, sk, bucket } = {
    ak: '你的ak',
    sk: '你的sk',
    bucket: '你刚才创建的存储空间名',
  };

const mac = new qiniu.auth.digest.Mac(ak, sk);

const config = new qiniu.conf.Config();
// 你创建空间时选择的存储区域
config.zone = qiniu.zone.Zone_z2;
config.useCdnDomain = true;

const bucketManager = new qiniu.rs.BucketManager(mac, config);

/**
 * 上传文件方法
 * @param key 文件名
 * @param file 文件路径
 * @returns {Promise<unknown>}
 */
const doUpload = (key, file) => {
  console.log(chalk.blue(`正在上传：${file}`));
  const options = {
    scope: `${bucket}:${key}`,
  };
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);
  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, file, putExtra, (err, body, info) => {
      if (err) {
        reject(err);
      }
      if (info.statusCode === 200) {
        resolve(body);
      } else {
        reject(body);
      }
    });
  });
};

const getBucketFileList = (callback, marker, list = []) => {
  !marker && console.log(chalk.blue('正在获取空间文件列表'));
  const options = {
    limit: 100,
  };
  if (marker) {
    options.marker = marker;
  }
  bucketManager.listPrefix(bucket, options, (err, respBody, respInfo) => {
    if (err) {
      console.log(chalk.red(`获取空间文件列表出错 ×`));
      console.log(chalk.red(`错误信息：${JSON.stringify(err)}`));
      throw err;
    }
    if (respInfo.statusCode === 200) {
      // 如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
      // 指定options里面的marker为这个值
      const nextMarker = respBody.marker;
      const { items } = respBody;
      const newList = [...list, ...items];
      if (!nextMarker) {
        console.log(chalk.green(`获取空间文件列表成功 ✓`));
        console.log(chalk.blue(`需要清理${newList.length}个文件`));
        callback(newList);
      } else {
        getBucketFileList(callback, nextMarker, newList);
      }
    } else {
      console.log(chalk.yellow(`获取空间文件列表异常 状态码${respInfo.statusCode}`));
      console.log(chalk.yellow(`异常信息：${JSON.stringify(respBody)}`));
    }
  });
};

const clearBucketFile = () =>
  new Promise((resolve, reject) => {
    getBucketFileList(items => {
      if (!items.length) {
        resolve();
        return;
      }
      console.log(chalk.blue('正在清理空间文件'));
      const deleteOperations = [];
      // 每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
      items.forEach(item => {
        deleteOperations.push(qiniu.rs.deleteOp(bucket, item.key));
      });
      bucketManager.batch(deleteOperations, (err, respBody, respInfo) => {
        if (err) {
          console.log(chalk.red(`清理空间文件列表出错 ×`));
          console.log(chalk.red(`错误信息：${JSON.stringify(err)}`));
          reject();
        } else if (respInfo.statusCode >= 200 && respInfo.statusCode <= 299) {
          console.log(chalk.green(`清理空间文件成功 ✓`));
          resolve();
        } else {
          console.log(chalk.yellow(`获取空间文件列表异常 状态码${respInfo.deleteusCode}`));
          console.log(chalk.yellow(`异常信息：${JSON.stringify(respBody)}`));
          reject();
        }
      });
    });
  });

const publicPath = path.join(__dirname, '../../dist');

const uploadAll = async (dir, prefix) => {
  if (!prefix){
    console.log(chalk.blue('执行清理空间文件'));
    await clearBucketFile();
    console.log(chalk.blue('正在读取打包文件'));
  }
  const files = fs.readdirSync(dir);
  if (!prefix){
    console.log(chalk.green('读取成功 ✓'));
    console.log(chalk.blue('准备上传文件'));
  }
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const key = prefix ? `${prefix}/${file}` : file;
    if (fs.lstatSync(filePath).isDirectory()) {
      uploadAll(filePath, key);
    } else {
      doUpload(key, filePath)
        .then(() => {
          console.log(chalk.green(`文件${filePath}上传成功 ✓`));
        })
        .catch(err => {
          console.log(chalk.red(`文件${filePath}上传失败 ×`));
          console.log(chalk.red(`错误信息：${JSON.stringify(err)}`));
          console.log(chalk.blue(`再次尝试上传文件${filePath}`));
          doUpload(file, filePath)
            .then(() => {
              console.log(chalk.green(`文件${filePath}上传成功 ✓`));
            })
            .catch(err2 => {
              console.log(chalk.red(`文件${filePath}再次上传失败 ×`));
              console.log(chalk.red(`错误信息：${JSON.stringify(err2)}`));
              throw new Error(`文件${filePath}上传失败，本次自动化构建将被强制终止`);
            });
        });
    }
  });
};

uploadAll(publicPath).finally(() => {
  console.log(chalk.green(`上传操作执行完毕 ✓`));
  console.log(chalk.blue(`请等待确认所有文件上传成功`));
});

```

**代码逻辑就是获取存储空间所有文件后删除，然后获取本地打包文件后上传，这样存储空间的文件不会一直堆积，所以这个存储空间只能存放项目的静态文件。**

其中需要注意的是，需要在七牛云的秘钥管理中生成一对密钥写入代码中。

在`package.json`中写入上传指令：


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-179.png)

运行指令，打印日志如下：


![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-180.png)

这时候再到七牛云的空间看下看见文件是否已经存在，这时候再访问下网站，如果能正确加载网站，说明就大功告成了。

### 说在后面

我之前在做自动化部署的时候发现自己的网站总是访问的很慢，但又是因为不想花更多的钱买更好的服务器，所以就被迫去研究到底哪些方法可以立竿见影的让网站加快访问速度，于是就有了本文。

总而言之，实践是检验真理的唯一标准，网上关于加快网页加载的文章一大堆，不是说它们没用，只是我们都是在前人的经验上去直接照搬的，这样就缺少了自己实践成功的那种成就感，关于这些技术点的由来可能还是一知半解，所以看过别人的文章，不如自己亲自实验一番。

最后，如有问题欢迎评论区讨论。

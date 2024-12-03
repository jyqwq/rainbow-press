---
title: whatwg-fetch的业务封装
tags:
  - 工作
  - 方法论
createTime: 2021/10/11
permalink: /article/vplkynlh/
---
# whatwg-fetch的业务封装

```javascript
/**
 *  常用的请求方法
 *  支持 get post 类型
 *  文件等其他类型处理其他方法
 * @param apiUrl
 * @param method  'get' || 'post'
 * @param body  object
 * @param contentType 'json' || ''
 * @returns {Promise<Response | never>}
 */
const fetchApi = ( apiUrl, method, body, contentType ) => {

  if( process.env.NODE_ENV === 'development' ) {
    console.log('请求地址====================》', apiUrl);
    console.log('请求参数====================》', body);
  }
	// requestPath是公共的请求地址
  let url = requestPath + apiUrl ;
  // IE浏览器第一次发请求没有问题,再发送请求时，当参数一样时，浏览器会直接使用缓存数据. 导致页面 还是原来的页面，所以在请求时加上时间戳
  body.timeStamp = new Date().getTime();

  const fetchOptions = {}

  fetchOptions.method = method || 'get';
  fetchOptions.credentials = 'include';
  fetchOptions.mode = 'no-cors';

  if (fetchOptions.method === 'get') {
    url = getRequestBodyHandler(url, body)
  }

  if (fetchOptions.method === 'post') {
    // application/json
    if (contentType === 'json') {
      fetchOptions.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      //这里的配置是为了fetch处理跨域
      fetchOptions.mode = 'cors';
      fetchOptions.cache = 'force-cache';
      
      fetchOptions.body = fetchJsonBodyHandler(body)
    } else { // form data
      fetchOptions.body = postRequestBodyHandler(body)
    }
  }
  return fetch(url, fetchOptions)
    .then(checkServerStatus)
    .then(parseJSON)
    .then(checkServerDataStatus);

}
```

## 关于fetch请求跨域的说明和处理

CORS分为两种：

- 简单请求

  某些请求不会触发 CORS 预检请求。本文称这样的请求为“简单请求”。若请求满足所有下述条件，则该请求可视为“简单请求”：

  1. 使用下列方法之一： GET HEAD POST 
   2. Fetch 规范定义了对 CORS 安全的首部字段集合，不得人为设置该集合之外的其他首部字段。该集合为： Accept Accept-Language Content-Language Content-Type （需要注意额外的限制） DPR Downlink Save-Data Viewport-Width Width  
   3. Content-Type 的值属于下列之一： application/x-www-form-urlencoded multipart/form-data text/plain

- 带有preflight预请求的CORS

  带有preflight的CORS ，浏览器会先发出一个 OPTIONS请求，服务器在响应里写入是否允许该域名发起访问，在response的header里面加入了Access-Control-Allow-Origin,Access-Contral-Allow-Methods,Access-Contraol-Allow-Headers,Access-Control-Max-Age这几个字段。

**进行带有身份凭证的CORS 请求**

默认情况下的跨域请求都是不会把cookie发送给服务器的，在需要发送的情况下，如果是xhr，那么需要设置xhr.withCredentials = true,如果是采用fetch获取的话，那么需要在request里面设置 credentials:'include', 但是如果服务器在预请求的时候没返回Access-Control-Allow-Crenditials:true的话，那么在实际请求的时候，cookie是不会被发送给服务器端的，要特别注意对于简单的get请求，不会有预请求的过程，那么在实际请求的时候，如果服务器没有返回Access-Control-Allow-Crenditials:true的话 那么响应结果浏览器也不会交给请求者。

关于fetch跨域说明的来源地址：https://blog.csdn.net/danzhang1010/article/details/72898691

**实际遇到的问题**

后台后个接口规定只接收post请求，那么带预请求的fetch请求就会返回405。为了处理这种情况需要在代码中加入如下配置：

```javascript
fetchOptions.mode = 'cors';
fetchOptions.cache = 'force-cache';
```

## 其他辅助方法

```javascript
/**
 * get 请求的情况下
 * 将 json 请求参数 添加到 url 上
 * @param url
 * @param ob
 * @returns {*}
 */
const getRequestBodyHandler = function (url, ob) {

  if (ob) {

    let param = ''

    Object.keys(ob).forEach((key, value) => {
      param ? (param += '&') : (param += '?')
      param += (key + '=' + ob[key])
    })

    return url + param
  }

  return url

}
```

```javascript
/**
 * post请求时
 * 将 json 请求参数 转化为 formData body
 * @param ob
 * @returns {*}
 */
const postRequestBodyHandler = function (ob) {

  if (ob) {

    const body = new FormData()

    Object.keys(ob).forEach((key) => {
      body.append(key, ob[key])
    })

    return body
  }

  return null

}
```

```javascript
const fetchJsonBodyHandler = function (ob) {
  return typeof ob === 'object' ? JSON.stringify(ob) : ob
}
```

```javascript
/**
 * 接口数据  状态验证
 * @param data
 * @returns {*}
 */
const checkServerDataStatus = (data) => {

  if( process.env.NODE_ENV === 'development' ){
    console.log('请求返回数据====================》', data)
  }
  // 成功返回
  if ( data && (data.status === 200 || data.state === 0)) {
    return data.data ;
  }

  // 错误处理
  const errorInfoMap = {
    99999 :{
      type: 'dataException',
      msg: '数据异常'
    },
    100000: {
      type: 'unknown',
      msg: '未知的异常'
    },
    500 : {
      type: 'exception',
      msg: '接口异常'
    },
    501 : {
      type: 'exception',
      msg: '接口异常'
    },
    502 : {
      type: 'exception',
      msg: '接口异常'
    },
    503 : {
      type: 'exception',
      msg: '接口异常'
    },
    401 : {
      type: 'noPrmission',
      msg: '没有访问权限'
    },
    403: {
      type: 'refuse',
      msg: '接口拒绝访问'
    },
    404: {
      type: 'notFound',
      msg: '接口链接不存在'
    }
  }

  // 错误信息
  let errorInfo = {
    type: 'unknown',
    msg: '未知的异常'
  }

  // 错误对象
  const error = new Error();

  // 数据格式异常
  if( !data || !data.status ){
    Object.assign( error, errorInfo, errorInfoMap[99999] );
    throw error;
  }

  // 根据code捕获的错误
  let extraErrorInfo = errorInfoMap[ data.status ];
  if( extraErrorInfo ){
    Object.assign( error, errorInfo, extraErrorInfo );
    throw error;
  }

  // 未知错误
  throw error

}
```

```javascript
/**
 * 服务器请求 状态验证
 * @param data
 * @returns {*}
 */
const checkServerStatus = (response) => {
  // 请求接受成功
  if (response.status >= 200 && response.status < 300) {

    return response

  } else {

    // 错误处理
    const errorInfoMap = {
      100000: {
        type: 'serverUnknown',
        msg: 'server: 未知的异常'
      },
      502 : {
        type: 'serverMaintainace',
        msg: 'server: 服务器正在维护'
      },
      404 : {
        type: 'serverException',
        msg: 'server: 访问地址不存在'
      }
    }

    // 错误信息
    let errorInfo = {
      type: 'serverUnknown',
      msg: 'server: 未知的异常'
    }

    // 错误对象
    const error = new Error();

    // 根据code捕获的错误
    let extraErrorInfo = errorInfoMap[ response.status ];
    if( extraErrorInfo ){
      Object.assign( error, errorInfo, extraErrorInfo );
      throw error;
    }

    // 未知错误
    throw error

  }

}
```

```javascript
// json  转换
const parseJSON = (response) => {
  //response.text()获得文本类型的
  //response.json()会帮助你运行一次JSON.parse(response.text())
  return response.json()
}
```


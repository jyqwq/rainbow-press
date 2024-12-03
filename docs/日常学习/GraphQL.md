---
title: GraphQL
tags:
  - 工具
  - 待续
createTime: 2023/10/31
permalink: /article/wpn2lczc/
---
# GraphQL



我们前端在使用 RESTFul 形式请求后端接口数据的时候，会有下面这些问题：

- 后端返回的数据过多，前端只用到其中一部分。
- 后端返回的数据过少，前端需要发送多个请求到不同的 API 来组合数据。
- 后端 API 分散，不方便统一管理数据。
- 前后端工程师需要反复沟通 API 接口的数据结构。



## 为什么用 GraphQL



GraphQL 则解决了这些问题，它是一种新的 API 查询语言，使用 GraphQL，前端可以：

- 自己决定需要哪些数据。
- 只发送一次请求就能获得所有数据。
- 集中提供 API ，只有一个 API 接口。
- 前后端基本独立，后端的改动几乎不影响前端接口。

GraphQL 同时也是后端数据提供方，数据来源可以是数据库、现有 RESTful API、文件等。



## GraphQL 结构



GraphQL 的结构和 JavaScript 的对象结构类似：

- 数据是按类型组织的，例如博客类型，包含博客标题、内容等。
- 类型中的每个属性都是强类型的，可以是 String 字符串、Int 整数、Float 浮点数，Boolean 布尔、ID 类型、数组、或者其它的自定义类型。
- 类型之间的关系是通过嵌套来实现的，例如有博客和评论两种类型，一个博客可以有多个评论，那么就在博客类型中用一个评论类型的数组来表示这样的关系。
- 多个类型组成了一个图状的结构，可以从一个类型找到它所有关联的类型，以及关联类型的关联类型，以此类推，不过有可能到某个类型的时候，又关联回了起始类型，形成了一个环，这在 GraphQL 中是允许的。



## GraphQL 查询



再来看 GraphQL 查询数据的方法。GraphQL 服务都会内置一个网页版的查询工具，可以测试 GraphQL 语句。我们还能方便的看到有哪些类型，类型里有哪些属性，关联类型的属性等：

![GraphQL 查询](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-168.png)

要查询类型中的数据，只需要在一对大括号里写上要查询的类型名，然后再用一对大括号，里边写上要查询的属性：

```graphql
{
  blogs {
    id
    title
    content
  }
}
```



如果这个属性是一个其它类型，或者由其它类型构成的数组类型，那么还需要写上要查询它里边的哪些属性，同样使用一对大括号：

```graphql
{
  blogs {
    id
    title
    content
    comments {
      id
      comment
    }
  }
}
```



如果后端 GraphQL 支持参数，用于查询符合条件的数据，这种情况下，需要使用 query 关键子定义查询的名字，然后再给支持参数的属性传递参数：

```graphql
query FirstBlog {
  blog(id: "1") {
    title
    content
  }
}
```



实际业务场景：

线路车列表页查询

```
{
  list (query: {endCity: "巴中", endCityId: 1327, startCity: "成都", startCityId: 1328}) {
          cascadeList {
            arrStation
            dptStation
          }
          groupList {
            minPrice
            tabCode
            tabName
          }
        }
}
```

```
{
  list (query: {departDate: "2022-09-28"}) {
          groupList {
						scheduleList {
                arrStation
                dptStation
                dptDate
                dptTime
                showCoachType
                totalPrice
            }
          }
        }
}
```


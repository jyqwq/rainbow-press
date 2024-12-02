---
title: Django快速入门
tags:
  - 笔记
  - 学习
  - Django
createTime: 2021/10/11
permalink: /article/1xtlizdh/
---
# Django

## 基础指令

- 版本

  ```shell
  python -m django --version
  ```

- 创建项目

  ```shell
  django-admin startproject mysite
  ```

  创建的目录结构如下

  ```
  mysite/
      manage.py
      mysite/
          __init__.py
          settings.py
          urls.py
          wsgi.py
  ```

  这些目录和文件的用处是：

  - 最外层的:file: mysite/ 根目录只是你项目的容器， Django 不关心它的名字，你可以将它重命名为任何你喜欢的名字。
  - `manage.py`: 一个让你用各种方式管理 Django 项目的命令行工具。
  - 里面一层的 `mysite/` 目录包含你的项目，它是一个纯 Python 包。
  - `mysite/__init__.py`：一个空文件，告诉 Python 这个目录应该被认为是一个 Python 包。
  - `mysite/settings.py`：Django 项目的配置文件。
  - `mysite/urls.py`：Django 项目的 URL 声明，就像你网站的“目录”。
  - `mysite/wsgi.py`：作为你的项目的运行在 WSGI 兼容的Web服务器上的入口。

- 运行

  ```shell
  python manage.py runserver
  ```

  **更换端口**

  默认情况下，`runserver`命令会将服务器设置为监听本机内部 IP 的 8000 端口。

  如果你想更换服务器的监听端口，请使用命令行参数。举个例子，下面的命令会使服务器监听 8080 端口：

  ```
  $ python manage.py runserver 8080
  ```

  如果你想要修改服务器监听的IP，在端口之前输入新的。比如，为了监听所有服务器的公开IP（这你运行 Vagrant 或想要向网络上的其它电脑展示你的成果时很有用），使用：

  ```
  $ python manage.py runserver 0:8000
  ```

  **0** 是 **0.0.0.0** 的简写。

  > 会自动重新加载的服务器 `runserver`
  >
  > 用于开发的服务器在需要的情况下会对每一次的访问请求重新载入一遍 Python 代码。所以你不需要为了让修改的代码生效而频繁的重新启动服务器。然而，一些动作，比如添加新文件，将不会触发自动重新加载，这时你得自己手动重启服务器。

- 创建一个模块

  ```shell
  $ python manage.py startapp polls
  ```

  这将会创建一个 `polls` 目录，它的目录结构大致如下：

  ```
  polls/
      __init__.py
      admin.py
      apps.py
      migrations/
          __init__.py
      models.py
      tests.py
      views.py
  ```

  在 `polls/urls.py` 中，输入如下代码：

  > polls/urls.py

  ```python
  from django.urls import path
  
  from . import views
  
  urlpatterns = [
      path('', views.index, name='index'),
  ]
  ```

  下一步是要在根 URLconf 文件中指定我们创建的 `polls.urls` 模块。在 `mysite/urls.py` 文件的 `urlpatterns` 列表里插入一个 `include()`， 如下：

  > mysite/urls.py

  ```python
  from django.contrib import admin
  from django.urls import include, path
  
  urlpatterns = [
      path('polls/', include('polls.urls')),
      path('admin/', admin.site.urls),
  ]
  ```
  
- 应用数据库迁移

  ```shell
  $ python manage.py migrate
  ```

  这个 `migrate` 命令检查 `INSTALLED_APPS`设置，为其中的每个应用创建需要的数据表，至于具体会创建什么，这取决于你的 `mysite/settings.py` 设置文件和每个应用的数据库迁移文件。这个命令所执行的每个迁移操作都会在终端中显示出来。

- 为模型的改变生成迁移文件

  ```shell
  $ python manage.py makemigrations
  ```

  通过运行 `makemigrations` 命令，Django 会检测你对模型文件的修改（在这种情况下，你已经取得了新的），并且把修改的部分储存为一次 *迁移*。

  迁移是 Django 对于模型定义（也就是你的数据库结构）的变化的储存形式 。模型的迁移数据被储存在 `模块目录/migrations/0001_initial.py` 里。

- 交互式命令行

  ```shell
  $ python manage.py shell
  ```

- 创建管理员账号

  ```shell
  $ python manage.py createsuperuser
  ```

  创建完成使用`runserver`启动服务器，可以在 http://127.0.0.1:8000/admin/ 下看见管理站点登录页面。



## 配置文件

打开 `mysite/settings.py` 。这是个包含了 Django 项目设置的 Python 模块。

### 数据库配置

通常，配置文件使用 SQLite 作为默认数据库。

如果你想使用其他数据库，你需要安装合适的 database bindings ，然后改变设置文件中 `DATABASES` `'default'` 项目中的一些键值：

- ENGINE

  可选值有 `'django.db.backends.sqlite3'`，`'django.db.backends.postgresql'`，`'django.db.backends.mysql'`，或 `'django.db.backends.oracle'`等其他可用后端。

- NAME

  数据库的名称。如果使用的是 SQLite，数据库将是你电脑上的一个文件，在这种情况下， `NAME`应该是此文件的绝对路径，包括文件名。默认值 `os.path.join(BASE_DIR, 'db.sqlite3')` 将会把数据库文件储存在项目的根目录。

  如果你不使用 SQLite，则必须添加一些额外设置，比如 `USER`、 `PASSWORD` 、 `HOST`等等。

- USER

  数据库用户名

- PASSWORD

  数据库密码

- HOST

  数据库端口



### 项目模块配置

配置文件头部的 `INSTALLED_APPS`设置项。这里包括了会在你项目中启用的所有 Django 应用。应用能在多个项目中使用，你也可以打包并且发布应用，让别人使用它们。



通常， `INSTALLED_APPS` 默认包括了以下 Django 的自带应用：

- `django.contrib.admin`-- 管理员站点。
- `django.contrib.auth` -- 认证授权系统。
- `django.contrib.contenttypes` -- 内容类型框架。
- `django.contrib.sessions`-- 会话框架。
- `django.contrib.messages`-- 消息框架。
- `django.contrib.staticfiles` -- 管理静态文件的框架。

这些应用被默认启用是为了给常规项目提供方便。



每当使用`python manage.py startapp new-model`创建新的模块后需要在这里添加新的模块。

例如：polls模块

```
'polls.apps.PollsConfig'
```



## 常用方法

### django.urls/include()

函数 `include()`允许引用其它 URLconfs。每当 Django 遇到 :func：~django.urls.include 时，它会截断与此项匹配的 URL 的部分，并将剩余的字符串发送到 URLconf 以供进一步处理。

 `include()` 的设计理念是使其可以即插即用。因为每个模块有它自己的 URLconf( `polls/urls.py` )，他们能够被放在 "/polls/" ， "/fun_polls/" ，"/content/polls/"，或者其他任何路径下，这个应用都能够正常工作。

> 何时使用 `include()`
>
> 当包括其它 URL 模式时你应该总是使用 `include()` ， `admin.site.urls` 是唯一例外。



### django.urls/path()

函数 `path()`具有四个参数，两个必须参数：`route` 和 `view`，两个可选参数：`kwargs` 和 `name`。

- route

  `route` 是一个匹配 URL 的准则（类似正则表达式）。当 Django 响应一个请求时，它会从 `urlpatterns` 的第一项开始，按顺序依次匹配列表中的项，直到找到匹配的项。

- view

  当 Django 找到了一个匹配的准则，就会调用这个特定的视图函数，并传入一个 `HttpRequest`对象作为第一个参数，被“捕获”的参数以关键字参数的形式传入。

- kwargs
  任意个关键字参数可以作为一个字典传递给目标视图函数。

- name

  为你的 URL 取名能使你在 Django 的任意地方唯一地引用它，尤其是在模板中。这个有用的特性允许你只改一个文件就能全局地修改某个 URL 模式。



## 模型和数据库

模型准确且唯一的描述了数据。它包含您储存的数据的重要字段和行为。一般来说，每一个模型都映射一张数据库表。

### 模型

- 每个模型都是一个 Python 的类，这些类继承 `django.db.models.Model`
- 模型类的每个属性都相当于一个数据库的字段。
- 利用这些，Django 提供了一个自动生成访问数据库的 API。



定义一个 `Person` 模型，拥有 `first_name` 和 `last_name`:

```python
from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
```

`first_name` 和 `last_name` 是模型的字段。每个字段都被指定为一个类属性，并且每个属性映射为一个数据库列。



- **使用模型**

  一旦定义了模型，使用则需要修改设置文件中的 `INSTALLED_APPS` ，在这个设置中添加包含 `models.py` 文件的模块名称。

  例如，若模型位于项目中的 `myapp.models` 模块（ 此包结构由 `manage.py startapp`命令创建）， `INSTALLED_APPS`应设置如下：

  ```python
  INSTALLED_APPS = [
      #...
      'myapp',
      #...
  ]
  ```

  当你向 `INSTALLED_APPS`添加新的应用的时候，请务必运行 `manage.py migrate`，此外你也可以先使用以下命令进行迁移 `manage.py makemigrations`。

- **字段**

  模型中最重要且唯一必要的是数据库的字段定义。字段在类属性中定义。定义字段名时应小心避免使用与模型 API冲突的名称， 如 `clean`, `save`, or `delete` 等。

  ```python
  from django.db import models
  
  class Musician(models.Model):
      first_name = models.CharField(max_length=50)
      last_name = models.CharField(max_length=50)
      instrument = models.CharField(max_length=100)
  
  class Album(models.Model):
      artist = models.ForeignKey(Musician, on_delete=models.CASCADE)
      name = models.CharField(max_length=100)
      release_date = models.DateField()
      num_stars = models.IntegerField()
  ```

- **字段类型**

  模型中每一个字段都应该是某个 `Field` 类的实例， Django 利用这些字段类来实现以下功能：

  - 字段类型用以指定数据库数据类型（如：`INTEGER`, `VARCHAR`, `TEXT`）。
  - 在渲染表单字段时默认使用的 HTML 视图(如： `<input type="text">`, `<select>`)。
  - 基本的有效性验证功能，用于 Django 后台和自动生成的表单。

  |    字段类型     | 用法                                       | 介绍                                                         |
  | :-------------: | :----------------------------------------- | ------------------------------------------------------------ |
  |    AutoField    | class AutoField(options)                   | 一个 `IntegerField`，根据可用的 ID 自动递增。你通常不需要直接使用它；如果你没有指定，主键字段会自动添加到你的模型中。 |
  |  BigAutoField   | class BigAutoField(options)                | 一个 64 位整数，与 `AutoField`很相似，但保证适合 `1` 到 `9223372036854775807` 的数字。 |
  | BigIntegerField | class BigIntegerField(options)             | 一个 64 位的整数，和 `IntegerField` 很像，只是它保证适合从 `-9223372036854775808` 到 `9223372036854775807` 的数字。 |
  |   BinaryField   | class BinaryField(max_length=None,options) | 一个用于存储原始二进制数据的字段。可以指定为 `bytes`、`bytearray`或 `memoryview`。 |
  |  BooleanField   | class BooleanField(option)                 | 一个 true／false 字段。                                      |
  |    CharField    | class CharField(max_length=None,option)    | 一个字符串字段，适用于小到大的字符串。                       |
  
  

## 数据操作

### 存储

```python
save()
```

### 查询

```python
objects.all() # 查所有
objects.get(pk=xx) # 查单个
```

### 更新

```python
# 基于查询的 查好对象，修改属性然后
save()
```

### 删除

```python
# 基于查询的
delete()
```


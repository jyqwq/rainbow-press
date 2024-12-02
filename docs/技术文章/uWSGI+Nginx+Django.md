---
title: uWSGI+Nginx+Django
tags:
  - Django
  - nginx
createTime: 2021/10/11
permalink: /article/fs05zbud/
---
# uWSGI+Nginx+Django

## 为什么需要Nginx

Django有个runserver直接起了一个WebServer，为什么还要nginx起一个WebServer？

- 可能是线上需要统一使用nginx
- nginx性能比Django自带的WebServer好
- 因为nginx具备优秀的静态内容处理能力，然后将动态内容转发给uWSGI服务器，这样可以达到很好的客户端响应。（动静分离！）

## 什么是WSGI

- WSGI，全称Web Server Gateway Interface，是为Python语言定义的Web服务器和Web应用程序或框架之间的一种简单而通用的接口。
- 简而言之就是，标准
- 很多框架都自带了WSGI server，比如Flask、webpy、Django、CherryPy等等。当然性能都不好，自带的多是测试用途，发布时则使用生产环境的WSGI server或者是联合nginx做uwsgi

![image-20210617124232919](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-16.png)

## uWSGI概念

- WSGI是一种Web服务器网关接口。它是一个Web服务器（如nginx）与应用服务器（如uWSGI服务器）通信的一种规范。
- uWSGI是一个Web服务器，它实现了WSGI协议、uwsgi、http等协议。Nginx中HttpUwsgiModule的作用是与uWSGI服务器进行交换。
- 要注意WSGI/uWSGI/uwsgi这三个概念的区分。
  - WSGI是一种通信协议（如上图中的WSGI）
  - uwsgi同WSGI是一种通信协议（如上图中的WSGI）
  - 而uWSGI是实现了uwsgi和WSGI两种协议的Web服务器（如上图中的Server）

![image-20210618151004823](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-17.png)

## uWSGI.ini

```ini
[uwsgi]
#项目目录
chdir=/opt/project/teacher/
#启动uwsgi的用户名和用户组
uid=root
gid=root
#指定项目的application
module=teacher.wsgi:application
#指定sock的文件路径
socket=/opt/project/script/uwsgi.sock
#启用主进程
master=true
#进程个数
workers=3
pidfile=/opt/project/script/uwsgi.pid
#当服务停止时自动移除unix Socket和pid文件
vacuum=true
#序列化接受的内容
thunder-lock=true
#启用线程
enable-threads=true
#设置自中断时间
harakiri=30
#设置缓冲
post-buffering=1024
#设置日志目录
daemonize=/opt/project/script/uwsgi.log
```

### 启动

```bash
$ uwsgi --ini uwsgi.ini
```

### 关闭

```bash
$ $ uwsgi --stop uwsgi.pid
```

## Nginx.conf

```conf
server {
        listen  80;
        server_name  django.rainbowinpaper.com;
        access_log  /var/log/nginx/access.log main;
        charset utf-8;


        location / {
            include uwsgi_params;
            uwsgi_connect_timeout 30;
            uwsgi_pass unix:/opt/project/script/uwsgi.sock;
        }

        location /static/ {
                alias   /opt/project/teacher/static_all/;
                index   index.html index.htm;
            }
    }
```

## Django setting

第一步需要在settings.py文件里面加入：

```python
import os

# 定义静态文件目录
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)
# 添加默认的静态文件目录[收集使用]
STATIC_ROOT = os.path.join(BASE_DIR, "static_all")
```

然后执行：

```bash
$ python manage.py collectstatic --noinput
```


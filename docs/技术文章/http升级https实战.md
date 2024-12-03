---
title: http升级https实战
tags:
  - 方法论
  - 待续
createTime: 2023/12/17
permalink: /article/f7eqdzf6/
---
## http升级https实战



`FreeSSL.cn` 上创建账号，获取ACME地址。

添加域名：`rainbowinpaper.cn`、`*.rainbowinpaper.cn`。

进入服务器，因为项目架构是docker的centos容器，所以需要进到容器中操作：



`nginx` 配置加上如下配置：

```nginx
server {
	listen 80;
	server_name    *.rainbowinpaper.cn;
    listen       443 ssl http2 default_server;
    listen       [::]:443 ssl http2 default_server;
    ssl_certificate /root/.acme.sh/admin.rainbowinpaper.cn_ecc/admin.rainbowinpaper.cn.cer;
    ssl_certificate_key /root/.acme.sh/admin.rainbowinpaper.cn_ecc/admin.rainbowinpaper.cn.key;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;
	location ^~ /.well-known/acme-challenge/ {
		proxy_pass https://acme-http-proxy.certcloud.cn/http-challenge/my-token/;
	}
}
```



在容器中进行如下操作，以安装`acme.sh`：

```bash
yum install -y cronie
yum install -y curl
curl https://get.acme.sh | sh
source ~/.bashrc
acme.sh --issue -d admin.rainbowinpaper.cn  --dns dns_dp --server https://acme.freessl.cn/v2/DV90/directory/my-token
mkdir /etc/nginx/ssl
openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
acme.sh  --installcert  -d *.rainbowinpaper.cn --key-file /root/.acme.sh/admin.rainbowinpaper.cn_ecc/admin.rainbowinpaper.cn.key --fullchain-file /root/.acme.sh/admin.rainbowinpaper.cn_ecc/fullchain.cer --reloadcmd "nginx -s reload"
```



实测`admin.rainbowinpaper.cn`已经可以用`https`访问，但是还有如下问题没有解决：

- 服务器部署方式为docker容器，每次部署容器会被删除重建，所以`nginx`和`acme.sh `环境会被重置，需要重新写一个镜像去专门配置`nginx`和`acme.sh`环境，然后通过这个容器去转发请求
- 证书是有有效期的，目前没有验证证书过期后会出现什么问题
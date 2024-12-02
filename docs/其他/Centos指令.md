---
title: Centos指令
tags:
  - 笔记
  - 指令
createTime: 2021/10/11
permalink: /article/lgka6qju/
---
# Centos指令

## 系统指令

### 查看防火墙所有开放端口

  ```bash
  firewall-cmd --zone=public --list-ports
  ```

### 开放端口

  ```bash
  firewall-cmd --zone=public --add-port=5672/tcp --permanent   # 开放5672端口
  
  firewall-cmd --zone=public --remove-port=5672/tcp --permanent  #关闭5672端口
  
  firewall-cmd --reload   # 配置立即生效
  ```

### 查看监听端口

  ```bash
  netstat -lnpt
  ```

### 关闭防火墙

  ```bash
  systemctl stop firewalld.service
  ```

### 查看防火墙状态

  ```bash
  firewall-cmd --state
  ```

### 检查端口被哪个进程占用

   ```bash
  netstat -lnpt |grep 5672
   ```

### 查看进程的详细信息

  ```bash
  ps 6832
  ```

### 中止进程

  ```bash
  kill -9 6832
  ```

## 文件与目录操作

| 命令                    | 解析                                                         |
| :---------------------- | :----------------------------------------------------------- |
| cd /home                | 进入 ‘/home’ 目录                                            |
| cd ..                   | 返回上一级目录                                               |
| cd ../..                | 返回上两级目录                                               |
| cd -                    | 返回上次所在目录                                             |
| cp file1 file2          | 将file1复制为file2                                           |
| cp -a dir1 dir2         | 复制一个目录                                                 |
| cp -a /tmp/dir1 .       | 复制一个目录到当前工作目录（.代表当前目录）                  |
| ls                      | 查看目录中的文件                                             |
| ls -a                   | 显示隐藏文件                                                 |
| ls -l                   | 显示详细信息                                                 |
| ls -lrt                 | 按时间显示文件（l表示详细列表，r表示反向排序，t表示按时间排序） |
| pwd                     | 显示工作路径                                                 |
| mkdir dir1              | 创建 ‘dir1’ 目录                                             |
| mkdir dir1 dir2         | 同时创建两个目录                                             |
| mkdir -p /tmp/dir1/dir2 | 创建一个目录树                                               |
| mv dir1 dir2            | 移动/重命名一个目录                                          |
| rm -f file1             | 删除 ‘file1’                                                 |
| rm -rf dir1             | 删除 ‘dir1’ 目录及其子目录内容                               |

## 查看文件内容

| 命令          | 解析                                 |
| :------------ | :----------------------------------- |
| cat file1     | 从第一个字节开始正向查看文件的内容   |
| head -2 file1 | 查看一个文件的前两行                 |
| more file1    | 查看一个长文件的内容                 |
| tac file1     | 从最后一行开始反向查看一个文件的内容 |
| tail -3 file1 | 查看一个文件的最后三行               |
| vi file       | 打开并浏览文件                       |

## 文本内容处理

| 命令                 | 解析                                       |
| :------------------- | :----------------------------------------- |
| grep str /tmp/test   | 在文件 ‘/tmp/test’ 中查找 “str”            |
| grep ^str /tmp/test  | 在文件 ‘/tmp/test’ 中查找以 “str” 开始的行 |
| grep [0-9] /tmp/test | 查找 ‘/tmp/test’ 文件中所有包含数字的行    |
| grep str -r /tmp/*   | 在目录 ‘/tmp’ 及其子目录中查找 “str”       |
| diff file1 file2     | 找出两个文件的不同处                       |
| sdiff file1 file2    | 以对比的方式显示两个文件的不同             |
| vi file              | 详情如下表                                 |

| 操作 | 解析                 |
| :--- | :------------------- |
| i    | 进入编辑文本模式     |
| Esc  | 退出编辑文本模式     |
| :w   | 保存当前修改         |
| :q   | 不保存退出vi         |
| :wq  | 保存当前修改并退出vi |

## 查询操作

| 命令                                             | 解析                                             |
| :----------------------------------------------- | :----------------------------------------------- |
| find / -name file1                               | 从 ‘/’ 开始进入根文件系统查找文件和目录          |
| find / -user user1                               | 查找属于用户 ‘user1’ 的文件和目录                |
| find /home/user1 -name *.bin                     | 在目录 ‘/ home/user1’ 中查找以 ‘.bin’ 结尾的文件 |
| find /usr/bin -type f -atime +100                | 查找在过去100天内未被使用过的执行文件            |
| find /usr/bin -type f -mtime -10                 | 查找在10天内被创建或者修改过的文件               |
| locate *.ps                                      | 寻找以 ‘.ps’ 结尾的文件，先运行 ‘updatedb’ 命令  |
| find -name ‘*.[ch]’ \| xargs grep -E ‘expr’      | 在当前目录及其子目录所有.c和.h文件中查找 ‘expr’  |
| find -type f -print0 \| xargs -r0 grep -F ‘expr’ | 在当前目录及其子目录的常规文件中查找 ‘expr’      |
| find -maxdepth 1 -type f \| xargs grep -F ‘expr’ | 在当前目录中查找 ‘expr’                          |

## 压缩、解压

| 命令                            | 解析                                                         |
| :------------------------------ | :----------------------------------------------------------- |
| bzip2 file1                     | 压缩 file1                                                   |
| bunzip2 file1.bz2               | 解压 file1.bz2                                               |
| gzip file1                      | 压缩 file1                                                   |
| gzip -9 file1                   | 最大程度压缩 file1                                           |
| gunzip file1.gz                 | 解压 file1.gz                                                |
| tar -cvf archive.tar file1      | 把file1打包成 archive.tar（-c: 建立压缩档案；-v: 显示所有过程；-f: 使用档案名字，是必须的，是最后一个参数） |
| tar -cvf archive.tar file1 dir1 | 把 file1，dir1 打包成 archive.tar                            |
| tar -tf archive.tar             | 显示一个包中的内容                                           |
| tar -xvf archive.tar            | 释放一个包                                                   |
| tar -xvf archive.tar -C /tmp    | 把压缩包释放到 /tmp目录下                                    |
| zip file1.zip file1             | 创建一个zip格式的压缩包                                      |
| zip -r file1.zip file1 dir1     | 把文件和目录压缩成一个zip格式的压缩包                        |
| unzip file1.zip                 | 解压一个zip格式的压缩包到当前目录                            |
| unzip test.zip -d /tmp/         | 解压一个zip格式的压缩包到 /tmp 目录                          |

## yum安装器

| 命令                           | 解析                                                |
| :----------------------------- | :-------------------------------------------------- |
| yum -y install [package]       | 下载并安装一个rpm包                                 |
| yum localinstall [package.rpm] | 安装一个rpm包，使用你自己的软件仓库解决所有依赖关系 |
| yum -y update                  | 更新当前系统中安装的所有rpm包                       |
| yum update [package]           | 更新一个rpm包                                       |
| yum remove [package]           | 删除一个rpm包                                       |
| yum list                       | 列出当前系统中安装的所有包                          |
| yum search [package]           | 在rpm仓库中搜寻软件包                               |
| yum clean [package]            | 清除缓存目录（/var/cache/yum）下的软件包            |
| yum clean headers              | 删除所有头文件                                      |
| yum clean all                  | 删除所有缓存的包和头文件                            |

### 网络相关

| 命令                                            | 解析                        |
| :---------------------------------------------- | :-------------------------- |
| ifconfig eth0                                   | 显示一个以太网卡的配置      |
| ifconfig eth0 192.168.1.1 netmask 255.255.255.0 | 配置网卡的IP地址            |
| ifdown eth0                                     | 禁用 ‘eth0’ 网络设备        |
| ifup eth0                                       | 启用 ‘eth0’ 网络设备        |
| iwconfig eth1                                   | 显示一个无线网卡的配置      |
| iwlist scan                                     | 显示无线网络                |
| ip addr show                                    | 显示网卡的IP地址            |
| vi /etc/resolv.conf                             | 修改对应网卡的DNS的配置文件 |

## 系统相关

| 命令                                           | 解析                                         |
| :--------------------------------------------- | :------------------------------------------- |
| su -                                           | 切换到root权限（与su有区别）                 |
| shutdown -h now                                | 关机                                         |
| shutdown -r now                                | 重启                                         |
| top                                            | 罗列使用CPU资源最多的linux任务 （输入q退出） |
| pstree                                         | 以树状图显示程序                             |
| man ping                                       | 查看参考手册（例如ping 命令）                |
| passwd                                         | 修改密码                                     |
| df -h                                          | 显示磁盘的使用情况                           |
| cal -3                                         | 显示前一个月，当前月以及下一个月的月历       |
| cal 10 1988                                    | 显示指定月，年的月历                         |
| date –date ‘1970-01-01 UTC 1427888888 seconds’ | 把一相对于1970-01-01 00:00的秒数转换成时间   |
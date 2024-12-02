---
title: Docker
tags:
  - 笔记
  - 学习
  - docker
createTime: 2021/10/11
permalink: /article/wtw37qhs/
---
# Docker

## Docker简介

容器化技术：一个不完整的操作系统。


![image-20210504174158226.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-1.png)

**Docker为什么比虚拟机快？**

1. Docker有着比虚拟机更少的抽象层
2. Docker利用的是宿主机的内核

所以说，新建容器时，docker不需要像虚拟机一样重新加载一个操作系统，避免引导。

VM是硬件虚拟化，Docker是OS虚拟化。

VM会有5-20%的性能损耗，Docker是物理机性能。

## 常用指令

docker version

docker info

docker --help

docker pull [] ``下载镜像``

docker search [] ``搜索镜像``

docker rmi [] ``删除镜像``

docker rmi -f $(docker images -aq) ``删除所有镜像``

docker images ``查看镜像``

## 新建容器并启动

docker run [可选参数] [image]

--name="name01" ``容器名字``

-d ``后台方式运行``

-it ``使用交互式运行，进入容器查看内容``

-p ``指定容器端口，-p 8080:8080（主机端口:容器端口）``

-P ``随机端口``

利用 `docker run`来创建容器时，Docker在后台运行的标准操作包括：

- 检查本地是否存在指定镜像，不存在就从共有仓库下载
- 利用镜像创建并启动一个容器
- 分配一个文件系统，并在只读的镜像层外面挂载一层可读写层
- 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去
- 从地址池配置一个ip地址给容器
- 执行用户指定的应用程序
- 执行完毕后容器被终止

## 列出所有运行的容器

docker ps [-a] ``带出历史运行过的，[-n=?]最近运行的n个``

-q ``只显示容器编号``

## 退出容器

exit ``退出容器``

ctrl+P+Q ``退出不停止``

## 删除容器

docker rm 容器id ``删除容器``

docker rm -f $(docker ps -aq) ``删除所有容器``

## 启动重启和停止关闭

docker start 容器id

docker restart 容器id

docker stop 容器id

docker kill 容器id



**docker容器使用后台运行时（docker run -d [镜像名]），如果没有前台进程，就会立即停止。例如nginx，容器启动后，发现自己没有提供服务就会立即停止，就是没有程序了。**

## 查看日志

docker logs [-tf] ``显示全部带时间戳``

--tail + num ``查看日志数量``

## 查看容器中进程信息

docker top 容器id

## 查看镜像元数据

docker inspect 容器id

## 进入当前正在运行的容器

我们通常容器都使用后台运行，需要进入容器，修改一些配置。

docker exec -it 容器id bashshell

docker attach 容器id

exec ``进入容器后开启新的终端，可进行操作``

attach ``进入容器正在执行的终端，不开启新进程``

## 从容器内拷贝文件到主机

docker cp 容器id:容器内路径 目的的主机路径

## 查看CPU状态

docker stats

## 可视化（protainer）

Docker图形化界面

```
docker run -d -p 8088:9000  --restart=always -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer
```

访问方式：http://IP:8088

## commit镜像

docker commit ``提交镜像成为一个新的副本``

docker commit -m="提交内容" -a="作者名" 容器id 目标镜像名:[TAG]

## 容器数据卷

容器间可以有一个数据共享的数据。Docker容器中产生的数据同步到本地。



数据卷是一个可供一个或多个容器使用的特殊目录，它绕过UFS，可以提供很多有用的特性：

- 数据卷可以在容器之间共享和重用
- 对数据卷的修改会立马生效
- 对数据卷的更新，不会影响到镜像
- 卷会一直存在，直到没有容器使用



总结：容器持久化和同步操作，容器间也可以共享数据。



使用：docker run -it -v 主机目录:容器目录 bashshell`主机目录必须是绝对路径，如果不存在docker自动创建`

docker挂载数据卷的默认权限是读写，用户也可以通过`:ro`指定为只读

举例：MySql数据持久化

```
docker run -d -p 3310:3306 -v /home/mysql/conf:/etc/mysql/conf.d -v /home/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 --name mysql01 mysql:5.7
```

docker run 后台运行 端口映射 卷挂载 环境配置 容器命名 镜像名

## 容器和镜像的区别

镜像是只读的不能被保存或修改，一个镜像可以构建在另一个镜像之上，这种层叠关系是多层的。

容器就是在所有的镜像层之上增加一个可写层。这个可写层有运行在CPU上的进程，而且有两个不同的状态：运行态和停止态。从运行态到停止态，我们对它所做的一切都会永久地写到容器的文件系统中，注意不是镜像中。可以用一个镜像启动多个容器，各个容器间相互隔离。


![image-20210505172410099.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-2.png)

## 具名挂载和匿名挂载

- 匿名挂载：docker run -d -P -v /etc/nginx
- 具名挂载：docker run -d -P -v name01:/etc/nginx

## 查看卷列表

```
docker volume ls
```

## 查看卷信息

docker volume inspect 卷名

-v 容器内路径 `匿名挂载`

-v 卷名:容器内路径 `具名挂载`

-v 宿主机路径:容器内路径 `指定路径挂载`

-v 容器内路径:ro(只读) rw(可读可写)

## 数据卷容器

数据卷容器，其实就是一个正常的容器，专门用来提供数据卷为其他容器挂载的。



首先，创建一个命名的数据卷容器dbdata：

```shell
docker run -d -v /dbdata --name dbdata training/postgres echo Data-only container
```

然后，在其他容器中使用`--volumes-from 容器名`来挂载dbdata容器中的数据卷

```shell
docker run -d --volumes-from dbdata --name db1 training/postgres
docker run -d --volumes-from dbdata --name db2 training/postgres
```

还可以使用多个`--volumes-from`参数来从多个容器挂载多个数据卷。也可以从其他已经挂载了数据卷的容器来挂载数据卷。

如果删除了挂载的容器(包括 dbdata、db1 和 db2)，数据卷并不会被自动删除。如果要删除一个数据 卷，必须在删除最后一个还挂载着它的容器时使用 `docker rm -v` 命令来指定同时删除关联的容器。 这可以让用户在容器之间升级和移动数据卷。

## DockerFile

用来构建docker镜像的构建文件，命令脚本。通过这个脚本可以生成镜像，镜像是一层层的，脚本是一个个的命令，每个命令都是一层。



**Docker构建步骤**

1. 编写一个dockerfile文件
2. docker build构建成一个镜像
3. docker run运行镜像
4. docker push发布镜像（DockerHub，阿里云……）

## DockerFile指令

|    指令    | 说明                                                         |
| :--------: | ------------------------------------------------------------ |
|    FROM    | 基础镜像，一切从这里开始                                     |
| MAINTAINER | 镜像是谁写的，姓名+邮箱                                      |
|    RUN     | 运行命令                                                     |
|    ADD     | 添加内容，可解压tar包（不同于COPY的地方）                    |
|  WORKDIR   | 镜像工作目录                                                 |
|   VOLUME   | 挂载的目录                                                   |
|   EXPOSE   | 指定暴露端口（同-P指令）                                     |
|    CMD     | 指定启动容器时执行的命令，每个 Dockerfile 只能有一条 CMD 命令。如果指定了多条命令，只有最后一条会被执行，可被替代。                                   |
| ENTRYPOINT | 如果用户启动容器时候指定了运行的命令，则会覆盖掉 CMD 指定的命令。ENTRYPOINT可追加命令。每个 Dockerfile 中只能有一个 ENTRYPOINT ，当指定多个时，只有最后一个起效。 |
|  ONBUILD   | 当构建一个被继承DockerFile这个时候就会运行ONBUILD指令。触发指令 |
|    COPY    | 类似ADD，将我们的文件拷贝到镜像中                            |
|    ENV     | 构建时设置环境变量                                           |

**DockerHub中99%的镜像都是FROM scratch**

## DockerFile例子

创建一个自己的centos

```
FROM centos
MAINTAINER jy<jy@test.com>
ENV MYPATH /usr/local
WORKDIR $MYPATH
RUN yum -y install vim
RUN yum -y install net-tools
EXPOSE 80
CMD echo $MYPATH
CMD echo "---end---"
CMD /bin/bash
```

## 运行DockerFile文件

docker build -f 文件路径 -t 镜像名:[TAG] . `最后要加一个.`

docker history 镜像id `可以看镜像的构建过程`



**编写dockerfile文件，官方命名Dockerfile，build就会自动找，不需要-f指定文件了**

**注意：一个镜像不能超过127层**

## CMD和ENTRYPOINT

```
CMD ["ls","-a"]
```

run时执行 ls -a



当Dockerfile中有CMD命令时

docker run 镜像id ls -al

追加的命令会替换CMD语句，所以如果追加-l会出错，相当于CMD ["-l"]



但如果是

```
ENTRYPOINT ["ls","-a"]
```

docker run 镜像id -l

就不会出错，会追加在ENTRYPOINT指令上

## 发布自己的镜像

```
docker login -u xx -p xx
docker push 镜像id:[TAG]
```

阿里云的镜像容器，可参考阿里云官网

## Docker网络

**理解Docker0（使用ip addr查看网卡信息）**

当 Docker 启动时，会自动在主机上创建一个 docker0 虚拟网桥，实际上是 Linux 的一个 bridge，可以理 解为一个软件交换机。它会在挂载到它的网口之间进行转发。

当创建一个 Docker 容器的时候，同时会创建了一对 veth pair 接口(当数据包发送到一个接口时，另外 一个接口也可以收到相同的数据包)。这对接口一端在容器内，即 eth0 ;另一端在本地并被挂载到

docker0 网桥，名称以 veth 开头(例如 vethAQI2QT )。通过这种方式，主机可以跟容器通信，容器 之间也可以相互通信。Docker 就创建了在主机和所有容器之间一个虚拟共享网络。

![image-20210528225349265.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-3.png)

原理：

1. 我们每启动一个docker容器，docker就会给容器分配一个ip，我们只要安装了docker，就会有一个网卡docker0。
2. 桥接模式，使用的技术是veth-pair技术。
3. 这个容器带来的网卡都是一一对应的。
4. veth-pair就是一对的虚拟设备接口，他们都是成对出现的，一端连着协议，一端彼此相连。
5. 正因为有这个特性，veth-pair充当一个桥梁，连接各种虚拟网络设备的。


![image-20210507205851773.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-4.png)

如图，tomcat01和tomcat02是公用的一个路由器，docker0所有的容器不指定网络的情况下，都是docker0路由的，docker会给我们的容器分配一个默认的可用IP。

Docker中的所有网络接口都是虚拟的。虚拟的转发效率高！只要删除容器，对应的一对网桥就没了。
## 容器访问外网

容器要想访问外部网络，需要本地系统的转发支持。

在Linux 系统中，检查转发是否打开。

```shell
 $sysctl net.ipv4.ip_forward
 net.ipv4.ip_forward = 1
```

如果为 0，说明没有开启转发，则需要手动打开。

```shell
$sysctl -w net.ipv4.ip_forward=1
```



如果在启动 Docker 服务的时候设定 `--ip-forward=true `, Docker 就会自动设定系统的 ip_forward 参数 为 1。

## --link

**不需要用ip直接用容器名（服务名）ping**

```
docker exec -it tomcat02 ping tomcat01
```

上面的无法ping通！

```
docker run -d -P --name tomcat03 --link tomcat02 tomcatdocker exec -it tomcat03 ping tomcat02
```

此时就可以ping同通

原理：

```
docker exec -it tomcat03 cat /etc/hosts
```

总结：

--link就是在hosts配置中增加一个映射

## 查看网络信息

```
docker network lsdocker network inspect 网络ID
```

## 网络模式

bridge：桥接模式（默认）

none：不配置网络

host：和宿主机共享网络

container：容器网络连通（用得少，局限大）



```
docker run -d -P --name tomcat01 --net bridge tomcat
```

docker0特点：默认，域名不能访问，--link可以打通



```
docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mynet
```

解释：docker network create 桥接的网络模式 子网 网关 名称



```
docker run -d -P --name tomcat01 --net mynet tomcat
```

可以直接互相ping通

```
docker exec -it tomcat01 ping tomcat02
```

## 网络连通

```
docker network connect mynet tomcat00
```

不同网络下的容器也能互相连通，tomcat00是其他网络下的容器
## Docker底层实现和网络实现

Docker 底层的核心技术包括 Linux 上的名字空间(Namespaces)、控制组(Control groups)、Union 文

件系统(Union file systems)和容器格式(Container format)。

Docker 的网络实现其实就是利用了 Linux 上的网络名字空间和虚拟网络设备(特别是 veth pair)。

## 一张图总结Docker的命令

![image-20210529113037532.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-5.png)
---
title: Docker进阶
tags:
   - 笔记
   - 学习
   - docker
createTime: 2021/10/11
permalink: /article/280rm7bg/
---
# Docker进阶

## Docker Compose

### 简介

Docker Compose 是 Docker 官方编排(Orchestration)项目之一，负责快速在集群中部署分布式应用。该项目由 Python 编写，实际上调用了 Docker 提供的 API 来实现。

Dockerfile 可以让用户管理一个单独的应用容器;而 Compose 则允许用户在一个模板(YAML 格式)中定 义一组相关联的应用容器(被称为一个 project ，即项目)，例如一个 Web 服务容器再加上后端的数据 库服务容器等。

定义运行多个容器来轻松高效的管理容器。

- 定义、运行多个容器
- YAML file配置文件
- 单一指令
- 所有环境都可以使用Compose
- 三个步骤
   1. Dockerfile
   2. docker-compose.yml
   3. 启动项目 docker-compose up

> 官方说明
>
> Compose是一个用于定义和运行多容器Docker应用程序的工具。使用Compose，可以使用YAML文件来配置应用程序的服务。然后，使用一个命令，从配置中创建并启动所有服务。
>
> Compose适用于所有环境：生产、暂存、开发、测试以及CI工作流。
>
> 使用Compose基本上分为三个步骤：
>
> 1. 使用“Dockerfile”定义应用程序的环境，以便可以在任何地方复制。
> 2. 在“docker compose.yml”中定义组成应用程序的服务，以便它们可以在隔离的环境中一起运行。
> 3. 运行“docker compose up”和启动并运行整个应用程序。



**为什么不在一个单一的容器里运行多个程序?**

1. 透明化。为了使容器组中的容器保持一致的基础设施和服务，比如进程管理和资源监控。这样设计是 为了用户的便利性。
2. 解耦软件之间的依赖。每个容器都可能重新构建和发布。
3. 方便使用。用户不必运行独立的程序管理，也不用担心每个运用程序的退出状态。
4. 高效。考虑到基础设施有更多的职责，容器必须要轻量化。



作用：**批量容器编排**

Compose是Docker官方的开源项目，需要安装。

Docker desktop自带compose。



> docker-compose.yml文件如下结构

```yaml
version: "3.9"  # optional since v1.27.0
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    links:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

假如有100个服务，利用docker-compose up可以一键启动

**Compose重要的概念：**

- **服务services。一个应用容器，实际上可以运行多个相同镜像的实例。容器。应用（web、redis、mysql……）**
- **项目project。由一组关联的应用容器组成的一个完整业务单元。例如：博客（web、mysql、wp……）**

### 安装

https://docs.docker.com/compose/install/

### 体验

https://docs.docker.com/compose/gettingstarted/

1. 第一步，创建应用app.py

   ```shell
   mkdir composetest
   cd composetest
   vim app.py
   ```

   app.py

   ```python
   import time
   
   import redis
   from flask import Flask
   
   app = Flask(__name__)
   cache = redis.Redis(host='redis', port=6379)
   
   def get_hit_count():
       retries = 5
       while True:
           try:
               return cache.incr('hits')
           except redis.exceptions.ConnectionError as exc:
               if retries == 0:
                   raise exc
               retries -= 1
               time.sleep(0.5)
   
   @app.route('/')
   def hello():
       count = get_hit_count()
       return 'Hello World! I have been seen {} times.\n'.format(count)
   ```

   ```shell
   vim requirements.txt
   ```

   requirements.txt

   ```
   flask
   redis
   ```

2. 创建一个Dockerfile，应用打包为镜像

   ```shell
   vim Dockerfile
   ```

   Dockerfile

   ```dockerfile
   FROM python:3.7-alpine
   WORKDIR /code
   ENV FLASK_APP=app.py
   ENV FLASK_RUN_HOST=0.0.0.0
   RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
   RUN apk add --no-cache gcc musl-dev linux-headers
   COPY requirements.txt requirements.txt
   RUN pip install -r requirements.txt
   EXPOSE 5000
   COPY . .
   CMD ["flask", "run"]
   ```

   > 官方解释
   >
   > This tells Docker to:
   >
   > - Build an image starting with the Python 3.7 image.
   > - Set the working directory to `/code`.
   > - Set environment variables used by the `flask` command.
   > - Install gcc and other dependencies
   > - Copy `requirements.txt` and install the Python dependencies.
   > - Add metadata to the image to describe that the container is listening on port 5000
   > - Copy the current directory `.` in the project to the workdir `.` in the image.
   > - Set the default command for the container to `flask run`.

3. 第三步，创建docker-compose.yml文件（定义整个服务，需要的环境。web、redis）

   ```shell
   vim docker-compose.yml
   ```

   docker-compose.yml

   ```yaml
   version: "3.9"
   services:
     web:
       build: .
       ports:
         - "5000:5000"
     redis:
       image: "redis:alpine"
   ```

4. 第四步，启动compose项目（docker-compose up）

   ```shell
   docker-compose up
   ```

**流程**

1. 创建网络（项目中的内容都在同个网络下。域名访问）

2. 执行docker-compose.yml

3. 启动服务

   docker-compose.yml

   Creating composetest_web_1 ...done

   Creating composetest_redis_1 ...done

   1. 文件名 conposetest
   2. 服务 web
   3. 副本数量 1

**停止**

```shell
docker-compose down
docker-compose stop
```

### yaml规则

https://docs.docker.com/compose/compose-file/compose-file-v3/

```yaml
# 3层

version:'' #版本
service: #服务
	服务1:web
		#服务配置
		images
		build
		network
		depends_on #依赖 先启动依赖
			-redis
		...
	服务2:redis
	服务3...
#其他配置 网络/卷、全局规则
volumes:
networks:
configs:
```

### 开源项目

**wordpress博客**

https://docs.docker.com/samples/wordpress/

```yaml
version: "3.9"
    
services:
  db:
  	platform: linux/x86_64
    image: mysql:5.7
    volumes:
      - db_data:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    
  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    ports:
      - "8000:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
volumes:
  db_data: {}
```

在此yaml文件下运行`docker-compose up/docker-compose up -d`，然后访问`localhost:8000`就可以看到wordpress操作页面。

### 实战

1. 编写项目微服务，打包jar
2. dockerfile构建镜像
3. docker-compose.yml编排项目
4. 三个文件放到服务器同一目录下执行`docker-compose up`



## Docker Swarm

1. 准备4台1核2G的服务器用于构建集群，1主3从！
2. 服务器镜像使用centOS7及以上版本

### 4台服务器安装docker

1. yum安装gcc相关环境

   ```shell
   yum -y install gcc
   yum -y install gcc-c++
   ```

2. 卸载旧版本

   ```shell
   yum remove docker \
   									docker-client \
   									docker-client-latest \
   									docker-common \
   									docker-latest \
   									docker-latest-logrotate \
   									docker-logrotate \
   									docker-engine
   ```

3. 安装需要的软件包

   ```shell
   yum install -y yum-utils
   ```

4. 设置镜像仓库

   ```shell
   yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
   ```

5. 更新yum软件包索引

   ```shell
   yum makecache fast
   ```

6. 安装Docker CE

   ```shell
   yum install -y docker-ce docker-ce-cli containerd.io
   ```

7. 启动Docker

   ```shell
   systemctl start docker
   ```

8. 测试命令

   ```shell
   docker version
   ```

9. 配置镜像加速

   ```shell
   sudo mkdir -p /etc/docker
   
   sudo tee /etc/docker/daemon.json <<-'EOF'
   {
   	"registry-mirrors":["https://qiyb9988.mirror.aliyuncs.com"]
   }
   EOF
   
   sudo systemctl daemon-reload
   
   sudo systemctl restart docker
   ```

### 官方文档

https://docs.docker.com/engine/swarm/

### Raft协议（一致性协议）

![swarm-diagram.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-6.png)

双主双从：如果一个manager节点挂了，另外一个就不能用了。

Raft协议：保证大多数节点存活才可用，高可用。普通的需要大于一个节点，集群需要大于3个节点。



### 搭建集群

1. **在第一台服务器初始化一个Swarm**

   ```shell
   docker swarm init --advertise-addr 当前内网ip
   ```

   如果使用Docker Desktop for Mac或Docker Desktop for Windows来测试单节点swarm，只需运行`docker swarm init`而不带任何参数


![image-20210518223315143.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-7.png)



运行`docker info`查看群集的当前状态:

   ```shell
   $ docker info
   
   Containers: 2
   Running: 0
   Paused: 0
   Stopped: 2
     ...snip...
   Swarm: active
     NodeID: dxn1zf6l61qsb1josjja83ngz
     Is Manager: true
     Managers: 1
     Nodes: 1
     ...snip...
   ```

运行`docker node ls`命令以查看有关节点的信息：

   ```shell
   $ docker node ls
   
   ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
   dxn1zf6l61qsb1josjja83ngz *  manager1  Ready   Active        Leader
   ```

节点ID旁边的*表示您当前已连接到此节点。

Docker Engine swarm模式自动为机器主机名命名节点。



2. **加入节点**

   一旦创建了一个带有管理器节点的swarm，就可以添加worker节点了。

   ```shell
   # 加入一个节点
   docker swarm join
   # 获取令牌
   docker swarm join-token manager
   docker swarm join-token worker
   ```

   ```shell
   $ docker swarm join \
     --token  SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
     192.168.99.100:2377
   
   This node joined a swarm as a worker.
   ```

   ```shell
   $ docker swarm join-token worker
   
   To add a worker to this swarm, run the following command:
   
       docker swarm join \
       --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
       192.168.99.100:2377
   ```

   打开一个终端，ssh到manager节点运行的机器中，运行`docker node ls`命令查看工作节点：

   ```shell
   ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
   03g1y59jwfg7cf99w4lt0f662    worker2   Ready   Active
   9j68exjopxe7wfl6yuxml7a7j    worker1   Ready   Active
   dxn1zf6l61qsb1josjja83ngz *  manager1  Ready   Active        Leader
   ```

   MANAGER列标识群中的管理器节点。worker1和worker2的此列中的空状态将它们标识为工作节点。

   docker node ls等群管理命令只在管理器节点上工作。



### 部署服务

#### **向swarm部署服务**

创建集群之后，可以将服务部署到集群。运行以下命令：

```shell
$ docker service create --replicas 1 --name helloworld alpine ping docker.com

9uk4639qpg7npwf3fn2aasksr
```

- `docker service create`命令创建服务。
- `--name` 将服务命名为helloworld。
- `--replicas` 指定1个运行实例的所需状态。
- 参数`alpine ping docker.com`将服务定义为执行命令ping docker.com的alpine Linux容器。

```shell
docker run 容器启动！不具有扩缩容器
docker service 服务！具有扩缩容器，滚动更新
```



运行 `docker service ls` 查看正在运行的服务列表：

```shell
$ docker service ls

ID            NAME        SCALE  IMAGE   COMMAND
9uk4639qpg7n  helloworld  1/1    alpine  ping docker.com
```



#### **在swarm上检查服务**

运行`docker service inspect --pretty <service-ID>`以易于阅读的格式显示有关服务的详细信息。查看helloworld服务的详细信息：

```shell
[manager1]$ docker service inspect --pretty helloworld

ID:		9uk4639qpg7npwf3fn2aasksr
Name:		helloworld
Service Mode:	REPLICATED
 Replicas:		1
Placement:
UpdateConfig:
 Parallelism:	1
ContainerSpec:
 Image:		alpine
 Args:	ping docker.com
Resources:
Endpoint Mode:  vip
```

> 要以json格式返回服务详细信息，运行不带--pretty标志的相同命令。

```shell
[manager1]$ docker service inspect helloworld
[
{
    "ID": "9uk4639qpg7npwf3fn2aasksr",
    "Version": {
        "Index": 418
    },
    "CreatedAt": "2016-06-16T21:57:11.622222327Z",
    "UpdatedAt": "2016-06-16T21:57:11.622222327Z",
    "Spec": {
        "Name": "helloworld",
        "TaskTemplate": {
            "ContainerSpec": {
                "Image": "alpine",
                "Args": [
                    "ping",
                    "docker.com"
                ]
            },
            "Resources": {
                "Limits": {},
                "Reservations": {}
            },
            "RestartPolicy": {
                "Condition": "any",
                "MaxAttempts": 0
            },
            "Placement": {}
        },
        "Mode": {
            "Replicated": {
                "Replicas": 1
            }
        },
        "UpdateConfig": {
            "Parallelism": 1
        },
        "EndpointSpec": {
            "Mode": "vip"
        }
    },
    "Endpoint": {
        "Spec": {}
    }
}
]
```

运行`docker service ps <service-ID>`查看哪些节点正在运行服务：

```shell
[manager1]$ docker service ps helloworld

NAME             IMAGE   NODE     DESIRED STATE  CURRENT STATE     ERROR PORTS
helloworld.1...  alpine  worker2  Running        Running 3 minutes
```

在本例中，helloworld服务的一个实例正在worker2节点上运行。也可能会看到服务正在manager节点上运行。默认情况下，群中的管理节点可以像工作节点一样执行任务。

Swarm还显示服务任务的所需状态和当前状态，以便查看任务是否根据服务定义运行。



在运行任务的节点上运行`docker ps`以查看有关任务容器的详细信息。

> 如果helloworld运行在管理器节点以外的节点上，则必须将ssh连接到该节点。

```shell
[worker2]$ docker ps

CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
e609dde94e47        alpine:latest       "ping docker.com"   3 minutes ago       Up 3 minutes     
```



#### **动态扩缩容器**

```shell
docker service update --replicas 3 helloworld
```

创建三个helloworld副本，随机部署到集群里面的服务器中，不管访问哪个节点都能访问到。

```shell
docker service update --replicas 1 helloworld
```

将集群中的helloworld副本降到1个。服务可以有多个副本动态扩缩容实现高可用！

```shell
docker service scale helloworld=5
docker service scale helloworld=2
```

scale命令与update --replicas效果相同



运行`docker service ps <SERVICE-ID>`查看更新的任务列表：

```shell
$ docker service ps helloworldNAME                                    IMAGE   NODE      DESIRED STATE  CURRENT STATEhelloworld.1.8p1vev3fq5zm0mi8g0as41w35  alpine  worker2   Running        Running 7 minuteshelloworld.2.c7a7tcdq5s0uk3qr88mf8xco6  alpine  worker1   Running        Running 24 secondshelloworld.3.6crl09vdcalvtfehfh69ogfb1  alpine  worker1   Running        Running 24 secondshelloworld.4.auky6trawmdlcne8ad8phb0f1  alpine  manager1  Running        Running 24 secondshelloworld.5.ba19kca06l18zujfwxyc5lkyn  alpine  worker2   Running        Running 24 seconds
```

swarm创建了4个新任务，以扩展到总共5个运行Alpine Linux的实例。任务分布在群的三个节点之间。一个在manager1上运行。



运行`docker ps`以查看在连接的节点上运行的容器。以下示例显示在manager1上运行的任务：

```shell
$ docker ps

CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
528d68040f95        alpine:latest       "ping docker.com"   About a minute ago   Up About a minute                       helloworld.4.auky6trawmdlcne8ad8phb0f1
```



#### **移除服务**

```shell
docker service rm helloworld
```

运行`docker service inspect<service-ID>`验证swarm manager是否删除了服务。CLI返回一条消息，指出找不到服务：

```shell
$ docker service inspect helloworld
[]
Error: no such service: helloworld
```

即使服务不再存在，任务容器也需要几秒钟的时间来清理。可以在节点上使用docker ps来验证任务何时被删除。

```shell
$ docker ps

    CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
    db1651f50347        alpine:latest       "ping docker.com"        44 minutes ago      Up 46 seconds                           helloworld.5.9lkmos2beppihw95vdwxy1j3w
    43bf6e532a92        alpine:latest       "ping docker.com"        44 minutes ago      Up 46 seconds                           helloworld.3.a71i8rp6fua79ad43ycocl4t2
    5a0fb65d8fa7        alpine:latest       "ping docker.com"        44 minutes ago      Up 45 seconds                           helloworld.2.2jpgensh7d935qdc857pxulfr
    afb0ba67076f        alpine:latest       "ping docker.com"        44 minutes ago      Up 46 seconds                           helloworld.4.1c47o7tluz7drve4vkm2m5olx
    688172d3bfaa        alpine:latest       "ping docker.com"        45 minutes ago      Up About a minute                       helloworld.1.74nbhb3fhud8jfrhigd7s29we

$ docker ps
   CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS  
```



#### **服务应用滚动更新**

部署一个基于redis3.0.6容器标记的服务。然后使用滚动更新将服务升级为使用redis3.0.7容器映像。



**将Redis标签部署到swarm，并以10秒的更新延迟配置swarm。下面的示例显示了一个旧的Redis标记：**

```shell
$ docker service create \
  --replicas 3 \
  --name redis \
  --update-delay 10s \
  redis:3.0.6

0u6a4s31ybk7yw2wyvtikmu50
```

在服务部署时配置滚动更新策略。

`--update delay`标志配置服务任务或任务集更新之间的时间延迟。可以将时间`T`描述为秒数`Ts`、分钟`Tm`或小时`Th`的组合。所以10m30s表示10分30秒的延迟。

默认情况下，计划程序一次更新一个任务。可以传递`--update parallelism`标志来配置调度器同时更新的最大服务任务数。

默认情况下，当对单个任务的更新返回运行状态时，调度程序会安排另一个任务进行更新，直到所有任务都更新为止。如果在更新过程中的任何时候任务返回失败，调度程序将暂停更新。可以使用`docker service create`或`docker service update`的`--update failure action`标志来控制行为。



**检查redis服务：**

```shell
$ docker service inspect --pretty redis

ID:             0u6a4s31ybk7yw2wyvtikmu50
Name:           redis
Service Mode:   Replicated
 Replicas:      3
Placement:
 Strategy:	    Spread
UpdateConfig:
 Parallelism:   1
 Delay:         10s
ContainerSpec:
 Image:         redis:3.0.6
Resources:
Endpoint Mode:  vip
```



**现在可以为redis更新容器镜像了。swarm manager根据UpdateConfig策略将更新应用于节点：**

```shell
$ docker service update --image redis:3.0.7 redis
redis
```

默认情况下，计划程序应用滚动更新，如下所示：

- 停止第一项任务。
- 已停止任务的计划更新。
- 启动更新任务的容器。
- 如果对任务的更新返回RUNNING，请等待指定的延迟时间，然后启动下一个任务。
- 如果在更新过程中的任何时候，任务返回失败，暂停更新。



**运行`docker service inspect--pretty redis`以查看处于运行状态的新镜像：**

```shell
$ docker service inspect --pretty redis

ID:             0u6a4s31ybk7yw2wyvtikmu50
Name:           redis
Service Mode:   Replicated
 Replicas:      3
Placement:
 Strategy:	    Spread
UpdateConfig:
 Parallelism:   1
 Delay:         10s
ContainerSpec:
 Image:         redis:3.0.7
Resources:
Endpoint Mode:  vip
```

**`service inspect`的输出显示更新是否因失败而暂停：**

```shell
$ docker service inspect --pretty redis

ID:             0u6a4s31ybk7yw2wyvtikmu50
Name:           redis
...snip...
Update status:
 State:      paused
 Started:    11 seconds ago
 Message:    update paused due to failure or early termination of task 9p7ith557h8ndf0ui9s0q951b
...snip...
```



**要重新启动暂停的更新，运行`docker service update<service-ID>`。例如：**

```shell
docker service update redis
```

为了避免重复某些更新失败，也可能需要向`docker service update`传递标志来重新配置服务。



**运行`docker service ps<service-ID>`以查看滚动更新：**

```shell
$ docker service ps redis

NAME                                   IMAGE        NODE       DESIRED STATE  CURRENT STATE            ERROR
redis.1.dos1zffgeofhagnve8w864fco      redis:3.0.7  worker1    Running        Running 37 seconds
 \_ redis.1.88rdo6pa52ki8oqx6dogf04fh  redis:3.0.6  worker2    Shutdown       Shutdown 56 seconds ago
redis.2.9l3i4j85517skba5o7tn5m8g0      redis:3.0.7  worker2    Running        Running About a minute
 \_ redis.2.66k185wilg8ele7ntu8f6nj6i  redis:3.0.6  worker1    Shutdown       Shutdown 2 minutes ago
redis.3.egiuiqpzrdbxks3wxgn8qib1g      redis:3.0.7  worker1    Running        Running 48 seconds
 \_ redis.3.ctzktfddb2tepkr45qcmqln04  redis:3.0.6  mmanager1  Shutdown       Shutdown 2 minutes ago
```

在Swarm更新所有任务之前，可以看到一些任务正在运行redis:3.0.6 ，而其他服务正在运行redis:3.0.7，上面的输出显示了滚动更新完成后的状态。



#### 在集群上维护节点

在之前的小节，所有的节点的状态都是运行着的可用状态。swarm manager 可以分配任务给任意可用的节点。



有时候，你可能需要对某台服务器进行维护，你需要配置某个节点为drain状态，即排干该节点上面的所有运行的容器。drain状态可以防止维护节点再收到 管理节点的指令。



它也意味着管理节点停止在该服务器上面运行任务，并把复制任务放到别的可用节点上面。



> 重要提示：将节点设置为DRAIN不会从该节点中移除独立容器，例如使用docker run、docker compose up或docker Engine API创建的容器。节点的状态（包括DRAIN）只影响节点调度swarm服务工作负载的能力。



1. 验证所有节点都处于活动可用状态。

   ```shell
   $ docker node ls
   
   ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
   1bcef6utixb0l0ca7gxuivsj0    worker2   Ready   Active
   38ciaotwjuritcdtn9npbnkuz    worker1   Ready   Active
   e216jshn25ckzbvmwlnh5jr3g *  manager1  Ready   Active        Leader
   ```

2. 运行`docker service ps redis`查看swarm manager如何将任务分配给不同的节点：

   ```shell
   $ docker service ps redis
   
   NAME                               IMAGE        NODE     DESIRED STATE  CURRENT STATE
   redis.1.7q92v0nr1hcgts2amcjyqg3pq  redis:3.0.6  manager1 Running        Running 26 seconds
   redis.2.7h2l8h3q3wqy5f66hlv9ddmi6  redis:3.0.6  worker1  Running        Running 26 seconds
   redis.3.9bg7cezvedmkgg6c8yzvbhwsd  redis:3.0.6  worker2  Running        Running 26 seconds
   ```

3. 运行`docker node update--availability drain<node-ID>`以排出已分配任务的节点：

   ```shell
   docker node update --availability drain worker1
   
   worker1
   ```

4. 检查节点以检查其可用性：

   ```shell
   $ docker node inspect --pretty worker1
   
   ID:			38ciaotwjuritcdtn9npbnkuz
   Hostname:		worker1
   Status:
    State:			Ready
    Availability:		Drain
   ...snip...
   ```

5. 运行`docker service ps redis`查看swarm manager如何更新redis服务的任务分配：

   ```shell
   $ docker service ps redis
   
   NAME                                    IMAGE        NODE      DESIRED STATE  CURRENT STATE           ERROR
   redis.1.7q92v0nr1hcgts2amcjyqg3pq       redis:3.0.6  manager1  Running        Running 4 minutes
   redis.2.b4hovzed7id8irg1to42egue8       redis:3.0.6  worker2   Running        Running About a minute
    \_ redis.2.7h2l8h3q3wqy5f66hlv9ddmi6   redis:3.0.6  worker1   Shutdown       Shutdown 2 minutes ago
   redis.3.9bg7cezvedmkgg6c8yzvbhwsd       redis:3.0.6  worker2   Running        Running 4 minutes
   ```

   swarm manager通过在具有耗尽可用性的节点上结束任务并在具有活动可用性的节点上创建新任务来维持所需的状态。

6. 运行`docker node update--availability active<node-ID>`以将已耗尽的节点返回到活动状态：

   ```shell
   $ docker node update --availability active worker1worker1
   ```

7. 检查节点以查看更新的状态：

   ```shell
   $ docker node inspect --pretty worker1ID:			38ciaotwjuritcdtn9npbnkuzHostname:		worker1Status: State:			Ready Availability:		Active...snip...
   ```

   将节点设置回活动可用性时，它可以接收新任务：

   - 在服务更新期间进行扩展
   - 在滚动更新期间
   - 当您将另一个节点设置为耗尽可用性时
   - 当任务在另一个活动节点上失败时



#### 使用swarm模式路由网格

Docker Engine swarm模式使得为服务发布端口变得容易，从而使这些端口可供swarm之外的资源使用。所有节点都参与一个入口路由网。**路由网格允许群中的每个节点接受群中运行的任何服务的已发布端口上的连接，即使节点上没有运行任何任务。**路由网格将所有传入请求路由到可用节点上的已发布端口，并将其路由到活动容器。



要在swarm中使用入口网络，在启用swarm模式之前，需要在swarm节点之间打开以下端口：

- Port `7946` TCP/UDP 用于容器网络的端口
- Port `4789` UDP 用于容器入口网络的端口

除此之外，还必须打开swarm节点和任何需要访问端口的外部资源（如外部负载平衡器）之间的已发布端口。

也可以绕过给定服务的路由网格。



**发布服务的端口**

创建服务时，使用`--publish`标志发布端口。`target`用于指定容器内的端口，`published`用于指定要在路由网格上绑定的端口。如果不使用已发布的端口，则会为每个服务任务绑定一个随机的高编号端口。需要先检查任务以确定端口。

```shell
$ docker service create \
  --name <SERVICE-NAME> \
  --publish published=<PUBLISHED-PORT>,target=<CONTAINER-PORT> \
  <IMAGE>
```

> 注意：这种语法的旧形式是冒号分隔的字符串，其中发布的端口是第一个，目标端口是第二个，例如-p 8080:80。首选新语法，因为它更易于阅读，并且允许更大的灵活性。

`<PUBLISHED-PORT>`是swarm提供服务的端口。如果忽略它，则会绑定一个随机的高位端口。`<CONTAINER-PORT>`是容器侦听的端口。此参数是必需的。

例如，以下命令将nginx容器中的端口80发布到swarm中任何节点的端口8080：

```shell
$ docker service create \
  --name my-web \
  --publish published=8080,target=80 \
  --replicas 2 \
  nginx
```

当访问任何节点上的端口8080时，Docker会将请求路由到活动容器。在swarm节点本身上，端口8080实际上可能没有被绑定，但是路由网格知道如何路由通行并防止任何端口冲突的发生。

路由网格在发布的端口上侦听分配给节点的任何IP地址。对于外部可路由的IP地址，端口可从主机外部获得。对于所有其他IP地址，只能从主机内部访问。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-8.png)

可以使用以下命令发布现有服务的端口：

```shell
$ docker service update \
  --publish-add published=<PUBLISHED-PORT>,target=<CONTAINER-PORT> \
  <SERVICE>
```

您可以使用`docker service inspect`查看服务的已发布端口。例如：

```shell
$ docker service inspect --format="{{json .Endpoint.Spec.Ports}}" my-web

[{"Protocol":"tcp","TargetPort":80,"PublishedPort":8080}]
```

输出显示来自容器的`<CONTAINER-PORT>`（标记为TargetPort）和节点侦听服务请求的`<PUBLISHED-PORT>`（标记为PublishedPort）。

**仅为TCP或UDP发布端口**

默认情况下，发布端口时，它是TCP端口。可以专门发布UDP端口而不是TCP端口，也可以在TCP端口之外发布。发布TCP和UDP端口时，如果省略协议说明符，则该端口将发布为TCP端口。如果使用较长的语法（推荐），请将协议密钥设置为tcp或udp。

**仅为TCP**

长语法：

```shell
$ docker service create --name dns-cache \
  --publish published=53,target=53 \
  dns-cache
```

短语法：

```shell
$ docker service create --name dns-cache \
  -p 53:53 \
  dns-cache
```

**TCP和UDP**

长语法：

```shell
$ docker service create --name dns-cache \
  --publish published=53,target=53 \
  --publish published=53,target=53,protocol=udp \
  dns-cache
```

短语法：

```shell
$ docker service create --name dns-cache \
  -p 53:53 \
  -p 53:53/udp \
  dns-cache
```

**仅为UDP**

长语法：

```shell
$ docker service create --name dns-cache \
  --publish published=53,target=53,protocol=udp \
  dns-cache
```

短语法：

```shell
$ docker service create --name dns-cache \
  -p 53:53/udp \
  dns-cache
```



**绕过路由网格**

可以绕过路由网格，以便在访问给定节点上的绑定端口时，始终访问该节点上运行的服务实例。这称为主机模式。有几件事要记住。

- 如果访问的节点未运行服务任务，则服务不会侦听该端口。有可能是什么都没有在侦听，或者是一个完全不同的应用程序正在侦听。
- 如果希望在每个节点上运行多个服务任务（例如当有5个节点但运行10个副本时），则不能指定静态目标端口。允许Docker分配一个随机的高编号端口（不使用已发布的端口），或者通过使用全局服务而不是复制的服务，或者通过使用放置约束，确保只有一个服务实例在给定节点上运行。

要绕过路由网格，必须使用长语法`--publish`服务并将`mode`设置为`host`。如果省略`mode`键值或将其设置为`ingress`，则使用路由网格。下面的命令使用主机模式创建全局服务并绕过路由网格。

```shell
$ docker service create --name dns-cache \  --publish published=53,target=53,protocol=udp,mode=host \  --mode global \  dns-cache
```



**配置外部负载平衡器**

可以为swarm服务配置外部负载均衡器，可以与路由网格结合使用，也可以完全不使用路由网格。

- 使用路由网格

  可以配置外部负载平衡器将请求路由到swarm服务。例如，可以配置HAProxy来平衡对发布到端口8080的nginx服务的请求。

  ![img](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-9.png)

在这种情况下，端口8080必须在负载平衡器和群中的节点之间打开。swarm节点可以驻留在代理服务器可访问但不可公开访问的专用网络上。

您可以将负载均衡器配置为在集群中的每个节点之间平衡请求，即使节点上没有计划任务。例如，您可以在`/etc/HAProxy/HAProxy.cfg`中具有以下HAProxy配置：

```shell
global
        log /dev/log    local0
        log /dev/log    local1 notice
...snip...

# Configure HAProxy to listen on port 80
frontend http_front
   bind *:80
   stats uri /haproxy?stats
   default_backend http_back

# Configure HAProxy to route requests to swarm nodes on port 8080
backend http_back
   balance roundrobin
   server node1 192.168.99.100:8080 check
   server node2 192.168.99.101:8080 check
   server node3 192.168.99.102:8080 check
```

当访问端口80上的HAProxy负载平衡器时，它会将请求转发给swarm中的节点。swarm路由网格将请求路由到活动任务。如果swarm调度器出于任何原因将任务分派到不同的节点，则不需要重新配置负载平衡器。

您可以配置任何类型的负载平衡器将请求路由到swarm节点。要了解有关HAProxy的更多信息，请参阅 [HAProxy documentation](https://cbonte.github.io/haproxy-dconv/)。



**没有路由网格**

要使用没有路由网格的外部负载平衡器，将`--endpoint mode`设置为`dnsrr`，而不是`vip`的默认值。在这种情况下，没有单个虚拟IP。相反，Docker为服务设置DNS条目，以便对服务名称的DNS查询返回IP地址列表，并且客户端直接连接到其中一个。您负责向负载平衡器提供IP地址和端口的列表。请参阅[Configure service discovery](https://docs.docker.com/engine/swarm/networking/#configure-service-discovery)。



### 概念总结

- **swarm**

  集群的管理和编号。docker可以初始化一个swarm集群，其他节点可以加入。（管理者、工作者）

- **Node**

  就是一个docker节点。多个节点就组成了一个网络集群。（管理者、工作者）

- **Service**

  任务，可以在管理节点或者工作节点来运行。核心，用户访问的服务。

- **Task**

  容器内的命令，细节任务。


![image-20210520230135055.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-10.png)



## Docker Stack

Docker Stack学习笔记引用地址：https://www.cnblogs.com/hhhhuanzi/p/12273249.html

### 简介

Docker Stack 是为了解决大规模场景下的多服务部署和管理，提供了`期望状态`，`滚动升级`，`简单易用`，`扩缩容`，`健康检查`等特性，并且都封装在一个声明式模型当中。

- Docker Stack 部署应用的生命周期：`初始化部署 > 健康检查 > 扩容 > 更新 > 回滚`。
- 使用单一声明式文件即可完成部署，即只需要`docker-stack.yml`文件，使用`docker stack deploy`命令即可完成部署。
- stack 文件其实就是 Docker compose 文件，唯一的要求就是 version 需要为 3.0 或者更高的值。
- Stack 完全集成到了 Docker 中，不像 compose 还需要单独安装。

**Docker 适用于开发和测试，而 Docker Stack 则适用于大规模场景和生产环境**



### Docker-stack.yml文件详解

从 GitHub 中拉取示例代码，分析其中的 `docker-stack.yml` 文件

```shell
git clone https://github.com/dockersamples/atsea-sample-shop-app.git
```

可以看到有 5 个服务，3 个网络，4 个秘钥，3 组端口映射；

```yaml
services:
  reverse_proxy:
  database:
  appserver:
  visualizer:
  payment_gateway:
networks:
  front-tier:
  back-tier:
  payment:
secrets:
  postgres_password:
  staging_token:
  revprox_key:
  revprox_cert:
```

#### 网络

Docker 根据 stack 文件部署的时候，第一步会检查并创建 `networks：关键字`对应的网络。默认会创建覆盖网络（overlay），并且控制层会加密，如果需要对数据层加密，可以在 stack 文件的 driver_opts 之下指定 encrypted:'yes'，数据层加密会导致额外开销，但是一般不会超过10%。

```yaml
networks:
  front-tier:
  back-tier:
  payment:
    driver: overlay
    driver_opts:
      encrypted: 'yes'
```

**3 个网络都会先于秘钥和服务被创建**

#### 密钥

当前 Stack 文件中定义了 4 个秘钥，并且都是`external`，这表示在 Stack 部署前，这些秘钥必须已存在

```yaml
secrets:
  postgres_password:
    external: true
  staging_token:
    external: true
  revprox_key:
    external: true
  revprox_cert:
    external: true
```

#### 服务

总共有 5 个服务，我们依次进行分析

1. `reverse_proxy` 服务

   ```yaml
   reverse_proxy:
       image: dockersamples/atseasampleshopapp_reverse_proxy
       ports:
         - "80:80"
         - "443:443"
       secrets:
         - source: revprox_cert
           target: revprox_cert
         - source: revprox_key
           target: revprox_key
       networks:
         - front-tier
   ```

   - `image`：必填项，指定了用于构建服务副本的 Docker 镜像
   - `ports`：Swarm 节点的 80 端口映射到副本的 80 端口，443 端口映射到副本的 443 端口
   - `secrets`：2 个秘钥以普通文件形式挂载至服务副本中，文件名称就是 target 属性的值，路径为`/run/secrets`
   - `networks`：所有副本都会连接到 front-tier 网络，如果定义的网络不存在，Docker 会以 Overlay 的网络方式新建一个

2. `database` 服务

   ```yaml
   database:    image: dockersamples/atsea_db    environment:      POSTGRES_USER: gordonuser      POSTGRES_DB_PASSWORD_FILE: /run/secrets/postgres_password      POSTGRES_DB: atsea    networks:      - back-tier    secrets:      - postgres_password    deploy:      placement:        constraints:          - 'node.role == worker'
   ```

   多了以下几项：

   - `environment`：环境变量，定义了数据库用户，密码位置，数据库名称
   - `deploy`：部署约束，服务只运行在 Swarm 集群的 Worker 节点上

   Swarm 目前允许以下几种部署约束方式：

   - 节点 ID ：`node.id == 85v90bioyy4s2fst4fa5vrlvf`
   - 节点名称：`node.hostname == huanzi-002`
   - 节点角色：`node.role != manager`
   - 节点引擎标签：`engine.labels.operatingsystem == Centos 7.5`
   - 节点自定义标签：`node.labels.zone == test01`

   支持`==`和`!=`操作。

3. `appserver` 服务

   ```yaml
   appserver:
       image: dockersamples/atsea_app
       networks:
         - front-tier
         - back-tier
         - payment
       deploy:
         replicas: 2
         update_config:
           parallelism: 2
           failure_action: rollback
         placement:
           constraints:
             - 'node.role == worker'
         restart_policy:
           condition: on-failure
           delay: 5s
           max_attempts: 3
           window: 120s
       secrets:
         - postgres_password
   ```

   - `deploy-replicas`：部署的服务副本数量
   - `deploy-update_config`：滚动升级时的操作，每次更新 2 个副本（parallelism：2），升级失败以后回滚（failure_action: rollback）
   - `failure_action`默认为 pause ，即服务升级失败后阻止其它副本的升级，还支持 continue
   - `restart_policy`：容器异常退出的重启策略，当前策略为：如果某个副本以非 0 返回值退出（condition: on-failure），会立即重启当前副本，重启最多重试 3 次，每次最多等待 120s，每次重启间隔是 5s。

4. `visualizer` 服务

   ```yaml
   visualizer:
       image: dockersamples/visualizer:stable
       ports:
         - "8001:8080"
       stop_grace_period: 1m30s
       volumes:
         - "/var/run/docker.sock:/var/run/docker.sock"
       deploy:
         update_config:
           failure_action: rollback
         placement:
           constraints:
             - 'node.role == manager'
   ```

   - `stop_grace_period`：设置容器优雅停止时长（Docker 停止某个容器时，会给容器内 PID 为 1 的进程发送一个 SIGTERM 信号，容器内 PID 为 1 的进程有 10s 的优雅停止时长来执行清理操作）
   - `volumes`：挂载提前创建的卷或者主机目录至某个服务副本中，本例中`/var/run/docker.sock`为Docker 的 IPC 套接字，Docker daemon 通过该套接字对其它进程暴露 API 终端，如果某个容器有该文件的访问权限，即允许该容器访问所有的 API 终端，并且可以查询及管理 Docker daemon。**生产环境严禁使用该操作**

5. `payment_gateway` 服务

   ```yaml
   payment_gateway:
       image: dockersamples/atseasampleshopapp_payment_gateway
       secrets:
         - source: staging_token
           target: payment_token
       networks:
         - payment
       deploy:
         update_config:
           failure_action: rollback
         placement:
           constraints:
             - 'node.role == worker'
             - 'node.labels.pcidss == yes'
   ```

   `node.labels`：自定义节点标签，可以通过`docker node update`自定义，并添加至 Swarm 集群的指定节点。这说明，node.labels 配置只适用于 Swarm 集群中指定的节点。



### 部署docker stack

#### 准备工作

- 自定义标签（payment_gateway 服务需要用到）
- 密钥（提前创建 4 个）

给工作节点 huanzi-002 新建一个自定义标签，在管理节点上操作

```shell
[root@huanzi-001 atsea-sample-shop-app]# docker node ls
ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
8bet9fg0tnoqlfp0ebrrqdapn *   huanzi-001          Ready               Active              Leader              19.03.5
85v90bioyy4s2fst4fa5vrlvf     huanzi-002          Ready               Active                                  19.03.5
8hxs2p5iblj19xg9uqpu8ar8g     huanzi-003          Ready               Active                                  19.03.5
[root@huanzi-001 atsea-sample-shop-app]# docker node update --label-add pcidss=yes huanzi-002
huanzi-002
[root@huanzi-001 atsea-sample-shop-app]# docker node inspect huanzi-002
[
    {
        "ID": "85v90bioyy4s2fst4fa5vrlvf",
        "Version": {
            "Index": 726
        },
        "CreatedAt": "2020-02-02T08:11:34.982719258Z",
        "UpdatedAt": "2020-02-06T10:22:25.44331302Z",
        "Spec": {
            "Labels": {
                "pcidss": "yes"
        <...>
```

可以看到自定义标签已经成功创建。

接下来创建密钥，先创建加密 key

```shell
[root@huanzi-001 daemon]# openssl req -newkey rsa:4096 -nodes -sha256 -keyout damain.key -x509 -days 365 -out domain.crt
Generating a 4096 bit RSA private key
....................................++
...........................................++
writing new private key to 'damain.key'
-----
<...>
Country Name (2 letter code) [XX]:
State or Province Name (full name) []:
Locality Name (eg, city) [Default City]:
Organization Name (eg, company) [Default Company Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (eg, your name or your server's hostname) []:
Email Address []:
[root@huanzi-001 daemon]# ls
atsea-sample-shop-app  damain.key  domain.crt
```

创建需要加密 key 的`revprox_cert`，`revprox_key`，`postgres_password`这 3 个密钥

```shell
[root@huanzi-001 daemon]# docker secret create revprox_cert domain.crt 
lue5qk6ophxrr6aspyhnkhvsv
[root@huanzi-001 daemon]# docker secret create revprox_key damain.key 
glvfk78kn6665lmkci7tslrw6
[root@huanzi-001 daemon]# docker secret create postgres_password damain.key 
pxdfs28hb2897xuu7f3bub7ex
```

创建不需要加密 key 的`staging_token`密钥

```shell
[root@huanzi-001 daemon]# echo staging | docker secret create staging_token -
cyqfn9jocvnxd2vr57gn5pioj
[root@huanzi-001 daemon]# docker secret ls
ID                          NAME                DRIVER              CREATED              UPDATED
pxdfs28hb2897xuu7f3bub7ex   postgres_password                       15 minutes ago       15 minutes ago
lue5qk6ophxrr6aspyhnkhvsv   revprox_cert                            16 minutes ago       16 minutes ago
glvfk78kn6665lmkci7tslrw6   revprox_key                             16 minutes ago       16 minutes ago
cyqfn9jocvnxd2vr57gn5pioj   staging_token                           About a minute ago   About a minute ago
```

现在自定义标签，及密钥全部创建完毕。

#### 开始部署

命令：`docker stack deploy -c <docker-stack.yml> <stack name>`

```shell
[root@huanzi-001 atsea-sample-shop-app]# docker stack deploy -c docker-stack.yml huanzi-stack
Creating network huanzi-stack_front-tier
Creating network huanzi-stack_back-tier
Creating network huanzi-stack_default
Creating network huanzi-stack_payment
Creating service huanzi-stack_payment_gateway
Creating service huanzi-stack_reverse_proxy
Creating service huanzi-stack_database
Creating service huanzi-stack_appserver
Creating service huanzi-stack_visualizer
```

可以看出，先创建了 4 个网络，再创建的服务，我们验证一下网络是否创建了

```bash
[root@huanzi-001 atsea-sample-shop-app]# docker network ls
NETWORK ID          NAME                      DRIVER              SCOPE
34306420befb        bridge                    bridge              local
ac57c15024c7        docker_gwbridge           bridge              local
e863472805b3        host                      host                local
ojt9cxg2qsxe        huanzi-net                overlay             swarm
o74roe621idx        huanzi-stack_back-tier    overlay             swarm
k55m237m11ct        huanzi-stack_default      overlay             swarm
idpvc5xg2g2t        huanzi-stack_front-tier   overlay             swarm
uvphcut0a825        huanzi-stack_payment      overlay             swarm
7d6iv5ilwbcn        ingress                   overlay             swarm
d302c895b455        lovehuanzi                bridge              local
eefd134326c4        none                      null                local
```

看到了 4 个 `huanzi-stack` 前缀的网络。为什么多了一个`huanzi-stack-default`,因为`visualizer` 服务没有指定网络，因此 Docker 创建了一个 defalut 的网络给它用。

再验证下服务

```shell
root@huanzi-001 atsea-sample-shop-app]# docker stack ls
NAME                SERVICES            ORCHESTRATOR
huanzi-stack        5                   Swarm
```

```shell
[root@huanzi-001 atsea-sample-shop-app]# docker stack ps huanzi-stack 
ID                  NAME                             IMAGE                                                     NODE                DESIRED STATE       CURRENT STATE             ERROR               PORTS
ex55yaz21mra        huanzi-stack_appserver.1         dockersamples/atsea_app:latest                            huanzi-003          Running             Preparing 2 minutes ago                       
jshmzquzxi8p        huanzi-stack_database.1          dockersamples/atsea_db:latest                             huanzi-002          Running             Preparing 2 minutes ago                       
k7mi1419ahwd        huanzi-stack_reverse_proxy.1     dockersamples/atseasampleshopapp_reverse_proxy:latest     huanzi-003          Running             Preparing 2 minutes ago                       
09ocoutjfc70        huanzi-stack_payment_gateway.1   dockersamples/atseasampleshopapp_payment_gateway:latest   huanzi-002          Running             Preparing 2 minutes ago                       
y6lftn8g95b8        huanzi-stack_visualizer.1        dockersamples/visualizer:stable                           huanzi-001          Running             Preparing 2 minutes ago                       
5twm1k4uj5ps        huanzi-stack_appserver.2         dockersamples/atsea_app:latest                            huanzi-002          Running             Preparing 2 minutes ago    
```

可以看到满足 stack 文件的要求：

- `reverse_proxy`：副本数量 `1`
- `database`：副本数量 `1`，位于`worker`
- `appserver`：副本数量 `2`，位于`worker`
- `visualizer`：副本数量 `1`，位于`manager`
- `payment_gateway`：副本数量 `1`，位于`worker`，自定义标签`pcidss == yes`（即 huanzi-002 ）

#### 管理Stack

1. 扩容

   将`appserver`的副本数从 2 扩至 10，有 2 种方式：

   - 通过`docker service scale appserver=10`
   - 直接修改`docker-stack.yml`文件，再通过`docker stack deploy`重新部署

   **所有的变更都应该通过 Stack 文件进行声明，然后通过 docker stack deploy 进行部署**

   修改`docker-stack.yml`文件

   ```yaml
   appserver:
       image: dockersamples/atsea_app
       networks:
         - front-tier
         - back-tier
         - payment
       deploy:
         replicas: 10
   ```

   重新部署

   ```bash
   [root@huanzi-001 atsea-sample-shop-app]# docker stack deploy -c docker-stack.yml huanzi-stack 
   Updating service huanzi-stack_reverse_proxy (id: i2yn8l50ofnmbx0a55mum1dw0)
   Updating service huanzi-stack_database (id: ubrtixblmj685pnc97wql42cm)
   Updating service huanzi-stack_appserver (id: yy447jdp1eiwb03ljdsqtyg1g)
   Updating service huanzi-stack_visualizer (id: rhzzxov0jh1y38rxcj6bwe89y)
   Updating service huanzi-stack_payment_gateway (id: niobpxv5vr1njoo37vnje8zic)
   ```

   查看重新部署的stack

   ```shell
   docker stack ps huanzi-stack 
   ```

   扩容完成。

2. 删除

   命令：`docker stack rm <stack name>`

   ```bash
   [root@huanzi-001 atsea-sample-shop-app]# docker stack rm huanzi-stack 
   Removing service huanzi-stack_appserver
   Removing service huanzi-stack_database
   Removing service huanzi-stack_payment_gateway
   Removing service huanzi-stack_reverse_proxy
   Removing service huanzi-stack_visualizer
   Removing network huanzi-stack_front-tier
   Removing network huanzi-stack_default
   Removing network huanzi-stack_back-tier
   Removing network huanzi-stack_payment
   ```

   可以看出，`rm`会删除服务及网络，但是密钥和卷不会删除

   ```shell
   root@huanzi-001 atsea-sample-shop-app]# docker secret lsID                          NAME                DRIVER              CREATED             UPDATEDpxdfs28hb2897xuu7f3bub7ex   postgres_password                       53 minutes ago      53 minutes agolue5qk6ophxrr6aspyhnkhvsv   revprox_cert                            55 minutes ago      55 minutes agoglvfk78kn6665lmkci7tslrw6   revprox_key                             54 minutes ago      54 minutes agocyqfn9jocvnxd2vr57gn5pioj   staging_token                           40 minutes ago      40 minutes ago
   ```

   一般一个环境需要一个stack文件。比如dev，test，prod。



## Docker Secret

文章引用：https://www.cnblogs.com/shenjianping/p/12272847.html

### 什么是Docker Secret

1. 情景展现

   我们知道有的service是需要设置密码的，比如mysql服务是需要设置密码的：

   ```yaml
   version: '3'
   services:
     web:
       image: wordpress
       ports:
         - 8080:80
       volumes:
         - ./www:/var/www/html
       environment:
         WORDPRESS_DB_NAME=wordpress
         WORDPRESS_DB_HOST: mysql
         WORDPRESS_DB_PASSWORD: root
       networks:
         - my-network
       depends_on:
         - mysql
       deploy:
         mode: replicated
         replicas: 3
         restart_policy:
           condition: on-failure
           delay: 5s
           max_attempts: 3
         update_config:
           parallelism: 1
           delay: 10s
     mysql:
       image: mysql
       environment:
         MYSQL_ROOT_PASSWORD: root
         MYSQL_DATABASE: wordpress
       volumes:
         - mysql-data:/var/lib/mysql
       networks:
         - my-network
       deploy:
         mode: global
         placement:
           constraints:
             - node.role == manager
   volumes:
     mysql-data:
   networks:
     my-network:
       driver: overlay
   ```

   可以看到在这个docker-compose.yml中的两个service密码都是明文，这样就导致了不是很安全，那么究竟什么是Docker secret以及能否解决上面的问题呢？

2. Docker Secret

   ![image](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-10.png)

   ​	我们知道manager节点保持状态的一致是通过Raft Database这个分布式存储的数据库，它本身就是将信息进行了secret，所以可以利用这个数据库将一些敏感信息，例如账号、密码等信息保存在这里，然后通过给service授权的方式允许它进行访问，这样达到避免密码明文显示的效果。

   ​	总之，secret的Swarm中secret的管理通过以下步骤完成：

   - secret存在于Swarm Manager节点的的Raft Database里
   - secret可以assign给一个service，然后这个service就可以看到这个secret
   - 在container内部secret看起来像文件，实际上就是内存

### Docker Secret的创建与使用

#### 创建

Secret的创建有两种方式，分别是：

- 基于文件的创建
- 基于命令行创建

1. 基于文件创建

   首先先创建一个文件用于存放密码

   ```shell
   [root@centos-7 ~]# vim mysql-password
   root
   ```

   然后再进行创建secret

   ```shell
   [root@centos-7 ~]# docker secret create mysql-pass mysql-password 
   texcct9ojqcz6n40woe97dd7k
   ```

   其中，mysql-pass是secret的名称，mysql-password是我们建立存储密码的文件，这样执行后就相当于将文件中的密码存储在Swarm中manager节点的Raft Database中了。为了安全起见，现在可以直接将这个文件删掉，因为Swarm中已经有这个密码了。

   ```shell
   [root@centos-7 ~]# rm -f mysql-password 
   ```

   现在可以查看一下secret列表：

   ```shell
   [root@centos-7 ~]# docker secret ls
   ID                          NAME                DRIVER              CREATED             UPDATED
   texcct9ojqcz6n40woe97dd7k   mysql-pass                              4 minutes ago       4 minutes ago
   ```

   已经存在了。

2. 基于命令行创建

   ```shell
   [root@centos-7 ~]# echo "root" | docker secret create mysql-pass2 -hrtmn5yr3r3k66o39ba91r2e4[root@centos-7 ~]# docker secret lsID                          NAME                DRIVER              CREATED             UPDATEDtexcct9ojqcz6n40woe97dd7k   mysql-pass                              6 minutes ago       6 minutes agohrtmn5yr3r3k66o39ba91r2e4   mysql-pass2                             5 seconds ago       5 seconds ago
   ```

   这种方式还是很简单的就创建成功了

#### 其他操作

1. inspect

   展示secret的一些详情信息

   ```shell
   [root@centos-7 ~]# docker secret inspect mysql-pass2
   [
       {
           "ID": "hrtmn5yr3r3k66o39ba91r2e4",
           "Version": {
               "Index": 4061
           },
           "CreatedAt": "2020-02-07T08:39:25.630341396Z",
           "UpdatedAt": "2020-02-07T08:39:25.630341396Z",
           "Spec": {
               "Name": "mysql-pass2",
               "Labels": {}
           }
       }
   ]
   ```

2. rm

   删除一个secret

   ```shell
   [root@centos-7 ~]# docker secret rm  mysql-pass2
   mysql-pass2
   [root@centos-7 ~]# docker secret ls
   ID                          NAME                DRIVER              CREATED             UPDATED
   texcct9ojqcz6n40woe97dd7k   mysql-pass                              12 minutes ago      12 minutes ago
   ```

#### Secret在单容器中的使用

1. 容器中查看secret

   我们创建了一个secret，如何在启动一个服务后，将其授权给特定的服务然后它才可以看到呢？先看看创建服务的命令中是否有类似的命令或者参数：

   ```shell
   [root@centos-7 ~]# docker service create --help
   
   Usage:    docker service create [OPTIONS] IMAGE [COMMAND] [ARG...]
   
   Create a new service
   
   Options:
         --config config                      Specify configurations to expose to the service
   ...
    --secret secret                      Specify secrets to expose to the service
   ...
   ...
   ```

   确实是有这样的命令，在创建服务时可以给服务暴露出secret。

2. 创建服务

   ```shell
   [root@centos-7 ~]# docker service create --name demo --secret mysql-pass busybox sh -c "while true; do sleep 3600; done"
   zwgk5w0rpf17hn77axz6cn8di
   overall progress: 1 out of 1 tasks 
   1/1: running   
   verify: Service converged 
   ```

   查看这个服务运行在那个节点上：

   ```shell
   [root@centos-7 ~]# docker service ls
   ID                  NAME           MODE                REPLICAS            IMAGE               PORTS
   zwgk5w0rpf17        demo           replicated          1/1                 busybox:latest      
   [root@centos-7 ~]# docker service ps demo
   ID                  NAME           IMAGE    NODE         DESIRED STATE       CURRENT STATE     ERROR  PORTS
   yvr9lwvg8oca        demo.1        busybox:latest      localhost.localdomain   Running   Running 51 seconds ago  
   ```

   可以看到这个服务运行在localhost.localdomain主机的节点上，我们去这个节点上进入到容器内部，看是否能查看secret：

   ```shell
   [root@localhost ~]# docker ps
   CONTAINER ID    IMAGE               COMMAND           CREATED             STATUS    PORTS               NAMES
   36573adf21f6  busybox:latest   "sh -c 'while true; …"4 minutes ago   Up 4 minutes  demo.1.yvr9lwvg8ocatym20hdfublhd
   [root@localhost ~]# docker exec -it 36573adf21f6 /bin/sh
   / # ls
   bin   dev   etc   home  proc  root  run   sys   tmp   usr   var
   / # cd /run/secrets
   /run/secrets # ls
   mysql-pass
   /run/secrets # cat mysql-pass 
   root
   /run/secrets # 
   ```

   可以看到确实是可行的。

#### Secret在Stack中的使用

Stack利用的就是docker-compose.yml文件来部署stack，那么如何在docker-compose.yml中来定义secret呢？

```yaml
version: '3'

services:

  web:
    image: wordpress
    ports:
      - 8080:80
    secrets:
      - my-pw
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_PASSWORD_FILE: /run/secrets/wordpress-pass
    networks:
      - my-network
    depends_on:
      - mysql
    deploy:
      mode: replicated
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s

  mysql:
    image: mysql
    secrets:
      - my-pw
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql-pass
      MYSQL_DATABASE: wordpress
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - my-network
    deploy:
      mode: global
      placement:
        constraints:
          - node.role == manager

volumes:
  mysql-data:

networks:
  my-network:
    driver: overlay
```

上面通过在environment中定义WORDPRESS_DB_PASSWORD_FILE以及MYSQL_ROOT_PASSWORD_FILE来制定secret，显然我们在运行这个docker-compose.yml文件之前必须先要进行对应的secret文件的创建。然后就可以通过docker stack deploy命令来部署这个stack了。



## Docker Config

官方文档：https://docs.docker.com/engine/reference/commandline/config/
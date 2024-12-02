---
title: GitLab CICD
tags:
  - 笔记
  - 学习
  - CI/CD
  - gitlab
createTime: 2021/10/11
permalink: /article/osv0e5cb/
---
# GitLab CI/CD

## Docker安装gitlab-runner

```shell
$ docker run -d --name gitlab-runner --restart always \
     -v /srv/gitlab-runner/config:/etc/gitlab-runner \
     -v /var/run/docker.sock:/var/run/docker.sock \
     gitlab/gitlab-runner:latest
```

可以在运行runner时暴露一个端口，用于在gitlab流水线上直接debug：

```shell
$ docker run -d --name gitlab-runner -p 8081:8081 --restart always \
     -v /srv/gitlab-runner/config:/etc/gitlab-runner \
     -v /var/run/docker.sock:/var/run/docker.sock \
     gitlab/gitlab-runner:latest
```

运行后需要修改runner的配置文件`/srv/gitlab-runner/config/config.toml`：

```toml
[session_server]
	listen_address = "[::]:8081"
	advertise_address = "IP:8081"
	session_timeout = 1800
[runners.docker]
	volumes = ["/cache","/usr/bin/docker:/usr/bin/docker","/var/run/docker.sock:/var/run/docker.sock"]
	pull_policy = "if-not-present"
```

## 进入gitlab-runner

```bash
$ docker exec -it gitlab-runner bash
```

### 查看runners的状态

```bash
$ gitlab-runner status
```

### 重启runners

```bash
$ gitlab-runner run
```

## 注册gitlab-runner

```shell
$ docker exec -it gitlab-runner gitlab-runner register
```

执行后需要依次输入提示信息

其中url和token可以在gitlab项目设置里面找到

![image.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-12.png)

## .gitlab-ci.yml

- **stages**

  全局自定义阶段

  ```yaml
  stages:
  	- stage1
  	- stage2
  	- stage3
  ```

- **script**

  shell脚本

  ```yaml
  job1:
  	stage: stage1
  	script: "echo 'this is job1'"
  	
  job2:
  	stage: stage2
  	script:
  		- echo "this is job2"
  		- echo "this is job2 too"
  ```

- **stage**

  任务内的阶段，必须从全局阶段中选

  ```yaml
  job1:
  	stage: stage1
  	script: "echo 'this is stage1'"
  ```

- **retry**

  失败后的重试次数（0不会重试，2最多重试2次）

  when：当什么时候重试

  ```yaml
  test:
  	script: rspec
  	retry: 0
  test:
  	script: rspec
  	retry:
  		max: 2
  		when:
  			- runner_system_failure
  			- syuck_or_timeout_failure
  ```

- **image**

  指定一个基础Docker镜像作为基础运行环境，经常用到的镜像有node java python docker

- **tags**

  tags关键字是用于指定Runner，tags的取值范围是在该项目可见的runner tags中

- **only/except**

  限定当前任务执行的条件

- **when**

  when关键字是实现在发生故障或尽管发生故障仍能运行的作业

- **cache**

  是将当前工作环境目录中的一些文件，一些文件夹存储起来，用于在各个任务初始化的时候恢复

- **variables**

  设置变量的三种方式：

  - 在.gitlab-ci.yml中自己定义
  - 使用pipeline中预定义的变量
  - 设置在CICD中设置变量

- **interruptible**

  默认为false，可以设置为true，会自动取消旧的正在运行的流水线（需要在设置中CI/CD设置**Auto-cancel redundant pipelines**）

- **timeout**

  设置超时时间

- **rousource_group**

  限定分支的部署任务数量只能有一个，其他新的流水线会进入等待状态



一个前端自动部署的例子：

```yaml
image: node:alpine

stages:
	- install
	- build
	- deploy

cache:
	key: modules-cache
	paths:
		- node_modules

job_install:
	stage: install
	tags: 
	 - dockercicd
	script:
		- npm install
	interruptible: true
	rouscource: prod
		
job_build:
	stage: build
	tags: 
	 - dockercicd
	script:
		- npm run build
	only:
		- release # 只在release分支执行
	interruptible: true
	rouscource: prod
		
job_deplot:
	stage: deploy
	variables:
		WEB_NAME:"web-image"
	image: docker
	tags: 
	 - dockercicd
	script:
		- docker build -t $WEB_NAME . # 当前项目目录下写了Dockerfile 执行生成镜像 Dockerfile如下
		- if [ $(docker ps -aq --filter name=$WEB_NAME) ];then docker rm -f $WEB_NAME;fi
		- docker run -d -p 8082:80 $WEB_NAME
	when: manual # 手动执行任务
	interruptible: true
	rouscource: prod
```

```dockerfile
FROM node:lastest as builder
WORKDIR /app
COPY package.json .
RUN npm install --registry=http://registry.npm.taobao.org
COPY . .
RUN npm run build

FROM nginx:lastest
COPY --from=builder /app/dist /usr/share/nginx/html
```

## CI/CD相关设置

### 取消默认的邮件提醒

![image-20210621130239524.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-13.png)

### 流水线没有权限触发

`Pipeline failed due to the user not being verified`

![image-20210621130443174.png](https://file.40017.cn/baoxian/health/health_public/images/blog/blog-14.png)

这个问题比较奇葩，网上找了很久才在外网找到问题所在，是因为默认启用了允许使用共享tags导致需要验证身份的问题。

这里我选择直接关闭，同样是在获取token那个页面。



## 流水线

- 基本流水线

- DAG流水线

  ```yaml
  stages:
  	- build
  	- test
  	- deploy
  
  image: alpine
  
  build_a:
  	stage: build
  	script:
  		- echo "this job builds something quickly"
  
  build_b:
  	stage: build
  	script:
  		- echo "this job builds something slowly"
  		
  test_a:
  	stage: test
  	need: [build_a]
  	script:
  		- echo "this test job will start as soon as build_a finished"
  		- echo "it will not wait for build_b,or other jobs in the build stage,to finished"
  		
  test_b:
  	stage: test
  	need: [build_b]
  	script:
  		- echo "this test job will start as soon as build_b finished"
  		- echo "it will not wait for build_b,or other jobs in the build stage,to finished"
  		
  deploy_a:
  	stage: deploy
  	need: [test_a]
  	script:
  		- echo "Since build_a and test_a run quickly,this deploy job can run much earlier"
  		- echo "it dose not need to wait for build_b or test_b"
  ```

- 父子流水线

  ```yaml
  stages:
  	- test
  	- triggers
  	- deploy
  	
  testjob:
  	stage: test
  	script: echo 'test job'
  	
  trigger_a:
  	stage: triggers
  	trigger:
  		include: a/.gitlab-ci.yml
  	rules:
  		- changes:
  			- a/*
  
  trigger_b:
  	stage: triggers
  	trigger:
  		include: b/.gitlab-ci.yml
  	rules:
  		- changes:
  			- b/*
  ```

- 多项目流水线

  ```yaml
  stages:
  	- test
  	- triggers
  	- deploy
  	
  testjob:
  	stage: test
  	script: echo 'test job'
  	
  trigger_a:
  	stage: triggers
  	trigger:
  		include: a/.gitlab-ci.yml
  	rules:
  		- changes:
  			- a/*
  
  trigger_b:
  	stage: triggers
  	trigger:
  		include: b/.gitlab-ci.yml
  	rules:
  		- changes:
  			- b/*
  			
  trigger_c:
  	stage: deploy
  	trigger:
  		project: root/pain_html
  		branch: master
  		stategy: depend
  ```

- 合并请求流水线

  ```yaml
  image: node:alpine
  
  stages:
  	- install
  	- build
  	- deploy
  
  cache:
  	key: modules-cache
  	paths:
  		- node_modules
  
  job_install:
  	stage: install
  	tags: 
  	 - dockercicd
  	script:
  		- npm install
  		
  job_build:
  	stage: build
  	tags: 
  	 - dockercicd
  	script:
  		- npm run build
  	only:
  		- merge_requests # 只在merge时执行
  ```

## 流水线的触发

- 推送代码
- 定时触发
- url触发
- 手动触发

## vue项目实战 .gitlab-ci.yml

```yaml
stages: 
  - package
  - build
  - deploy
my_package:
  image: 192.168.100.150/tools/node-git:10-alpine
  stage: package
  script:
    - npm install --registry=https://registry.npm.taobao.org
    - npm run build:prod
    - cp Dockerfile dist/Dockerfile
  cache:
    key: ${CI_PIPELINE_ID}
    paths: 
      - dist/
  only:
    - master
  tags:
   - runInDk
my_build:
  stage: build
  cache:
    key: ${CI_PIPELINE_ID}
    paths: 
      - dist/
  script:
    - cd dist
    - docker build -t 192.168.88.4:5000/${CI_PROJECT_NAME}:${CI_PIPELINE_ID} .
    - docker push 192.168.88.4:5000/${CI_PROJECT_NAME}:${CI_PIPELINE_ID}
  tags:
    - runInDk
my_deploy:
  stage: deploy
  script:
    - docker stop ${CI_PROJECT_NAME} && docker rm ${CI_PROJECT_NAME}
    - docker run -d -p 8080:80 --restart=always --name=${CI_PROJECT_NAME} 192.168.88.4:5000/${CI_PROJECT_NAME}:${CI_PIPELINE_ID}
  tags:
    - runInDk
```
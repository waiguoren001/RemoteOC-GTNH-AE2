
<p align="center">
  <img src="assets/gtnh.png" width="200" height="200" alt="gtnh">
  <img src="assets/oc.png" width="200" height="200" alt="oc">
</p>

<h1 align="center" style="font-size: 38px;">赛博监工</h1>
<h3 align="center">AE2 Control for GTNH 2.7.0</h3>


## 简介

该项目是一个基于[OpenComputers](https://github.com/MightyPirates/OpenComputers)的GTNH-AE2的远程控制系统，主要用于监控AE2网络、物品、流体、CPU、任务等信息，以及支持远程下单、查看任务等功能。


该项目基于[RemoteOC](https://github.com/z5882852/RemoteOC)框架开发，需要一台**可公网访问的主机**作为服务器，以及一台或多台OpenComputers电脑作为客户端。


## 功能

- 支持查看AE2网络内的物品、流体信息
- 支持查看CPU状态
- 支持远程下单
- 支持自动化流程
- 支持监控兰波顿电容的电量和无线电网电量（需配置）
- 支持监控物品和流体存储元件的状态（需配置）


## 特色

- 支持多个OC客户端
- 移动端适配
- 支持自定义任务
- 暗色模式
- 高度可定制化


## 安装

### 项目目录

```shell
client/    # OC客户端
server/    # 服务端
website/   # 网页前端
```

### 服务器端

**服务器端需要安装在可公网访问的服务器上**

具体步骤请查看 [RemoteOC#服务端部署](https://github.com/z5882852/RemoteOC?tab=readme-ov-file#%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%83%A8%E7%BD%B2)


### OC客户端

**OC客户端需要安装在游戏内的OC电脑上**


1. **注意事项**

    配置要求: 
    - CPU: `T3 CPU`或`T3 APU`
    - 内存: `2 x T3.5内存` (推荐使用`T4服务器`安装`4 x T3.5内存`)
    - 扩展卡: `因特网卡`
    - 扩展: `适配器`
    - 其他: 根据实际情况调整

    当AE终端物品种类超过1000种时请使用`4 x T3.5内存`，超过2000种时请使用`创造模式内存`，否则会内存溢出导致无法获取物品数据。
    > 具体多少种没进行测试，能跑起来就行

2. **准备工作**

    - 组装好 OC 电脑
    - 安装 OpenOS 操作系统
    - 安装因特网卡
    - 连接适配器
    - 将ME接口或ME控制器紧邻适配器
    - 使用分析器获取ME接口或ME控制器的地址

3. **安装程序安装**

    - 下载安装程序
    ```bash
    wget https://raw.githubusercontent.com/z5882852/RemoteOC-GTNH-AE2/main/client/setup.lua
    ```

    - 安装客户端
    ```bash
    setup.lua
    ```

4. **直接安装(当raw.githubusercontent.com无法访问时)**

    - 下载或克隆项目至本地
    - 将`client`目录内所有文件上传至你的 OC 电脑

5. **修改`env.lua`文件**

    - 将`env.lua`中的`baseUrl`修改为你的后端地址
    - 将`env.lua`中的`serverToken`修改为你的服务端令牌
    - 将`env.lua`中的`address`修改为你的ME接口或ME控制器的地址

6. **选择扩展插件（可选）**

    - 可选插件目录为`client/optional_plugins/{插件名}`
    - 该目录下会有`lib`和`plugins`两个文件夹，分别对应插件依赖库和插件本体
    - 将插件目录下的`lib`内的文件上传至`client/lib`目录
    - 将插件目录下的`plugins`内的文件上传至`client/plugins`目录
    - 根据插件的说明修改插件本体文件


7. **运行客户端**

    输入以下命令运行客户端
    ```bash
    run.lua
    ```

    DEBUG模式运行
    ```bash
    run.lua --debug
    ```


### 网页前端

#### **1. 使用 Releases 打包好的网页并部署**
如果您希望快速部署前端，可直接使用打包好的文件，无需进行源码构建。

1. **下载 Releases 文件**
   - 访问项目的 Releases 页面：[🔗 **GitHub Releases**](https://github.com/z5882852/RemoteOC-GTNH-AE2/releases)
   - 下载最新版本的 `RemoteOC_frontend-x.x.x_GTNH-2.x.0.tar.gz` 文件（或类似文件名的构建包）。

2. **上传到服务器**
   - 将压缩包文件上传到您的服务器（如 Nginx、Apache、或者其他静态资源服务器）。
   - 解压文件。

3. **配置服务器**

4. **访问网页**
   - 使用浏览器访问部署的域名。



#### **3. 克隆源码并构建再部署**
1. **环境要求**
   - Node.js: 推荐版本 16.x 或以上
   - npm 或 yarn: 用于安装依赖
   - Git: 用于克隆项目

2. **克隆源码**
   - 使用 Git 克隆项目到本地：
     ```bash
     git clone https://github.com/z5882852/RemoteOC-GTNH-AE2.git
     ```
   - 进入项目目录：
     ```bash
     cd RemoteOC-GTNH-AE2/website
     ```

3. **安装依赖**
   - 使用 npm：
     ```bash
     npm install
     ```
   - 或使用 yarn：
     ```bash
     yarn install
     ```

4. **构建项目**
   - 运行以下命令以生成静态文件：
     ```bash
     npm run build
     ```
   - 构建完成后，静态资源将位于 `dist/` 目录中。

5. **部署静态资源**
   - 将 `dist/` 文件夹中的文件上传到您的服务器（如 Nginx、Apache 或其他静态资源服务器）。
   - 配置服务器。
   - 重启服务器后，访问您的域名即可。


#### **4. 注意事项**
- 由于项目是单页面应用程序（SPA），请确保服务器配置了路径重写规则（如 Nginx 中的 `try_files $uri /index.html`）。


## 效果图

<details>
<summary>点击展开</summary>

![监控](assets/monitor.png)
![物品](assets/items.png)
![流体](assets/fluids.png)
![下单](assets/craft.png)
![CPU](assets/cpus.png)
![任务](assets/tasks.png)
![自动化](assets/automate.png)
![移动端](assets/mobile.png)
![暗色模式](assets/dark.jpeg)

</details>

## 扩展插件

### 1. monitor

#### 功能
- 监控兰波顿电容的电量和无线电网电量
- 统计物品和流体存储元件的状态

#### 准备工作
- ME驱动器需要使用存储总线组成[SSD阵列](https://www.mcmod.cn/post/1296.html), 且物品元件与流体元件需要分开（即2个子网络）
- 将适配器连接到2个子网的ME控制器/ME接口上
- 将适配器连接到兰波顿库电容上

#### 配置
- 修改`AE2StorageUsage.lua`文件中代理地址分别为物品、流体的ME控制器/ME接口地址
- 修改`powerMonitor.lua`文件中代理地址为兰波顿电容库地址
- 在网页前端的`设置`中启用监控页面


## 其他

### RemoteOC框架

[https://github.com/z5882852/RemoteOC](https://github.com/z5882852/RemoteOC)

### nbt标签解析

[https://github.com/sjmulder/nbt-js](https://github.com/sjmulder/nbt-js)

### 物品和流体图标、数据导出

[https://github.com/RealSilverMoon/nesql-exporter/](https://github.com/RealSilverMoon/nesql-exporter/)



local env = {
    -- 轮询间隔时间（秒）
    pollingInterval = 8,

    -- 服务器地址，用于获取命令和上报数据
    baseUrl = "http://zhuanshuweihu.top:32777",

    -- 客户端id，用于在多台客户端集群中识别该客户端，为空时则获取所有命令，单节点默认即可
    clientId = "client_01",

    -- 服务端令牌，防止第三方上报垃圾数据或非法获取数据，需要与服务器端相同
    serverToken = "9c7e4ca7f3a5cb47b3d4ed77e60b1aac",

    -- ME控制器或ME接口地址
    aeAddress = "66fc19b8-799c-4b6c-9dcc-83a3df976b14",

    -- 分块上报时每块的大小
    chunkSize = 256,

    -- 获取命令的接口
    getPath = "/api/task/get",

    -- 上报接口
    reportPath = "/api/task/report",

    -- 分块上报接口
    chunkedReportPath = "/api/task/chunked_report",
}

return env

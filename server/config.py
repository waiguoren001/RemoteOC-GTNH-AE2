import os
from dotenv import load_dotenv
from callback import *
from action import *

# 加载 .env 文件中的环境变量
load_dotenv()


# 定时任务设置
timer_task_config = {
    # "timer_task_1": {  # 键名为任务名，用于查询，可自定义
    #     'interval': 15,  # 定时器间隔(秒)
    #     'client_id': 'client_01',  # 指定执行命令的OC客户端id
    #     'commands': [  # 远程执行的命令列表
    #         "return 114514",
    #     ],
    #     # 命令执行后的回调函数，callback(results: list)
    #     'callback': test,
    # },
}


# 任务组设置，该任务执行结束后会调用callback，该任务记录不会被清除
task_config = {
    "getCpuDetailList": {  # 获取CPU详细信息列表
        "client_id": "client_01",  # 指定执行命令的OC客户端id
        "commands": [  # 远程执行的命令列表
            "return ae.getCpuList(true)",
        ],
        "cache": True,
        "handle": None,
        "callback": None,
    },
    "getCpuList": {  # 获取CPU简易信息列表
        "client_id": "client_01",
        "commands": [
            "return ae.getCpuList()",
        ],
        "cache": True,
        "handle": None,
        "callback": None,
    },
    "getAllItems": {  # 获取AE网络里所有物品信息
        "client_id": "client_01",
        "commands": [
            "return ae.getAllItems()",
        ],
        "cache": True,
        "handle": None,
        "callback": None,
        "chunked": True,  # 由于数据量过大，启用分块上传。
    },
    "getAllSilempleItems": {  # 获取AE网络里所有物品信息
        "client_id": "client_01",
        "commands": [
            "return ae.getAllSilempleItems()",
        ],
        "cache": True,
        "handle": None,
        "callback": None,
    },
    "getAllCraftables": {  # 获取AE网络里所有可合成的物品信息
        "client_id": "client_01",
        "commands": [
            "return ae.getAllCraftables()",
        ],
        "cache": True,
        "handle": None,
        "callback": None,
    },
    "getAllCraftablesAndCpus": {  # 获取AE网络里所有可合成的物品信息和CPU信息
        "client_id": "client_01",
        "commands": ["return ae.getAllCraftables()", "return ae.getCpuList()"],
        "cache": True,
        "handle": None,
        "callback": None,
    },
    "monitor": {
        "client_id": "client_01",
        "commands": [
            "return getCapacitorInfo()",  # 获取兰波顿电容库数据
            "return calculate_fluid_me_totals()",  # 获取流体存储元件数据
            "return calculate_item_me_totals()",  # 获取物品存储元件数据
        ],
        "cache": True,
        "handle": parse_data,
        "callback": None,
    },
}


# 触发器设置
trigger_config = {
    "CPU空闲时": {
        "interval": 180,  # 任务执行间隔
        "description": "当 CPU 空闲时，执行任务",
        "task": {
            # 用占位符{xxx}表示参数，用于动态替换
            "task_id": None,  # 任务 ID, None 则自动生成
            "client_id": "{client_id}",
            "commands": [
                "return ae.getCpuInfoByName('{cpu_name}')",
            ],
            "handle": check_cpu_free,  # 返回值为 True 时执行任务
        },
        "args": [
            # tpye: str, int, float, bool
            {
                "key": "client_id",
                "field": "client_id",
                "type": "str",
            },
            {
                "key": "cpu_name",
                "field": "cpu_name",
                "type": "str",
            },
        ],
        # 可选操作列表
        "actions": {
            "craft": {
                "name": "合成物品",
                "description": None,
                "function": craft_item,
                "args": [
                    {
                        "field": "client_id",
                        "type": "str",
                    },
                    {
                        "field": "item_name",
                        "type": "str",
                    },
                    {
                        "field": "item_damage",
                        "type": "int",
                    },
                    {
                        "field": "item_amount",
                        "type": "int",
                        "default": 1,
                    },
                    {
                        "field": "cpu_name",
                        "type": "str",
                        "default": None,
                    },
                    {
                        "field": "label",
                        "type": "str",
                        "default": None,
                    },
                ],
            },
            "notify": {
                "name": "发送通知",
                "description": "发送HTTP请求推送API，通知用户",
                "function": send_notification,
                "args": [
                    {
                        "field": "method",
                        "type": "str",
                        "default": "GET",
                    },
                    {
                        "field": "url",
                        "type": "str",
                    },
                    {
                        "field": "url",
                        "type": "str",
                    },
                    {
                        "field": "params",
                        "type": "dict",
                        "default": None,
                    },
                    {
                        "field": "data",
                        "type": "dict",
                        "default": None,
                    },
                ],
            },
        },
    },
}

SERVER_TOKEN = os.getenv("SERVER_TOKEN")

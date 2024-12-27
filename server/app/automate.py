from config import trigger_config, SERVER_TOKEN
from utils.utils import *
from utils.trigger import trigger_manager
from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request
from models import *

import json


router = APIRouter()


async def token_required(x_server_token: str = Header(...)):
    """Token 验证依赖"""
    if x_server_token != SERVER_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized, invalid token")


@router.get("/trigger/config", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def get_trigger_list():
    """获取可用触发器配置列表"""
    return {"code": 200, "message": "success", "data": trigger_manager.get_config_list()}


@router.post("/trigger/add", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def add_trigger(trigger: AddTriggerModel):
    """添加触发器"""
    trigger_task_id = trigger_manager.register_trigger(
        trigger.name,
        trigger.action,
        trigger.trigger_kwargs,
        trigger.action_kwargs,
        trigger.interval
    )
    return {"code": 200, "message": "success", "data": {"trigger_task_id": trigger_task_id}}


@router.post("/trigger/remove", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def remove_trigger(trigger_task_id: str = Query(..., description="触发器任务ID")):
    """移除触发器"""
    trigger_manager.unregister_trigger(trigger_task_id)
    return {"code": 200, "message": "success"}


@router.get("/trigger/list", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def get_trigger_list():
    """获取所有触发器"""
    trigger_list = trigger_manager.get_trigger_list()
    # 去除函数对象，避免序列化错误
    temp = json.dumps(trigger_list, default=lambda x: None)
    trigger_list = json.loads(temp)
    return {"code": 200, "message": "success", "data": trigger_list}



@router.post("/trigger/start", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def start_trigger(trigger_task_id: str = Query(..., description="触发器任务ID")):
    """启动触发器"""
    trigger_manager.start(trigger_task_id)
    return {"code": 200, "message": "success"}


@router.post("/trigger/stop", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def stop_trigger(trigger_task_id: str = Query(..., description="触发器任务ID")):
    """停止触发器"""
    trigger_manager.stop(trigger_task_id)
    return {"code": 200, "message": "success"}
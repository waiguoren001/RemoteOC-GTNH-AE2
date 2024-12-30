/** python接口


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



@router.get("/timer/config", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def get_timer_config():
    """获取可用定时器配置列表"""
    return {"code": 200, "message": "success", "data": timer_manager.get_config_list()}


@router.post("/timer/add", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def add_timer(timer: AddTimerModel):
    """添加定时器"""
    timer_id = timer_manager.register_timer(
        timer.name,
        timer.action,
        timer.trigger_kwargs,
        timer.action_kwargs,
    )
    return {"code": 200, "message": "success", "data": {"timer_id": timer_id}}


@router.post("/timer/remove", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def remove_timer(timer: TimerRequestModel):
    """移除定时器"""
    timer_manager.unregister_timer(timer.timer_id)
    return {"code": 200, "message": "success"}


@router.get("/timer/list", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def get_timer_list():
    """获取所有定时器"""
    timer_list = timer_manager.get_timer_list()
    # 去除函数对象，避免序列化错误
    temp = json.dumps(timer_list, default=lambda x: None)
    timer_list = json.loads(temp)
    return {"code": 200, "message": "success", "data": timer_list}


@router.post("/timer/start", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def start_timer(timer: TimerRequestModel):
    """启动定时器"""
    timer_manager.start(timer.timer_id)
    return {"code": 200, "message": "success"}


@router.post("/timer/stop", response_model=StandardResponseModel, dependencies=[Depends(token_required)])
async def stop_timer(timer: TimerRequestModel):
    """停止定时器"""
    timer_manager.stop(timer.timer_id)
    return {"code": 200, "message": "success"}
 */
import Requests from './requests';
import { ElMessage, ElNotification } from 'element-plus';


const trigger = {
    async getTriggerConfig(callback) {
        try {
            const response = await Requests.get('/api/automate/trigger/config');
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`获取触发器配置失败: ${data.code}, ${data.message ? data.message : data}`);
                console.error(data);
            }
        } catch (error) {
            ElMessage.error(`获取触发器配置失败: ${error}`);
            console.error('Error fetching trigger config:', error);
        }
    },
    async addTrigger(trigger, callback) {
        try {
            const response = await Requests.post('/api/automate/trigger/add', trigger);
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`添加触发器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`添加触发器失败: ${error}`);
            console.error('Error adding trigger:', error);
        }
    },
    async removeTrigger(trigger_task_id, callback) {
        try {
            const response = await Requests.post('/api/automate/trigger/remove', { trigger_task_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`移除触发器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`移除触发器失败: ${error}`);
            console.error('Error removing trigger:', error);
        }
    },
    async getTriggerList(callback) {
        try {
            const response = await Requests.get('/api/automate/trigger/list');
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`获取触发器列表失败: ${data.code}, ${data.message ? data.message : data}`);
                console.error(data);
            }
        } catch (error) {
            ElMessage.error(`获取触发器列表失败: ${error}`);
            console.error('Error fetching trigger list:', error);
        }
    },
    async startTrigger(trigger_task_id, callback) {
        try {
            const response = await Requests.post('/api/automate/trigger/start', { trigger_task_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`启动触发器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`启动触发器失败: ${error}`);
            console.error('Error starting trigger:', error);
        }
    },
    async stopTrigger(trigger_task_id, callback) {
        try {
            const response = await Requests.post('/api/automate/trigger/stop', { trigger_task_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`停止触发器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`停止触发器失败: ${error}`);
            console.error('Error stopping trigger:', error);
        }
    }
}

const timer = {
    async getTimerConfig(callback) {
        try {
            const response = await Requests.get('/api/automate/timer/config');
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`获取定时器配置失败: ${data.code}, ${data.message ? data.message : data}`);
                console.error(data);
            }
        } catch (error) {
            ElMessage.error(`获取定时器配置失败: ${error}`);
            console.error('Error fetching timer config:', error);
        }
    },
    async addTimer(timer, callback) {
        try {
            const response = await Requests.post('/api/automate/timer/add', timer);
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`添加定时器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`添加定时器失败: ${error}`);
            console.error('Error adding timer:', error);
        }
    },
    async removeTimer(timer_id, callback) {
        try {
            const response = await Requests.post('/api/automate/timer/remove', { timer_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`移除定时器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`移除定时器失败: ${error}`);
            console.error('Error removing timer:', error);
        }
    },
    async getTimerList(callback) {
        try {
            const response = await Requests.get('/api/automate/timer/list');
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`获取定时器列表失败: ${data.code}, ${data.message ? data.message : data}`);
                console.error(data);
            }
        } catch (error) {
            ElMessage.error(`获取定时器列表失败: ${error}`);
            console.error('Error fetching timer list:', error);
        }
    },
    async startTimer(timer_id, callback) {
        try {
            const response = await Requests.post('/api/automate/timer/start', { timer_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`启动定时器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`启动定时器失败: ${error}`);
            console.error('Error starting timer:', error);
        }
    },
    async stopTimer(timer_id, callback) {
        try {
            const response = await Requests.post('/api/automate/timer/stop', { timer_id });
            const data = response.data;
            if (data.code === 200) {
                if (callback) callback(data.data);
            } else {
                ElMessage.error(`停止定时器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`停止定时器失败: ${error}`);
            console.error('Error stopping timer:', error);
        }
    }
}


export {
    trigger,
    timer
};
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
 */
import Requests from './requests';
import { ElMessage, ElNotification } from 'element-plus';


const trigger = {
    async getTriggerConfig(callback) {
        try {
            const response = await Requests.get('/api/automate/trigger/config');
            const { code, data } = response.data;
            if (code === 200) {
                if (callback) callback(data);
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
        /**trigger = {
         *     name: 'trigger_name',
         *     action: 'action_name',
         *     trigger_kwargs: {},
         *     action_kwargs: {},
         *     interval: Number,
         * }*/
        try {
            const response = await Requests.post('/api/automate/trigger/add', trigger);
            const { code, data } = response.data;
            if (code === 200) {
                console.log(`Trigger '${data.trigger_task_id}' added successfully.`);
                if (callback) callback(data);
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
            const { code, data } = response.data;
            if (code === 200) {
                console.log(`Trigger '${trigger_task_id}' removed successfully.`);
                if (callback) callback(data);
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
            const { code, data } = response.data;
            if (code === 200) {
                if (callback) callback(data);
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
            const { code, data } = response.data;
            if (code === 200) {
                console.log(`Trigger '${trigger_task_id}' started successfully.`);
                if (callback) callback(data);
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
            const { code, data } = response.data;
            if (code === 200) {
                console.log(`Trigger '${trigger_task_id}' stopped successfully.`);
                if (callback) callback(data);
            } else {
                ElMessage.error(`停止触发器失败: ${data.code}, ${data.message ? data.message : data}`);
            }
        } catch (error) {
            ElMessage.error(`停止触发器失败: ${error}`);
            console.error('Error stopping trigger:', error);
        }
    }
}


export {
    trigger,
};
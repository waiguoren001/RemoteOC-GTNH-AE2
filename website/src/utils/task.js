import Requests from './requests';
import { ElMessage, ElNotification } from 'element-plus';


// 轮询获取任务状态
const fetchStatus = async (task_id, handleResult, handleUploading, handleComplete, interval = 1000, pollingController = createPollingController()) => {
    try {
        if (!localStorage.getItem('backendUrl')) {
            ElMessage.error(`请先设置后端地址！`)
            return
        }
        const response = await Requests.get('/api/cmd/status', { task_id, remove: false });
        const data = response.data;
        if (data.code === 200) {
            if (data.data.result && data.data.result != [] && data.data.status !== 'uploading') {
                if (handleResult) handleResult(data.data);
            }
            if (data.data.status === 'uploading') {
                if (handleUploading) handleUploading(data.data);
            }
            if (data.data.status === 'completed') {
                if (handleComplete) handleComplete(data.data);
                if (pollingController) {
                    pollingController.stop();
                }
            } else {
                if (pollingController && pollingController.running) {
                    pollingController.timeoutId = setTimeout(() => {
                        fetchStatus(task_id, handleResult, handleUploading, handleComplete, interval, pollingController);
                    }, interval);
                }
            }
        } else {
            if (pollingController) {
                pollingController.stop();
            }
            ElMessage.error(`查询任务失败: ${data.code}, ${data.message ? data.message : data}`);
            console.error(data);
        }
    } catch (error) {
        if (pollingController) {
            pollingController.stop();
        }
        ElMessage.error(`查询任务失败: ${error}`);
        console.error(`Error fetching task status: ${error}`);
    }
};

const addTask = async (task_id, client_id, handleResult) => {
    try {
        if (!task_id) {
            ElMessage.error(`提交任务失败: task_id: ${task_id}`);
            return
        }
        const response = await Requests.post('/api/cmd/task', {
            task_id: task_id,
            client_id: client_id,
        });
        const { code, data } = response.data;
        if (code === 200) {
            console.log(`Task '${data.taskId}' added successfully.`);
            if (handleResult) handleResult(data);
        } else {
            ElMessage.error(`提交任务失败: ${data.code}, ${data.message ? data.message : data}`);

        }
    } catch (error) {
        ElMessage.error(`提交任务失败: ${error}`);
        console.error('Error adding task:', error);
    }
};

const addCommands = async (task_id, client_id, commands, handleResult) => {
    try {
        const response = await Requests.post('/api/cmd/add', {
            task_id: task_id,
            client_id: client_id,
            commands: commands,
        });
        const { code, data } = response.data;
        if (code === 200) {
            console.log(`Task '${data.taskId}' added successfully.`);
            if (handleResult) handleResult(data);
        } else {
            ElMessage.error(`提交任务失败: ${data.code}, ${data.message ? data.message : data}`);

        }
    } catch (error) {
        ElMessage.error(`提交任务失败: ${error}`);
        console.error('Error adding task:', error);
    }
}

const createPollingController = () => {
    return {
        running: true,
        timeoutId: null,
        stop() {
            this.running = false;
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        },
    };
};

const localTask = {
    saveTaskId: (taskId, taskType, data) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = {
            id: taskId,
            type: taskType,
            data: data,
        };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },
    getTasks: () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return tasks;
    },
    getTask: (taskId) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(task => task.id === taskId);
        return task || null;
    },
    removeTask: (taskId) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },
    updateTaskData: (taskId, newData) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].data = newData;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } else {
            console.error(`Task with ID ${taskId} not found.`);
        }
    }
}

const createCraftTask = (itemName, ItemDamage, amount = 1, cpuName, callback) => {
    let command = undefined;
    if (cpuName) {
        command = `return ae.requestItem('${itemName}', ${ItemDamage}, ${amount}, '${cpuName}')`
    } else {
        command = `return ae.requestItem('${itemName}', ${ItemDamage}, ${amount})`
    }
    addCommands(null, null, [command], (data) => {
        if (callback) callback(data);
        let task_id = data.taskId;
        localTask.saveTaskId(task_id, '下单')
        ElNotification({
            title: '下单',
            dangerouslyUseHTMLString: true,
            message: `下单请求已提交<br/>详情请前往任务列表查看<br/>task id: ${task_id}`,
            type: 'info',
            duration: 6000,
        });
        const showErrorNotification = (mes = "") => {
            ElNotification({
                title: '下单',
                dangerouslyUseHTMLString: true,
                message: `下单失败，${mes}<br/>详情请前往任务列表查看<br/>task id: ${task_id}`,
                type: 'warning',
                duration: 6000,
            });
        }
        fetchStatus(task_id, null, null, (taskData) => {
            // console.log(taskData)
            try {
                if (taskData && taskData.result && taskData.result[0]) {
                    let result = JSON.parse(taskData.result[0])
                    if (result.message && result.message === "success" && result.data) {
                        if (result.data.failed) {
                            if (result.data.done.why === "request failed (missing resources?)") {
                                showErrorNotification("材料缺失或CPU不足，");
                            } else {
                                showErrorNotification();
                            }
                        } else {
                            ElNotification({
                                title: '下单',
                                dangerouslyUseHTMLString: true,
                                message: `下单成功<br/>详情请前往任务列表查看<br/>task id: ${task_id}`,
                                type: 'success',
                                duration: 6000,
                            });
                        }
                    } else {
                        showErrorNotification();
                    }
                } else {
                    showErrorNotification();
                }
            } catch (error) {
                console.error(error)
                showErrorNotification();
            }


        }, 1000, createPollingController());
    });
}

export {
    fetchStatus,
    addTask,
    createPollingController,
    localTask,
    createCraftTask,
};

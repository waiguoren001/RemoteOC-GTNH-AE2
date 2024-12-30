<template>
    <el-container style="height: 100%;">
        <el-header class="control-header-task">
            <el-card class="control-card" shadow="hover">
                <div class="control-bar">
                    <span>最近更新时间: {{ lastUpdate }}</span>
                    <div style="text-align: right;">
                        <el-button type="primary" :size="isMobile ? 'small' : ''"
                            @click="addAutoTask">添加自动化任务</el-button>
                        <el-button type="primary" :size="isMobile ? 'small' : ''"
                            @click="loadAutoTasks">刷新任务列表</el-button>
                    </div>
                </div>
            </el-card>
        </el-header>
        <el-main style="width: 100%; overflow: hidden;" v-loading="mainLoading" element-loading-text="loading">
            <el-card class="box-card">
                <el-auto-resizer>
                    <template #default="{ height, width }">
                        <el-table-v2 :columns="columns" :data="tasks" :width="width" :height="height"
                            :header-height="50" :row-height="75" />
                    </template>
                </el-auto-resizer>
            </el-card>
        </el-main>
        <el-dialog v-model="showInfoDialog" class="task-dialog" title="自动化任务详情" fullscreen align-center>
            <div class="info-container">
                <el-space alignment="normal" direction="vertical" style="width: 100%; margin-bottom: 20px;">
                    <el-descriptions title="基本信息" :column="1" border label-width="80px">
                        <el-descriptions-item label="ID">{{ info.id }}</el-descriptions-item>
                        <el-descriptions-item label="类型">{{ info.type }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="statusMap[info.status].type">{{ statusMap[info.status].text }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item v-if="info.type === '触发器'" label="检测间隔">
                            {{ info.interval }} 秒
                        </el-descriptions-item>

                    </el-descriptions>

                    <el-divider></el-divider>
                    <el-text size="large">生命周期</el-text>

                    <el-timeline style="margin-top: 20px; width: 100%;">
                        <el-timeline-item :timestamp="info.time.created" size="large" color="#409EFF">
                            任务创建
                        </el-timeline-item>
                        <el-timeline-item v-if="info.time.last_start" :timestamp="info.time.last_start" size="large"
                            color="#67C23A">
                            上一次启动
                        </el-timeline-item>
                        <el-timeline-item v-if="info.time.last_monitor" :timestamp="info.time.last_monitor" size="large"
                            color="#E6A23C">
                            最近检测
                        </el-timeline-item>
                        <el-timeline-item v-if="info.time.excuted" :timestamp="info.time.excuted" size="large"
                            :color="info.time.completed ? '#E6A23C' : ''">
                            执行操作 {{ info.time.completed ? '' : '(预计)' }}
                        </el-timeline-item>
                        <el-timeline-item v-if="info.time.completed" :timestamp="info.time.completed" size="large"
                            color="#F56C6C">
                            任务完成
                        </el-timeline-item>
                    </el-timeline>
                    <el-divider></el-divider>
                    <el-descriptions title="触发条件" :column="1" border label-width="150px">
                        <el-descriptions-item label="类型">{{ info.name }}</el-descriptions-item>
                        <el-descriptions-item label="描述">{{ info.description }}</el-descriptions-item>
                        <el-descriptions-item v-for="arg in info.args" :key="arg.field" :label="arg.description">
                            <el-text>{{ info.kwargs[arg.field] }}</el-text>
                        </el-descriptions-item>
                    </el-descriptions>
                    <el-divider></el-divider>
                    <el-descriptions title="执行操作" :column="1" border label-width="150px">
                        <el-descriptions-item label="类型">{{ info.action.name }}</el-descriptions-item>
                        <el-descriptions-item label="描述">{{ info.action.description }}</el-descriptions-item>
                        <el-descriptions-item v-if="info.action.name === '合成物品'" label="合成目标">
                            <ItemCard class="item-card-container" :item="{
                                name: info.action.action_kwargs.item_name,
                                damage: info.action.action_kwargs.item_damage,
                                amount: info.action.action_kwargs.item_amount,
                                label: info.action.action_kwargs.label,
                            }" />
                        </el-descriptions-item>
                        <el-descriptions-item v-for="arg in info.action.args" :key="arg.field" :label="arg.description">
                            <el-text>{{ info.action.action_kwargs[arg.field] }}</el-text>
                        </el-descriptions-item>
                    </el-descriptions>
                    <el-divider></el-divider>
                    <el-text size="large" truncated>
                        执行结果
                        <TaskResult v-if="info.action.name === '合成物品' && info.result" :task_id="info.result" />
                    </el-text>
                    <el-text size="large" v-if="info.result">
                        <pre>{{ info.result }}</pre>
                    </el-text>
                    <el-text size="large" v-else>
                        无
                    </el-text>
                </el-space>
            </div>
        </el-dialog>
        <el-dialog v-model="showAddTaskDialog" class="task-dialog" title="添加自动化任务" fullscreen align-center>
            <div class="info-container">
                <el-form :model="form" label-width="auto">
                    <el-form-item label="触发条件">
                        <el-select-v2 v-model="form.name" placeholder="请选择触发条件" :options="options.name"
                            @change="resetFormAndLoadActions()">
                            <template #default="{ item }">
                                <div
                                    style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <span style="flex: 0 0 80px; text-align: left; margin-right: 8px;">
                                        {{ item.label }}
                                    </span>
                                    <span style="flex: 1; color: var(--el-text-color-secondary); font-size: 13px;">
                                        {{ item.desc }}
                                    </span>
                                </div>
                            </template>
                        </el-select-v2>
                    </el-form-item>

                    <template v-if="form.name === 'CPU空闲时'">
                        <el-form-item label="监听CPU">
                            <CpuSelect status="busy" footer="仅能选择已命名且繁忙的CPU" :options="options.cpuList"
                                @handleCpuSelected="onTriggerCpuSelected" @handleLoadCpuList="onLoadCpuList" />
                        </el-form-item>
                        <el-form-item label="客户端ID">
                            <el-tooltip effect="dark" content="不指定则留空" placement="top">
                                <el-input v-model="form.trigger_kwargs.client_id" placeholder="请输入客户端ID" />
                            </el-tooltip>
                        </el-form-item>
                    </template>
                    <template v-if="form.name === '延迟任务'">
                        <el-form-item label="延迟时间">
                            <el-input-number v-model="form.trigger_kwargs.delay" placeholder="延迟" :min="60" :max="604800">
                                <template #suffix>
                                    秒
                                </template>
                            </el-input-number>
                        </el-form-item>
                    </template>
                    <template v-if="form.name === '定时任务'">
                        <el-form-item label="定时时间">
                            <el-date-picker v-model="form.trigger_kwargs.time" type="datetime" placeholder="选择执行时间"
                                :editable="false" value-format="YYYY-MM-DD HH:mm:ss" />
                        </el-form-item>
                    </template>

                    <!-- action -->
                    <template v-if="form.name">
                        <el-form-item label="执行操作">
                            <el-select-v2 v-model="form.action" placeholder="请选择执行操作" :options="options.actions">
                            <template #default="{ item }">
                                <div
                                    style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                    <span style="flex: 0 0 80px; text-align: left; margin-right: 8px;">
                                        {{ item.label }}
                                    </span>
                                    <span style="flex: 1; color: var(--el-text-color-secondary); font-size: 13px;">
                                        {{ item.desc }}
                                    </span>
                                </div>
                            </template>
                        </el-select-v2>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" @click="console.log(form)">添加</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
import { h, inject } from 'vue';
import { trigger, timer } from '@/utils/automate'
import ItemCard from "@/components/ItemCard.vue";
import TaskResult from "@/components/TaskResult.vue";
import CpuSelect from "@/components/CpuSelect.vue";
import { ElMessage, ElTag, ElButton } from 'element-plus'

const statusMap = {
    "ready": {
        text: "就绪",
        type: "primary"
    },
    "pending": {
        text: "运行中",
        type: "success"
    },
    "completed": {
        text: "已完成",
        type: "warning"
    },
}

export default {
    name: 'Automate',
    components: {
        ItemCard,
        TaskResult,
        CpuSelect,
    },
    data() {
        return {
            statusMap,
            tasks: [],
            lastUpdate: "",
            mainLoading: false,
            columns: [
                { dataKey: 'id', title: 'ID', width: 300, align: 'center', fixed: false },
                { dataKey: 'type', title: '类型', width: 100, align: 'center', },
                { dataKey: 'name', title: '触发条件', width: 100, align: 'center', },
                { dataKey: 'action.name', title: '执行操作', width: 100, align: 'center', },
                {
                    dataKey: 'status', title: '状态', width: 100, align: 'center',
                    cellRenderer: (data) => (
                        h(ElTag, { type: statusMap[data.rowData.status].type }, () => statusMap[data.rowData.status].text)
                    ),
                },
                {
                    key: '操作',
                    title: '操作',
                    width: 250,
                    align: 'center',
                    fixed: 'right',
                    cellRenderer: (data) => (
                        h("div", {}, [
                            h(
                                ElButton,
                                { onClick: () => { this.handleStart(data.rowData) }, size: "small", type: "success", plain: true, disabled: data.rowData.running || data.rowData.status === 'completed' },
                                () => "启动"
                            ),
                            h(
                                ElButton,
                                { onClick: () => { this.handleStop(data.rowData) }, size: "small", type: "warning", plain: true, disabled: !data.rowData.running || data.rowData.status === 'completed' },
                                () => "停止"
                            ),
                            h(
                                ElButton,
                                { onClick: () => { this.handleInfo(data.rowData) }, size: "small", plain: true },
                                () => "详情"
                            ),
                            h(
                                ElButton,
                                { onClick: () => { this.handleRemove(data.rowData) }, size: "small", type: "danger", plain: true },
                                () => "移除"
                            )
                        ])
                    ),
                },
            ],
            showInfoDialog: false,
            showAddTaskDialog: false,
            info: null,
            config: [],
            options: {
                name: [],
                cpuList: [],
                actions: [],
            },
            form: {
                name: "",
                action: "",
                trigger_kwargs: {},
                action_kwargs: {},
            }
        };
    },
    setup() {
        const isMobile = inject('isMobile');
        return {
            isMobile,
        };
    },
    methods: {
        loadAutoTasks() {
            this.mainLoading = true;

            Promise.all([
                new Promise((resolve) => {
                    trigger.getTriggerList((data) => {
                        let triggers = [];
                        for (let key in data) {
                            data[key].id = key;
                            data[key].type = "触发器";
                            triggers.push(data[key]);
                        }
                        resolve(triggers);
                    });
                }),
                new Promise((resolve) => {
                    timer.getTimerList((data) => {
                        let timers = [];
                        for (let key in data) {
                            data[key].id = key;
                            data[key].type = "定时器";
                            timers.push(data[key]);
                        }
                        resolve(timers);
                    });
                })
            ])
                .then(([triggers, timers]) => {
                    this.tasks = [...triggers, ...timers];
                    this.mainLoading = false;
                    this.lastUpdate = new Date().toLocaleString().replace(/\//g, '-');
                    this.tasks.sort((a, b) => {
                        return new Date(b.time.created) - new Date(a.time.created);
                    });
                    this.tasks.reverse();
                })
                .catch((error) => {
                    this.mainLoading = false;
                    ElMessage.error(`加载任务失败: ${error}`);
                    console.error('Error loading tasks:', error);
                });
        },
        addAutoTask() {
            this.showAddTaskDialog = true;
            this.fetchAutoTaskConfig();
        },
        fetchAutoTaskConfig() {
            Promise.all([
                new Promise((resolve) => {
                    trigger.getTriggerConfig((data) => {
                        resolve(data);
                    });
                }),
                new Promise((resolve) => {
                    timer.getTimerConfig((data) => {
                        resolve(data);
                    });
                })
            ])
                .then(([triggerConfig, timerConfig]) => {
                    this.config = [...triggerConfig, ...timerConfig];
                    this.options.name = [
                        {
                            label: '触发器',
                            options: triggerConfig.map(item => ({ label: item.name, value: item.name, desc: item.description }))
                        }, {
                            label: '定时器',
                            options: timerConfig.map(item => ({ label: item.name, value: item.name, desc: item.description }))
                        }
                    ];
                })
                .catch((error) => {
                    ElMessage.error(`加载任务配置失败: ${error}`);
                    console.error('Error loading task config:', error);
                });
        },
        handleStart(data) {
            if (data.type === '定时器') {
                timer.startTimer(data.id, (res) => {
                    ElMessage.success('任务启动成功');
                    this.loadAutoTasks();
                });
                return;
            } else {
                trigger.startTrigger(data.id, (res) => {
                    ElMessage.success('任务启动成功');
                    this.loadAutoTasks();
                });
            }
        },
        handleStop(data) {
            if (data.type === '定时器') {
                timer.stopTimer(data.id, (res) => {
                    ElMessage.success('任务停止成功');
                    this.loadAutoTasks();
                });
                return;
            } else {
                trigger.stopTrigger(data.id, (res) => {
                    ElMessage.success('任务停止成功');
                    this.loadAutoTasks();
                });
            }
        },
        handleInfo(data) {
            console.log(data);
            Object.keys(data.time).forEach(key => {
                if (!data.time[key]) {
                    return;
                }
                data.time[key] = new Date(data.time[key]).toLocaleString().replace(/\//g, '-');
            });
            this.info = data;
            this.showInfoDialog = true;
        },
        handleRemove(data) {
            if (data.type === '定时器') {
                timer.removeTimer(data.id, (res) => {
                    ElMessage.success('任务移除成功');
                    this.loadAutoTasks();
                });
            } else {
                trigger.removeTrigger(data.id, (res) => {
                    ElMessage.success('任务移除成功');
                    this.loadAutoTasks();
                });
            }
        },
        resetFormAndLoadActions(clearName = false) {
            this.form = {
                name: clearName ? "" : this.form.name,
                action: "",
                trigger_kwargs: {},
                action_kwargs: {},
            };
            if (this.form.name) {
                this.options.actions = this.config.find(item => item.name === this.form.name).actions.map(action => ({
                    label: action.name,
                    value: action.id,
                    desc: action.description,
                }));
            }
        },
        onTriggerCpuSelected(cpu) {
            this.form.trigger_kwargs.cpu_name = cpu;
            console.log('选中的CPU:', cpu);
        },
        onLoadCpuList(cpuList) {
            this.options.cpuList = cpuList;
        },
    },
    created() {
        this.loadAutoTasks();
    },
    activated() {

    },
};
</script>

<style>
.control-header-task {
    width: 100%;
    margin-top: 10px;
}

.control-header-task .el-loading-spinner .circular {
    height: 24px;
    width: 24px;
}

.control-header-task .el-card__body {
    padding: 0;
}

.el-popper {
    max-width: 400px;
}

.el-select__popper {
    max-width: none;
}

.box-card {
    height: 100%;
}

.box-card .el-card__body {
    padding: 16px;
    height: 100%;
}

.task-dialog .el-dialog__body {
    width: 100%;
    height: calc(100% - 50px);
}

.info-container .el-row {
    margin-bottom: 10px;
}
</style>

<style scoped>
.el-container {
    height: 100%;
}

.card-container {
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;
    height: calc(100% - 50px);
}

.control-card {
    padding: 10px;
    margin-bottom: 10px;
}

.control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media screen and (max-width: 768px) {
    .control-bar {
        height: 46px;
        flex-direction: column;
        align-items: flex-start;
    }


}

.words {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.info-container {
    height: 100%;
    margin: 10px auto;
    /* overflow-y: auto; */
    /* background-color: black; */
}



@media screen and (min-width: 768px) {
    .info-container {
        width: 50%;
        min-width: 768px;
    }

    .item-card-container {
        width: calc(50vw - 200px);
        min-width: 548px;
    }
}

@media screen and (max-width: 768px) {
    .info-container {
        width: 100%;
        max-width: 768px;
    }

    .item-card-container {
        width: calc(100vw - 200px);
    }
}
</style>

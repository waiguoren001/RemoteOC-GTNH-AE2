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
                <el-space alignment="normal" direction="vertical" style="width: 100%;">
                    <el-text size="large" truncated>ID: {{ info.id }}</el-text>
                    <el-text size="large" truncated>类型: {{ info.type }}</el-text>
                    <el-text size="large">状态:
                        <el-tag :type="statusMap[info.status].type">{{ statusMap[info.status].text }}</el-tag>
                    </el-text>
                    <el-text v-if="info.type === '触发器'" size="large">检测时间间隔: {{ info.interval }} 秒</el-text>
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
                </el-space>
            </div>
        </el-dialog>
    </el-container>
</template>

<script>
import { h, inject } from 'vue';
import { trigger } from '@/utils/automate'
import ItemCard from "@/components/ItemCard.vue";
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
                                { onClick: () => { this.handleStart(data.rowData) }, size: "small", type: "success", plain: true, disabled: data.rowData.running },
                                () => "启动"
                            ),
                            h(
                                ElButton,
                                { onClick: () => { this.handleStop(data.rowData) }, size: "small", type: "warning", plain: true, disabled: !data.rowData.running },
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
            info: null,
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
            trigger.getTriggerList((data) => {
                let tasks = [];
                for (let key in data) {
                    data[key].id = key;
                    data[key].type = "触发器";
                    tasks.push(data[key]);
                }
                this.tasks = tasks;
                this.mainLoading = false;
                this.lastUpdate = new Date().toLocaleString().replace(/\//g, '-');
            });
        },
        addAutoTask() {
            // this.showInfoDialog = true;
        },
        handleStart(data) {
            trigger.startTrigger(data.id, (res) => {
                ElMessage.success('任务启动成功');
                this.loadAutoTasks();
            });
        },
        handleStop(data) {
            trigger.stopTrigger(data.id, (res) => {
                ElMessage.success('任务停止成功');
                this.loadAutoTasks();
            });
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
            trigger.removeTrigger(data.id, (res) => {
                ElMessage.success('任务移除成功');
                this.loadAutoTasks();
            });
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

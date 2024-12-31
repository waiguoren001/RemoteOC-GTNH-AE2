<template>
    <el-select-v2 v-model="selectedCpu" :options="cpuOptions" :props="selectProps" :placeholder="placeholder"
        @change="handleCpuSelected" @visible-change="handleVisibleChange">
        <template #header>
            <el-button size="small" @click="getCpuList" :loading="headerLoading">刷新</el-button>
        </template>
        <template #default="{ item }">
            <template v-if="item.value">
                <el-tag v-if="item.busy" type="warning" effect="light">繁忙</el-tag>
                <el-tag v-else type="success" effect="light">空闲</el-tag>
            </template>
            <span style="margin-left: 10px;">{{ item.name }}</span>
        </template>
        <template v-if="footer" #footer>
            <el-text size="small">{{ footer }}</el-text>
        </template>
    </el-select-v2>
</template>

<script>
import { fetchStatus, addTask } from '@/utils/task'

export default {
    props: {
        options: {
            type: Array,
            required: false,
        },
        status: {  // 传入的值为 'all'、'busy' 或 'free'，默认为 'all'
            type: String,
            required: false,
        },
        autoSelect: {
            type: Boolean,
            required: false,
            default: false,
        },
        footer: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            cpuList: [],
            cpuOptions: [],
            selectProps: {
                label: 'name',
                value: 'value',
            },
            placeholder: this.autoSelect ? '自动分配' : '请选择CPU',
            selectedCpu: '',
            headerLoading: false,
        };
    },
    watch: {
        options: {
            immediate: true,
            handler(newOptions) {
                if (newOptions) {
                    this.cpuList = newOptions;
                    this.handleVisibleChange(true);
                }
            },
        },
    },
    methods: {
        handleCpuSelected() {
            this.$emit('handleCpuSelected', this.selectedCpu);
        },
        getCpuList() {
            this.headerLoading = true;
            addTask("getCpuList", null, () => {
                fetchStatus("getCpuList", null, null, this.handleTaskComplete, 1000);
            })
        },
        handleTaskComplete(data) {
            this.headerLoading = false;
            if (data.result) {
                let result = JSON.parse(data.result[0]);
                if (result.message === undefined || result.message !== 'success') {
                    this.$message.warning(result.message ? result.message : "未知错误");
                    return
                }
                let cpus = result.data;
                let cpuList = [];
                for (let cpu of cpus) {
                    let name = cpu.name !== "" ? cpu.name : `CPU #${cpuList.length + 1}`;
                    cpuList.push({
                        name: name,
                        value: name,
                        busy: cpu.busy,
                        coprocessors: cpu.coprocessors,
                        storage: cpu.storage,
                    });
                }
                cpuList.sort((a, b) => a.name.localeCompare(b.name));

                if (!this.options) {
                    this.cpuList = cpuList;
                    this.handleVisibleChange(true);
                }
                this.$message.success(`刷新CPU列表成功!`);
                this.$emit('handleLoadCpuList', cpuList);
            } else {
                this.$message.warning(`返回数据为空!`);
            }
        },
        handleVisibleChange(visible) {
            if (visible) {
                if (this.options && this.options.length > 0) {
                    this.cpuList = this.options;
                }
                this.cpuOptions = this.cpuList.filter(cpu => {
                    if (this.status === 'busy' && !cpu.busy) {
                        return false;
                    }
                    if (this.status === 'free' && cpu.busy) {
                        return false;
                    }
                    return true;
                });
                if (this.autoSelect) {
                    this.cpuOptions.push({
                        name: '自动分配',
                        value: null,
                    });
                }
            }
        },
    }
};
</script>
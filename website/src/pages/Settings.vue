<template>
    <div>
        <el-form label-position="left" label-width="auto" style="max-width: 600px; margin: 20px;">
            <el-space fill style="width: 100%; margin-bottom: 5px;">
                <el-alert type="info" show-icon :closable="false">
                    <p>该页面内容请勿泄露给他人，所有配置信息将保存至本地 (localStorage)</p>
                </el-alert>
            </el-space>
            <div v-for="(config, index) in configItems" :key="index">
                <el-form-item :label="config.name">
                    <template v-if="config.type === 'input'">
                        <el-input v-model="configValues[config.field]" :placeholder="config.placeholder"></el-input>
                    </template>
                    <template v-else-if="config.type === 'checkbox' && config.tooltip">
                        <el-tooltip effect="dark" placement="right" raw-content :content="config.tooltip">
                            <el-checkbox v-model="configValues[config.field]"></el-checkbox>
                        </el-tooltip>
                    </template>
                    <template v-else-if="config.type === 'checkbox'">
                        <el-checkbox v-model="configValues[config.field]"></el-checkbox>
                    </template>
                    <template v-else-if="config.type === 'password'">
                        <el-input v-model="configValues[config.field]" type="password" show-password :placeholder="config.placeholder"></el-input>
                    </template>
                </el-form-item>
            </div>
            <el-form-item>
                <el-button type="primary" @click="saveSettings">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'Settings',
    data() {
        const defaultConfigItems = [
            { name: '页面标题', field: 'pageTitle', type: 'input', placeholder: 'Title', defaultValue: 'GTNH赛博监工' },
            { name: '启用监控页面', field: 'showMoniter', type: 'checkbox', tooltip: '选择此选项后，可以显示监控信息<br/>必须在OC客户端中启用并配置moniter插件！', defaultValue: false },
            { name: '液滴显示流体图片', field: 'showFluid', type: 'checkbox', defaultValue: true },
            { name: '下单后刷新CPU', field: 'refreshCPU', type: 'checkbox', tooltip: '选择此选项后，在下单结束会同时返回CPU信息<br/>当需要频繁下单或CPU信息量较大时谨慎选择！', defaultValue: false },
            { name: '服务端地址', field: 'backendUrl', type: 'input', placeholder: 'Backend URL', defaultValue: '' },
            { name: '服务端令牌', field: 'token', type: 'password', placeholder: 'Token', defaultValue: '' },
        ];

        // 初始化配置值
        const initialConfigValues = {};
        defaultConfigItems.forEach(config => {
            const savedValue = localStorage.getItem(config.field);
            initialConfigValues[config.field] = savedValue === null
                ? config.defaultValue
                : (config.type === 'checkbox' ? savedValue === 'true' : savedValue);
        });

        return {
            configItems: defaultConfigItems,
            configValues: initialConfigValues,
        };
    },
    methods: {
        saveSettings() {
            Object.keys(this.configValues).forEach(field => {
                localStorage.setItem(field, this.configValues[field]);
            });
            this.$confirm('设置已保存，是否立即刷新网页以应用更改？', '确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                location.reload();
            }).catch(() => {
                this.$message.success('更改已保存，刷新网页后生效');
            });
        },
    },
};
</script>

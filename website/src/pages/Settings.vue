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
import Setting from '@/utils/setting';

export default {
    name: 'Settings',
    data() {
        const defaultConfigItems = Setting.defaultConfigItems;
        const initialConfigValues = Setting.getAll();
        console.log(Setting)
        return {
            configItems: defaultConfigItems,
            configValues: initialConfigValues,
        };
    },
    methods: {
        saveSettings() {
            Object.keys(this.configValues).forEach(field => {
                Setting.set(field, this.configValues[field]);
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

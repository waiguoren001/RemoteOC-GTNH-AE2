<template>
    <el-menu default-active="Index" class="el-menu-vertical-page" @select="handleSelect" style="height: 100%;">
        <el-menu-item index="Index">主页</el-menu-item>
        <el-menu-item v-if="showMoniter" index="Monitor">监控</el-menu-item>
        <el-menu-item index="Items">终端</el-menu-item>
        <el-menu-item index="Cpus">CPUs</el-menu-item>
        <el-menu-item index="Tasks">任务</el-menu-item>
        <el-menu-item index="Automate">自动化</el-menu-item>
        <el-menu-item index="Settings">设置</el-menu-item>
    </el-menu>
</template>

<script>
import Setting from '@/utils/setting';

export default {
    props: {
        closeDrawer: {
            type: Function,
            default: null,
        },
    },
    data() {
        return {
            showMoniter: false,
        };
    },
    created() {
        this.showMoniter = Setting.get("showMoniter");
    },
    methods: {
        handleSelect(index) {
            this.$router.push({ path: "/" + index.toLowerCase() });
            if (this.closeDrawer) {
                this.closeDrawer();
            }
        },
    },
};
</script>
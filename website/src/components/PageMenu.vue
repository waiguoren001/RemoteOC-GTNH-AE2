<template>
    <el-menu default-active="Index" class="el-menu-vertical-page" @select="handleSelect" style="height: 100%;">
        <el-menu-item index="Index">主页</el-menu-item>
        <el-menu-item v-if="showMoniter" index="Monitor">监控</el-menu-item>
        <el-menu-item index="Items">终端</el-menu-item>
        <el-menu-item index="Cpus">CPUs</el-menu-item>
        <el-menu-item index="Tasks">任务</el-menu-item>
        <el-menu-item index="Settings">设置</el-menu-item>
    </el-menu>
</template>

<script>
export default {
    data() {
        return {
            showMoniter: false,
        };
    },
    created() {
        this.showMoniter = localStorage.getItem("showMoniter") === "true" || false;
    },
    methods: {
        handleSelect(index) {
            this.$router.push({ path: "/" + index.toLowerCase() });
        },
    },
};
</script>
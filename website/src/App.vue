<template>
    <el-container style="height: 100%;">
        <el-header style="height: 60px;">
            <div class="toolbar">
                <div class="title-container">
                    <el-link href="/" :underline="false">
                        <h1 class="title">{{ pageTitle }}</h1>
                    </el-link>
                </div>
                <div class="content">
                    <el-link href="https://github.com/z5882852/RemoteOC-GTNH-AE2" target="_blank" :underline="false">
                        <el-icon :size="30">
                            <svg t="1734116698512" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="4255" width="256" height="256">
                                <path
                                    d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
                                    p-id="4256" fill="#2c2c2c"
                                    data-spm-anchor-id="a313x.search_index.0.i0.21af3a818Eu8eB" class="selected"></path>
                            </svg>
                        </el-icon>
                    </el-link>
                </div>
            </div>
        </el-header>
        <el-container style="height: 100%;">
            <el-aside width="200px" style="height: calc(100vh - 60px);">
                <el-menu default-active="index" class="el-menu-vertical-demo" @select="handleSelect"
                    style="height: 100%;">
                    <el-menu-item index="Index">主页</el-menu-item>
                    <el-menu-item index="Items">物品</el-menu-item>
                    <el-menu-item index="Cpus">CPUs</el-menu-item>
                    <el-menu-item index="Tasks">任务</el-menu-item>
                    <el-menu-item index="Settings">设置</el-menu-item>
                </el-menu>
            </el-aside>
            <el-main style="height: calc(100vh - 60px); padding: 0;">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            pageTitle: "",
        };
    },
    created() {
        this.pageTitle = localStorage.getItem("pageTitle") || "GTNH赛博监工";
        document.title = this.pageTitle;
    },
    methods: {
        handleSelect(key, keyPath) {
            this.$router.push({ name: key });
        },
    },
};
</script>

<style scoped>
.el-container {
    height: 100%;
}

.el-header {
    position: relative;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-text-color-primary);
    padding: 0 32px;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    right: 20px;
}

.toolbar .title-container {
    display: flex;
    align-items: center;
    height: 100%;
}

.toolbar .content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-grow: 1;
    height: 100%;
}

.title {
    font-size: 18px;
}
</style>

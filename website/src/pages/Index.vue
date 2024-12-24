<template>
    <div>
        <el-row :gutter="20" justify="center" align="middle" style="margin: 0; margin-top: 5%;">
            <el-col :span="8" style="text-align: center;">
                <el-image src="/img/gtnh.png" alt="GTNH" style="width: 40%; height: auto;" />
            </el-col>
            <el-col :span="8" style="text-align: center;">
                <el-image src="/img/oc.png" alt="OpenComputers" style="width: 40%; height: auto;" />
            </el-col>
        </el-row>

        <div style="text-align: center; margin-top: 5%;">
            <el-space direction="vertical" style="gap: 24px 0px">
                <el-text class="title" size="large">GTNH赛博监工</el-text>
                <el-text size="large">基于 OpenComputers 的 GTNH AE2 远程控制框架</el-text>
                <el-text size="large">当前版本 <el-tag size="large">GTNH 2.6.0</el-tag></el-text>
                <a href="https://github.com/z5882852/RemoteOC-GTNH-AE2" target="_blank"><el-button size="large" round>GitHub</el-button></a>
            </el-space>
        </div>
        <div v-if="isMobile" style="text-align: center; margin-top: 5%;">
            <el-space direction="vertical" style="gap: 24px 0px">
                <el-text>使用PC端以获得更好的体验</el-text>
            </el-space>
        </div>
    </div>
</template>

<script>
import { inject } from 'vue';

export default {
    name: 'Index',
    data() {
        return {
        };
    },
    setup() {
        const isMobile = inject('isMobile');
        return {
            isMobile,
        };
    },
    methods: {
    },
    created() {
    },
    beforeUnmount() {
    },
};
</script>

<style scoped>
.title {
    font-size: 28px;
}
</style>
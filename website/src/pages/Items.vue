<template>
    <el-container style="height: 100%;" v-loading="loading">
        <el-header v-loading="headerLoading" :element-loading-text="headerLoadingText" class="control-header">
            <el-card class="control-card" shadow="hover">
                <div class="control-bar">
                    <span>最近更新时间: {{ lastUpdate }}</span>
                    <el-button type="primary" @click="getItems">获取物品信息</el-button>
                </div>
            </el-card>
        </el-header>
        <el-main style="width: 100%;">
            <el-card class="box-card">
                <div class="card-container">
                    <!-- <el-row :gutter="20"> -->
                    <!-- <el-col v-for="(item, index) in items" :key="index" :span="4"> -->
                    <el-card v-for="(item, index) in items" :key="index" class="item-card" shadow="hover">
                        <div class="image-wrapper">
                            <img :src="item.image || ''" class="component-image" />
                            <div class="item-info">
                                <div class="ellipsis" :title="item.title">{{ item.title }}</div>
                                <div class="words" :title="item.label">{{ item.label }}</div>
                                <div>数量: {{ item.size }}</div>
                                <div v-if="item.isCraftable"><el-tag size="small" type="success">可合成</el-tag></div>
                                <el-tooltip placement="top">
                                    <template #content>
                                        <div style="font-size: 12px; color: #aaa;">其他属性</div>
                                        <div v-for="(value, key, index) in item.data" :key="index" :title="value"
                                            @click="copyToClipboard(value)" class="words">
                                            {{ key }}: {{ value }}
                                        </div>
                                        <div style="font-size: 10px; color: #aaa;">点击复制属性值</div>
                                    </template>
                                    <el-icon size="large" class="info-icon">
                                        <InfoFilled />
                                    </el-icon>
                                </el-tooltip>
                                <el-tooltip placement="top" v-if="item.isCraftable">
                                    <template #content>
                                        下单制作
                                    </template>
                                    <el-icon size="large" class="craft-icon" @click="craftItem(item.data.name, item.data.damage)">
                                        <GoodsFilled />
                                    </el-icon>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-card>
                    <!-- </el-col> -->
                    <!-- </el-row> -->
                </div>
            </el-card>
        </el-main>

    </el-container>
</template>

<script>
import { fetchStatus, addTask, createPollingController } from '@/utils/task'
import itemUtil from "@/utils/items";
import nbt from "@/utils/nbt"

export default {
    name: 'Items',
    data() {
        return {
            loading: true,
            headerLoading: false,
            headerLoadingText: "请求已发送，等待客户端响应... Task id: getAllItems",
            lastUpdate: "",
            items: [
                {
                    name: "test",
                    label: "test",
                    size: "test",
                    data: {
                        tag: "123"
                    }
                }
            ],
            pollingController: null,
        };
    },
    created() {
    },
    mounted() {
        this.startPolling("getAllItems");
    },
    methods: {
        startPolling(taskId) {
            this.pollingController = createPollingController();
            fetchStatus(taskId, this.handleTaskResult, 1000, this.pollingController);
        },
        stopPolling() {
            if (this.pollingController) {
                this.pollingController.stop();
                console.log('Polling stopped.');
            }
        },
        handleTaskResult(data) {
            console.log('Task result:', data);
            this.loading = false;
            this.headerLoading = false;

            if (data.result) {
                try {
                    let result = data.result;
                    console.log(nbt)
                    this.lastUpdate = data.completed_time ? data.completed_time.split(".")[0].replace("T", " ") : '未知';
                    let items = result;
                    let new_items = []
                    for (let item of items) {
                        let { image, title, size, isCraftable, label, ...data } = item;
                        if (data.hasTag && nbt) {
                            nbt.parse(nbt.base64ToUint8Array(data.tag), (e, unzipNbt) => {
                                if (e) {
                                    console.log(e)
                                } else {
                                    data.tag = JSON.stringify(unzipNbt)
                                }
                            })
                        }
                        let new_item = {
                            image: itemUtil.getIcon(item),
                            title: itemUtil.getName(item),
                            label: item.label,
                            size: item.size,
                            isCraftable: item.isCraftable,
                            data: data
                        }
                        new_items.push(new_item);
                    }
                    this.items = new_items;

                } catch (e) {
                    console.error(e, data);
                    this.$message.warning(e);
                }
            } else {
                this.$message.warning(`返回数据为空!`);
            }
        },
        getItems() {
            this.headerLoading = true;
            addTask("getAllItems")
            this.startPolling("getAllItems");
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.$message({
                    message: '复制成功!',
                    type: 'success'
                });
            }).catch(err => {
                this.$message({
                    message: '复制失败',
                    type: 'error'
                });
                console.error('复制失败:', err);
            });
        },
        craftItem(name, damage) {
            console.log("craft", name, damage)
        }
    }
};
</script>

<style>
.box-card .el-card__body {
    padding: 16px;
}

.item-card {
    flex: 0 0 300px;
    height: 100px;
}

.item-card .el-card__body {
    height: 100%;
    padding: 8px;
}

.control-header {
    width: 100%;
    margin-top: 10px;
}

.control-header .el-loading-spinner .circular {
    height: 24px;
    width: 24px;
}

.el-popper {
    max-width: 400px;
}
</style>

<style scoped>
.el-container {
    height: 100%;
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    /* 控制卡片之间的间距 */
    justify-content: flex-start;
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

.box-card {
    height: 100%;
    overflow-y: auto;
}

.box-card::-webkit-scrollbar {
    display: none;
    /* 隐藏滚动条 */
}

.ellipsis {
    font-size: 20px;
    line-height: 25px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: calc(100% - 20px);
}

.words {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.image-wrapper {
    display: flex;
    height: calc(100% - 16px);
}

.item-card {
    position: relative;
    margin-bottom: 8px;
}

.component-image {
    margin: auto 0;
    width: 48px;
    height: 48px;
    margin-right: 12px;
}

.item-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    /* 让信息块顶部对齐 */
    width: calc(100% - 60px);
    line-height: 1.5;
}

.info-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 20px;
    cursor: pointer;
}

.craft-icon {
    position: absolute;
    top: 28px;
    right: 8px;
    font-size: 20px;
    cursor: pointer;
}
</style>
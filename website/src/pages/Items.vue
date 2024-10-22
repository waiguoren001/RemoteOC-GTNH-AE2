<template>
    <el-container style="height: 100%;" v-loading="loading">
        <el-header v-loading="headerLoading" :element-loading-text="headerLoadingText" class="control-header-item">
            <el-card class="control-card" shadow="hover">
                <div class="control-bar">
                    <div style="display: flex;">
                        <el-segmented v-model="showCraft" :options="['全部', '可下单']" size="default" />
                        <el-input v-model="searchText" style="margin-left: 10px; width: 40vw; max-width: 400px;"
                            placeholder="请输入信息以查询">
                            <template #suffix>
                                <el-icon class="el-input__icon">
                                    <search />
                                </el-icon>
                            </template>
                            <template #prepend>
                                <el-select v-model="searchType" placeholder="查询类型" style="width: 100px">
                                    <el-option label="物品名" value="title" />
                                    <el-option label="标签名" value="label" />
                                    <el-option label="name" value="name" />
                                </el-select>
                            </template>
                        </el-input>
                    </div>

                    <el-button type="primary" @click="getItems">获取物品信息</el-button>
                </div>
            </el-card>
        </el-header>
        <el-main style="width: 100%; overflow: hidden;">
            <el-card class="box-card">
                <div class="card-container">
                    <el-card v-for="(item, index) in showItems" :key="index" class="item-card" style="height: 116px;"
                        shadow="hover">
                        <div class="image-wrapper">
                            <!-- <img :src="item.image || ''" class="component-image" /> -->
                            <el-image :src="item.image || ''" class="component-image" :alt="item.title" lazy>
                                <template #placeholder>
                                    <el-skeleton :loading="true" animated class="component-image">
                                        <template #template>
                                            <el-skeleton-item variant="image" style="width: 48px; height: 48px" />
                                        </template>
                                    </el-skeleton>
                                </template>
                                <template #error>
                                    <el-icon><icon-picture /></el-icon>
                                </template>
                            </el-image>

                            <div class="item-info">
                                <div class="ellipsis" :title="item.title">{{ item.title }}</div>
                                <div class="words" :title="item.label">{{ item.label }}</div>
                                <div>数量: {{ item.size }}</div>
                                <div v-if="item.isCraftable"><el-tag size="small" type="success">可合成</el-tag></div>
                                <el-tooltip placement="top">
                                    <template #content>
                                        <div style="font-size: 12px; color: #aaa;">Tooltip</div>
                                        <div>{{ item.title }}</div>
                                        <div v-for="(info, index) in item.tooltip" :key="index">
                                            {{ info }}
                                        </div>
                                        <div>{{ item.data.name }}:{{ item.data.damage }}</div>
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
                                    <el-icon size="large" class="craft-icon"
                                        @click="openCraftDialog(item.title, item.data.name, item.data.damage)">
                                        <GoodsFilled />
                                    </el-icon>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-card>
                </div>
                <div class="pagination-container">
                    <span>最近更新时间: {{ lastUpdate }}</span>
                    <el-pagination v-model:current-page="page.current" v-model:page-size="page.size"
                        :page-sizes="[50, 100, 200, 400]" size="small" layout="total, sizes, prev, pager, next, jumper"
                        :total="page.total" @size-change="handlePaginationChange"
                        @current-change="handlePaginationChange" />
                </div>
            </el-card>
        </el-main>
        <el-dialog v-model="showCraftDialog" :title="craftDialogTitle" width="500" align-center>
            <el-form :model="craft">
                <el-form-item label="下单数量">
                    <el-input v-model="craft.amount" type="number" placeholder="请输入下单数量" />
                </el-form-item>
                <el-form-item label="选择CPU">
                    <div style="width: 100%; display: flex; justify-content: space-between;">
                        <el-tooltip>
                            <template #content>
                                {{ craft.cpuOptions.length === 0 ? '请先获取CPU列表':'请选择CPU' }}
                            </template>
                            <el-select-v2 ref="select" :disabled="craft.cpuOptions.length === 0"
                                v-model="craft.selectCpu" :options="craft.cpuOptions" placeholder="自动分配"
                                style="width: 280px">
                                <template #footer>
                                    <span>仅能选择已命名且空闲的CPU</span>
                                </template>
                            </el-select-v2>
                        </el-tooltip>
                        <el-button type="primary" @click="getCpuList" :loading="craft.cpuBthLoading">获取CPU</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showCraftDialog = false">取消</el-button>
                    <el-button type="primary" @click="craftItem" :loading="craft.btnLoading">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </el-container>
</template>

<script>
import { fetchStatus, addTask, createCraftTask, createPollingController } from '@/utils/task'
import { Search } from '@element-plus/icons-vue'
import itemUtil from "@/utils/items";
import nbt from "@/utils/nbt"

export default {
    name: 'Items',
    components: {},
    data() {
        return {
            loading: true,
            headerLoading: false,
            headerLoadingText: "请求已发送，等待客户端响应... Task id: getAllItems",
            lastUpdate: "",
            showCraft: "全部",
            searchType: "title",
            searchText: "",
            items: [],
            showItems: [],
            page: {
                total: 0,
                size: parseInt(localStorage.getItem('pageSize')) || 50,
                current: 1,
            },
            pollingController: null,
            showCraftDialog: false,
            craftDialogTitle: "下单",
            craft: {
                name: null,
                damage: null,
                amount: 1,
                btnLoading: false,
                cpuBthLoading: false,
                selectCpu: null,
                cpuOptions: [],
            }
        };
    },
    created() {
    },
    mounted() {
        this.startPolling("getAllItems");
    },
    methods: {
        handlePaginationChange() {
            localStorage.setItem('pageSize', this.page.size);
            this.updateShowItems();
            // const start = (this.page.current - 1) * this.page.size;
            // const end = start + this.page.size;
            // this.showItems = this.items.slice(start, end);
        },
        startPolling(taskId) {
            this.pollingController = createPollingController();
            fetchStatus(taskId, this.handleTaskResult, this.handleTaskComplete, 1000, this.pollingController);
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

            if (data.result) {
                try {
                    let result = data.result;
                    this.lastUpdate = data.completed_time ? data.completed_time.split(".")[0].replace("T", " ") : '未知';
                    let items = result;
                    let new_items = []
                    for (let item of items) {
                        let { image, title, size, isCraftable, label, ...data } = item;
                        if (data.hasTag && nbt) {
                            nbt.parse(nbt.base64ToUint8Array(data.tag), (e, unzipNbt) => {
                                if (e) {
                                    console.error(e)
                                } else {
                                    data.tag = JSON.stringify(unzipNbt)
                                }
                            })
                        }
                        let item_ = itemUtil.getItem(item)
                        let new_item = {
                            image: itemUtil.getItemIcon(item_),
                            title: itemUtil.getName(item_, item, data) || item.label,
                            label: item.label,
                            size: item.size,
                            tooltip: item_ && item_.tooltip || [],
                            isCraftable: item.isCraftable,
                            data: data,
                        }
                        new_items.push(new_item);
                    }
                    this.items = new_items;
                    this.handlePaginationChange();
                } catch (e) {
                    console.error(e, data);
                    this.$message.warning(e);
                }
            } else {
                this.$message.warning(`返回数据为空!`);
            }
        },
        handleTaskComplete() {
            this.headerLoading = false;
        },
        getItems() {
            this.headerLoading = true;
            addTask("getAllItems", null, () => {
                this.startPolling("getAllItems")
            })
        },
        copyToClipboard(text) {
            if (typeof text === 'object') {
                text = JSON.stringify(text);
            }
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
        openCraftDialog(title, name, damage) {
            this.craft.name = name;
            this.craft.damage = damage;
            this.craft.amount = 1;
            this.craftDialogTitle = "下单-" + title;
            this.showCraftDialog = true;
        },
        craftItem() {
            let name = this.craft.name;
            let damage = this.craft.damage;
            let amount = this.craft.amount;
            let cpuName = this.craft.selectCpu;
            this.craft.btnLoading = true;
            console.log("craft：", name, damage, amount, cpuName)
            createCraftTask(name, damage, amount, cpuName, (data) => {
                this.craft.btnLoading = false;
                this.showCraftDialog = false;
            });
        },
        updateShowItems() {
            let filteredItems = this.items;
            if (this.showCraft === "可下单") {
                filteredItems = filteredItems.filter(item => item.isCraftable);
            }

            if (this.searchText) {
                filteredItems = filteredItems.filter(item => {
                    if (this.searchType === "label") {
                        return item.label && item.label.toLowerCase().includes(this.searchText.toLowerCase());
                    } else if (this.searchType === "name") {
                        return item.data.name && item.data.name.toLowerCase().includes(this.searchText.toLowerCase());
                    } else {
                        return item.title && item.title.toLowerCase().includes(this.searchText.toLowerCase());
                    }
                });
            }
            this.page.total = filteredItems.length;

            const start = (this.page.current - 1) * this.page.size;
            const end = start + this.page.size;
            this.showItems = filteredItems.slice(start, end);
        },
        getCpuList() {
            this.craft.cpuBthLoading = true;
            addTask("getCpuList", null, () => {
                fetchStatus("getCpuList", null, (data) => {
                    this.craft.cpuBthLoading = false;
                    if (data && data.result && data.result[0]) {
                        let cpuInfo = JSON.parse(data.result[0]);
                        if (cpuInfo.message && cpuInfo.message === "success") {
                            let cpuList = cpuInfo.data;
                            console.log(cpuList)
                            cpuList = cpuList.filter(cpu => !cpu.busy && cpu.name !== "");
                            this.craft.cpuOptions = cpuList.map(item => ({
                                value: item.name,
                                label: item.name,
                            }))
                            this.craft.cpuOptions.push({
                                label: "自动分配",
                                value: null,
                            })
                            this.$message.success(`获取CPU列表成功`)
                        } else {
                            this.$message.error(`获取CPU列表失败: ${cpuInfo.message}`)
                        }
                    } else {
                        this.$message.error("获取CPU列表失败")
                    }
                });
            })
        }
    },
    watch: {
        items() {
            this.updateShowItems();
        },
        showCraft() {
            this.updateShowItems();
        },
        searchType() {
            this.updateShowItems();
        },
        searchText() {
            this.updateShowItems();
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

}

.item-card .el-card__body {
    height: 100%;
    padding: 8px;
}

.control-header-item {
    width: 100%;
    margin-top: 10px;
}

.control-header-item .el-card__body {
    height: 100%;
    padding: 8px;
}

.control-header-item .el-loading-spinner .circular {
    height: 24px;
    width: 24px;
}

.el-popper {
    max-width: 400px;
}

.box-card {
    height: 100%;
}

.box-card .el-card__body {
    height: 100%;
}

.el-pagination {
    justify-content: flex-end;
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

.pagination-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: auto 0;
    height: 36px;
    padding-right: 10px;
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
    height: calc(100% - 32px);
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
    position:absolute;
    top: 28px;
    right: 8px;
    font-size: 20px;
    cursor: pointer;
}
</style>
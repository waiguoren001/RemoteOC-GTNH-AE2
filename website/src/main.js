import { createApp, ref } from 'vue'
import App from './App.vue'

//导入路由
import router from './router/index'

// 导入事件总线
import eventBus from 'vue3-eventbus'

//全局导入Element plus
import ElementPlus from 'element-plus'
import locale from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App);

app.use(router);
app.use(eventBus);
app.use(ElementPlus, { locale });

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.provide('detailManageTable', ref(true));

app.mount('#app')


import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        compression({
            algorithm: 'gzip', // 指定压缩算法为gzip
            include: /\.jsx?|\.css$/i, // 只压缩JS和CSS文件
            threshold: 1024, // 大于1KB的文件才压缩
          }),
    ],
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('echarts')) {
                        return 'echarts'; // 将 echarts 单独打包
                    }

                    if (id.includes('element-plus')) {
                        return 'element'; // 将 element-plus 单独打包
                    }

                    if (id.includes('node_modules')) {
                        return 'vendor'; // 将其余的 node_modules 打包为 vendor
                    }
                }
            }
        }
    }
});

import axios from "axios";
import pako from "pako";
import Setting from '@/utils/setting';


const itemUtil = {
    items: null,
    fluids: null,

    loadWithProgress(url, progressCallback) {
        axios.get(url, {
            onDownloadProgress: (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round(
                        (event.loaded / event.total) * 100
                    );
                    progressCallback(percentCompleted);
                }
            },
        }).then((res) => {

            progressCallback(100);
        });
    },

    loadItems(progressCallback) {
        if (!this.items) {
            let url = (Setting.get("cdnPath")) + "/items.json";
            if (Setting.get("useGzip")) {
                url += ".gz";
            }
            axios.get(url, {
                onDownloadProgress: (event) => {
                    if (event.lengthComputable) {
                        const percentCompleted = Math.round((event.loaded / event.total) * 100);
                        if(progressCallback) progressCallback(percentCompleted);  // 更新进度
                    }
                },
            }).then((res) => {
                // 响应码判断
                if (res.status === 200) {
                    this.items = res.data;
                    if(progressCallback) progressCallback(100);
                } else {
                    console.error(`Error loading items: ${res.status}`);
                    if(progressCallback) progressCallback(-1);
                }
            }).catch((error) => {
                console.error("Error loading items:", error);
                if(progressCallback) progressCallback(-1);
            });
        } else {
            if(progressCallback) progressCallback(100);
        }
    },

    loadFluids(progressCallback) {
        if (!this.fluids) {
            let url = (Setting.get("cdnPath")) + "/fluids.json";
            if (Setting.get("useGzip")) {
                url += ".gz";
            }
            axios.get(url, {
                onDownloadProgress: (event) => {
                    if (event.lengthComputable) {
                        const percentCompleted = Math.round((event.loaded / event.total) * 100);
                        if(progressCallback) progressCallback(percentCompleted);
                    }
                },
            }).then((res) => {
                // 响应码判断
                if (res.status === 200) {
                    this.fluids = res.data;
                    if(progressCallback) progressCallback(100);
                } else {
                    console.error(`Error loading fluids: ${res.status}`);
                    if(progressCallback) progressCallback(-1);
                }
            }).catch((error) => {
                console.error("Error loading fluids:", error);
                if(progressCallback) progressCallback(-1);
            });
        } else {
            if(progressCallback) progressCallback(100);
        }
    },

    isItem: (obj) => {
        return obj && obj["name"] && obj["damage"] !== null;
    },

    getItem(obj) {
        if (this.isItem(obj)) {
            const items = this.items;
            let name = obj["name"];
            if (!items[name]) {
                name = name.replaceAll("|", "_");
                if (!items[name]) return null;
            }
            const damage = (obj["damage"] ? obj["damage"] : 0) + "";
            return items[name][damage];
        }
        return null;
    },

    getName(item, originItem, data) {
        if (item) {
            let name = item && item.zh ? item.zh : item.en;
            if (originItem.name === "ae2fc:fluid_drop") {
                if (data && data.tag) {
                    try {
                        let tag = JSON.parse(data.tag);
                        let fluidId = tag.value.Fluid.value;
                        let fluids = this.fluids;
                        name = fluids[fluidId].zh;
                    } catch (err) {
                        name = originItem.label.replace("drop of ", "");
                    }
                } else {
                    name = originItem.label.replace("drop of ", "");
                }
            }
            return name;
        }
        return null;
    },

    getItemIcon: (item) => {
        if (item) {
            return "img/items/" + item.img_path;
        }
        return "img/default.png";
    },

    getFluidIcon: (data) => {
        // name必为ae2fc:fluid_drop
        if (data) {
            if (data.tag) {
                try {
                    let tag = JSON.parse(data.tag);
                    let fluidId = tag.value.Fluid.value;
                    return "img/fluids/" + fluidId + ".png";
                } catch (err) {
                    return "img/default.png";
                }
            }
        }
        return "img/default.png";
    },
};

export default itemUtil;
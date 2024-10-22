import items from "./items.json"
import fluids from "./fluids.json"

const itemUtil = {
    isItem: (obj) => {
        return obj && obj["name"] && obj["damage"] !== null
    },
    getItem: (obj) => {
        if (itemUtil.isItem(obj)) {
            let name = obj["name"]
            if (!items[name]) {
                name = name.replaceAll("|", "_")
                if (!items[name]) return null
            }
            const damage = (obj["damage"] ? obj["damage"] : 0) + ""
            return items[name][damage]
        }
        return null
    },
    getName: (item, originItem, data) => {
        if (item) {
            let name = item && item.zh ? item.zh : item.en;
            if (originItem.name === "ae2fc:fluid_drop") {
                if (data && data.tag) {
                    try {
                        let tag = JSON.parse(data.tag)
                        let fluidId = tag.value.Fluid.value;
                        name = fluids[fluidId].zh;
                    } catch (err) {
                        name = originItem.label.replace("drop of ", "")
                    }
                } else {
                    name = originItem.label.replace("drop of ", "")
                }
            }
            return name
        }
        return null
    },
    getItemIcon: (item) => {
        if (item) {
            return "img/items/" + item.img_path
        }
        return "img/default.png"
    },
    getFluidIcon: (obj) => {

    }
}

export default itemUtil
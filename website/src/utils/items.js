import items from "./items.json"

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
    getName: (item) => {
        if (item) {
            let name = item && item.zh ? item.zh : item.en;
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
local component = require("component")

-- 获取兰波顿电容库
local capacitor = component.proxy("91d6e3f9-81cf-4f66-b51f-4eb2a9bf28b8")

function getCapacitorInfo()
    return capacitor.getSensorInformation();
end

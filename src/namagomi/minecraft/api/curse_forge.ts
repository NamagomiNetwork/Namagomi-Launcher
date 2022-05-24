import urlJoin from "url-join"
import {curseForgeApiBaseUrl, curseForgeApiKey} from "../../settings/config"
import {jsonToModSearchParam} from "./NamagomiApi"

const headers = {
    "Accept": "application/json",
    "x-api-key": curseForgeApiKey
}

const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), { headers })
    return await response.json()
}

const fetchJsons = async (urls: Array<URL>) => {
    return await Promise.all(urls.map(fetchJson))
}

const getModFileUrl = (param: ModSearchParam) => {
    if (param.directUrl !== "")
        return new URL(param.directUrl)
    const url = new URL(urlJoin(curseForgeApiBaseUrl, "/v1/mods", param.modid, "files"))
    if (!url.searchParams.has("gameVersion"))
        url.searchParams.append("gameVersion", param.gameVersion)
    return url
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = (json: JSON, param: ModSearchParam) => {
    
}

export const testFunc = () => {
    const sampleJson = "[\n" +
        "    {\n" +
        "        \"name\": \"mekanism\",\n" +
        "        \"mod-id\": 268560,\n" +
        "        \"mc-version\": \"1.12.2\"\n" +
        "    },\n" +
        "    {\n" +
        "        \"name\": \"sakura\",\n" +
        "        \"mod-id\": null,\n" +
        "        \"mc-version\": \"1.12.2\",\n" +
        "        \"direct-url\": \"https://github.com/KisaragiEffective/Sakura_mod/releases/download/1.0.8-1.12.2%2Bflavored.ksrg.4/Sakura-1.0.8-1.12.2+flavored.ksrg.4.jar\",\n" +
        "    }\n" +
        "]"
    const params = jsonToModSearchParam(sampleJson)
    const urls = getModFileUrls(params)
    const jsons = fetchJsons(urls)
}
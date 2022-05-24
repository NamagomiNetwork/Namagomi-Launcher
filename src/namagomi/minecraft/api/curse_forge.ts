import urlJoin from "url-join";
import {curseForgeApiBaseUrl, curseForgeApiKey} from "../../settings/config";
import {jsonToModSearchParam} from "./NamagomiApi";

const headers = {
    "Accept": "application/json",
    "x-api-key": curseForgeApiKey
}

const fetchJson = async (url: string) => {
    const response = await fetch(url, {
        headers
    });
    return await response.json();
}

const getModFileUrls = (modId: string) => {
    return new URL(urlJoin(curseForgeApiBaseUrl, "/v1/mods", modId));
}

const getModFileUrl = (param: ModSearchParam) => {
    if (param.directUrl !== "")
        return new URL(param.directUrl);
    const url = new URL(urlJoin(curseForgeApiBaseUrl, "/v1/mods", param.modid, "files"));
    if (!url.searchParams.has("gameVersion"))
        url.searchParams.append("gameVersion", param.gameVersion);
    return url
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    params.map()
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
    jsonToModSearchParam(sampleJson)
    const url = getModFileUrl("268560")("1.12.2");
    url.searchParams.append("gameVersion", "1.12.2");
    fetchJson(url.toString())
        .then(json=>
        {
            console.log(json.data[0].displayName)
            console.log(json.data[0].downloadUrl);
        });
}
import urlJoin from "url-join";
import {curseForgeApiBaseUrl} from "../../settings/config";

const getModFileUrl = (modId: string) => {
    return urlJoin(curseForgeApiBaseUrl, "/v1/mods", modId);
}
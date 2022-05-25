import urlJoin from 'url-join'
import {curseForgeApiBaseUrl, curseForgeApiKey} from '../../settings/config'
import {jsonToModSearchParam} from './NamagomiApi'
import {sampleGomiJson} from './sample';
import {ModSearchParam} from './ModSearchParam';

const headers = {
    'Accept': 'application/json',
    'x-api-key': curseForgeApiKey
}

const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), {headers})
    return await response.json()
}

const fetchJsons = async (urls: Array<URL>) => {
    return await Promise.all(urls.map(fetchJson))
}

const getModFileUrl = (param: ModSearchParam) => {
    if (param.directUrl !== '')
        return new URL(param.directUrl)
    const url = new URL(urlJoin([curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files']))
    if (!url.searchParams.has('gameVersion'))
        url.searchParams.append('gameVersion', param.gameVersion)
    const json = fetchJson(url)
    const trimmed = trimJson(json, param)
    param.displayName = trimmed.displayName
    return new URL(trimmed.downloadUrl)
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = (json: any, param: ModSearchParam) => {
    const pattern = param.fileNamePattern
    return json.data.find((j: any) => j.fileName.indexOf(pattern) != -1)
}

const trimJsons = (jsons: Array<any>, params: Array<ModSearchParam>) => {
    return jsons.map((json: any, index) => trimJson(json, params[index]))
}

export const testFunc = () => {
    const params = jsonToModSearchParam(sampleGomiJson)
    const urls = getModFileUrls(params)
    console.log(urls)
}
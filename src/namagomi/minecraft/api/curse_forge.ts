import urlJoin from 'url-join'
import {curseForgeApiBaseUrl, curseForgeApiKey, namagomiModListUrl} from '../../settings/config'
import {jsonToModSearchParam} from './NamagomiApi'
import {ModSearchParam} from './ModSearchParam';

const headers = {
    'Accept': 'application/json',
    'x-api-key': curseForgeApiKey
}

const fetchJson = async (url: URL) => {
    const response = await fetch(url.toString(), {headers})
    return response.json()
}

const fetchJsons = async (urls: Array<URL>) => {
    return await Promise.all(urls.map(fetchJson))
}

const getModFileUrl = async (param: ModSearchParam) => {
    if (param.directUrl != '')
        return new URL(param.directUrl)
    const url = new URL(urlJoin([curseForgeApiBaseUrl, '/v1/mods', param.modid, 'files']))
    if (!url.searchParams.has('gameVersion'))
        url.searchParams.append('gameVersion', param.gameVersion)
    const json = fetchJson(url)
    const trimmed = await trimJson(json, param)
    param.displayName = trimmed['displayName'] != null ? trimmed['displayName'] : ''
    if (trimmed.downloadUrl == null) {
        console.error(`modid:${param.modid} gameversion:${param.gameVersion} ${param.fileNamePattern} doesn't have download url`)
        return null
    } else
        return new URL(trimmed.downloadUrl)
}

const getModFileUrls = (params: Array<ModSearchParam>) => {
    return params.map(getModFileUrl)
}

const trimJson = async (json: any, param: ModSearchParam) => {
    const pattern = param.fileNamePattern
    return await json.then((data: any) => {
        const single = data.data.find((j: any) => j.fileName.indexOf(pattern) != -1)
        if (single == null)
            console.error(`${param.modid} ${param.gameVersion} ${param.fileNamePattern} not found`)
        return single
    })
}

const trimJsons = (jsons: Array<any>, params: Array<ModSearchParam>) => {
    return jsons.map((json: any, index) => trimJson(json, params[index]))
}

export const testFunc = async () => {
    const p = (await fetch(namagomiModListUrl))
    p.text().then(text => {
        const params = jsonToModSearchParam(text)
        const urls = getModFileUrls(params)
        urls.map(url => {
            //url.then(console.log)
        })
    })
}
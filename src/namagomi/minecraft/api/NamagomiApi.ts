import {ModSearchParam} from './ModSearchParam'

export const jsonToModSearchParam = (json: string) => {
    const result: Array<ModSearchParam> = []
    JSON.parse(json).map((item:any) =>
    {
        const modid = item['mod-id'] != null ? item['mod-id'].toString() : ''
        const gameVersion = item['mc-version']
        const fileNamePattern = 'mod-version' in item ? item['mod-version'] : ''
        const directUrl = 'direct-url' in item ? item['direct-url'] : ''
        const side = 'side' in item ? item['side'] : ''
        result.push(new ModSearchParam(modid, gameVersion, fileNamePattern, directUrl, side))
    })
    return result
}
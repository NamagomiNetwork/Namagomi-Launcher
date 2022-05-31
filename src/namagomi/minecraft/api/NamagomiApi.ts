import {ModSearchParam} from './mods/ModSearchParam'
import {GetNamagomiModList} from "./mods/JsonTypes/GetNamagomiModList";

export const jsonToModSearchParams = (json: GetNamagomiModList) => {
    const result: Array<ModSearchParam> = []
    json.map((item) =>
    {
        const modId = item.modId != null ? item.modId.toString() : ''
        const gameVersion = item.mcVersion
        const fileNamePattern = item.modVersion !== undefined ? item.modVersion : ''
        const directUrl = item.directUrl !== undefined ? item.directUrl : ''
        const side = item.side !== undefined ? item.side : ''
        result.push(new ModSearchParam(modId, gameVersion, fileNamePattern, directUrl, side))
    })
    return result
}
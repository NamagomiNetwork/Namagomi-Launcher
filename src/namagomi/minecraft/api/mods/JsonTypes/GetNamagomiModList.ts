import {ModList} from "../../../../../web/ModList";
export type GetNamagomiModList = ModList[]

interface ModList{
    name?: string
    modId: number
    mcVersion: string
    modVersion?: string
    directUrl?: string
    side?: 'SERVER' | 'CLIENT' | ''
}
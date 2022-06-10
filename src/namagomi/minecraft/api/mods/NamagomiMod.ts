import {None, Option, Some} from "fp-ts/Option";

export interface NamagomiMod{
    side: 'SERVER' | 'CLIENT' | ''
    fileName: string
    downloadUrl: Some<string>  | None
    curseForge: Option<CurseForge>
}

export interface CurseForge{
    id: string
    gameVersion: string
    fileId: string
    hashes: Hash[]
}

export interface Hash{
    value: string
    algo: number
}
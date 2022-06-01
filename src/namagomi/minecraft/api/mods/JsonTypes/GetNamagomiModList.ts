export type GetNamagomiModList = GetNamagomiMod[]

export interface GetNamagomiMod {
    name?: string
    modId?: string
    mcVersion: string
    modVersion?: string
    directUrl?: string
    side: 'SERVER' | 'CLIENT' | ''
}
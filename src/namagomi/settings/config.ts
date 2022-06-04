import path from "path";

export const curseForgeApiBaseUrl = 'https://api.curseforge.com'
export const curseForgeApiKey = '$2a$10$yZxE0Hr8YIFv3ZA2Z9T/julePcDjXYNHEzAT1VuCykgKlUJI1HIby'
export const namagomiModListUrl = 'https://raw.githubusercontent.com/NamagomiNetwork/Namagomi-mod/main/mod/mod_list.json'
export const namagomiFileUrlBase = (branch: string, path: string) => `https://raw.githubusercontent.com/NamagomiNetwork/Namagomi-mod/${branch}/${path}`
export const namagomiDataFileUrlBase = (branch: string, file: string) => namagomiFileUrlBase(branch, path.join('data', file))
import fs from "fs";

export type NamagomiIgnore = string[]

export function mkEmptyNamagomiIgnore(path: string) {
    fs.writeFileSync(path, JSON.stringify([]))
}
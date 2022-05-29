import fs from "fs";

export type NamagomiIgnore = string[]

export function mkEmptyFile(path: string) {
    fs.writeFileSync(path, JSON.stringify([]))
}
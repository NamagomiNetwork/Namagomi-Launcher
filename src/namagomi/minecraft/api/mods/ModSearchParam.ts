export class ModSearchParam {
    modId: string
    gameVersion: string
    fileNamePattern: string
    directUrl: string
    side: "CLIENT" | "SERVER" | ""
    displayName: string
    fileName: string
    constructor(modId: string, gameVersion: string, fileNamePattern: string, directUrl: string, side: "CLIENT" | "SERVER" | "") {
        this.modId = modId
        this.gameVersion = gameVersion
        this.fileNamePattern = fileNamePattern
        this.directUrl = directUrl
        this.side = side
        this.displayName = ""
        this.fileName = ""
    }
}
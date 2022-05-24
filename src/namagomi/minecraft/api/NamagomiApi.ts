export const jsonToModSearchParam = (json: string) => {
    const result: Array<ModSearchParam> = [];
    JSON.parse(json).map((item:any) =>
    {
        const modid = item.modid;
        const gameVersion = item.mcversion;
        const fileNamePattern = "mod-version" in item ? item.modversion : "";
        const directUrl = "direct-url" in item ? item.downloadUrl : "";
        const side = "side" in item ? item.side : "";
        result.push(new ModSearchParam(modid, gameVersion, fileNamePattern, directUrl, side));
    });
    return result
}
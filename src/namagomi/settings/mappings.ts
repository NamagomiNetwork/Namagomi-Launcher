export function getFileName(url: string){
    switch (url) {
        case 'https://web.archive.org/web/20190716014402/http://forum.minecraftuser.jp/download/file.php?id=75930':
            return '[1.12][forge2413]mod_StorageBox_v3.2.0.zip'
        default:
            return  url.split('/').pop()!.split('?')[0].split('#')[0]
    }
}
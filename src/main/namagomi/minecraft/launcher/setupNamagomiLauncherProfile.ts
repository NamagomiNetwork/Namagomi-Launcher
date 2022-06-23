import {apply, set, build} from "./LauncherProfileBuilder"
import {mainDir} from "../../settings/localPath"
import {pipe} from "fp-ts/function";
import {log} from '../../../../generic/Logger'

const namagomiBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAAAAADmVT4XAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABFSURBVHhe7c6hEQAgDATBQK2URbGYDC4ChciuefUzFwAAAAAAAABAeyP32rmVlVt5/c/cbwQIECBAgAABAAAAAABAdxEHuD0CIPKU7VAAAAAASUVORK5CYII="

export function setup(side: string) {
    pipe(
        apply(),
        set('uniqueId', 'namagomi'),
        set('gameDir', mainDir(side)),
        set('icon', namagomiBase64),
        set('name', '生ゴミ鯖'),
        set('lastVersionId', '1.12.2-forge-14.23.5.2860'),
        set('type', 'custom'),
        build
    )
    log.info('complete: launcher profile setup')
}
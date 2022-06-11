import React, {useEffect, useState} from "react";
import {AddMods} from "./AddMods";

type Props = {}

export const Buttons = ({}: Props) => {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [manuallyMods, setManuallyMods] = useState<string[]>([])

    useEffect(() => {
        checkUpdate()
    })

    function setup() {
        const side = 'CLIENT'
        window.namagomiAPI.downloadClientModFiles().then((mods)=>{
            setManuallyMods(mods)
            return window.namagomiAPI.downloadAllConfigFiles(side)
        }).then(() => {
            return window.namagomiAPI.setupNamagomiLauncherProfile(side)
        })
    }

    function checkUpdate() {
        window.namagomiAPI.isLatestMods('CLIENT').then((isLatest)=>{
            setUpdateAvailable(!isLatest)
        })
    }

    return (
        <div id={"buttons"}>
            <button onClick={async () => {
                setup()
                checkUpdate()
            }}>Update
            </button>

            <button
                onClick={() => checkUpdate()}>updatable: {updateAvailable ? '更新可能' : '最新の状態です'}</button>

            <button onClick={() => window.namagomiAPI.OpenFolder('CLIENT')}>OpenFolder</button>

            <br/>
            {
                manuallyMods.length === 0
                    ? <p></p>
                    : <p>以下のmodは手動でダウンロードしてください</p>
            }
            {
                manuallyMods.map((mod, index) =>
                    <a key={index} href={mod} target={"_blank"} rel={"noopener nofollow"}>
                        {mod}<br/>
                    </a>)}

            <AddMods/>
        </div>
    )
}

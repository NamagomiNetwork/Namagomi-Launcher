import React, {useEffect, useState} from 'react'
import {AddMods} from './AddMods'

type Props = { side: string }

export const Buttons = ({side}: Props) => {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [manuallyMods, setManuallyMods] = useState<string[]>([])
    const [disable, setDisable] = useState(false)

    useEffect(() => {
        checkUpdate()
    })

    async function setup() {
        setDisable(true)
        window.namagomiAPI.setupNamagomiLauncherProfile(side)
        const mods = await window.namagomiAPI.downloadModFiles(side)
        setManuallyMods(mods)
        await window.namagomiAPI.downloadAllConfigFiles(side)
        setDisable(false)
    }

    function checkUpdate() {
        window.namagomiAPI.isLatestMods('CLIENT').then((isLatest) => {
            setUpdateAvailable(!isLatest)
        })
    }

    return (
        <div id={'buttons'}>
            <button onClick={async () => {
                await setup()
                checkUpdate()
            }} disabled={disable}>Update
            </button>

            <button
                onClick={() => checkUpdate()}>updatable: {updateAvailable ? '更新可能' : '最新の状態です'}</button>

            <button onClick={() => window.namagomiAPI.OpenFolder(side)}>OpenFolder</button>
            <button onClick={window.namagomiAPI.openLogsFolder}>OpenLogs</button>

            <br/>
            {
                manuallyMods.length === 0
                    ? <p></p>
                    : <p>以下のmodは手動でダウンロードしてください</p>
            }
            {
                manuallyMods.map((mod, index) =>
                    <a key={index} href={mod} target={'_blank'} rel={'noopener nofollow'}>
                        {mod}<br/>
                    </a>)}

            <AddMods side={side}/>
        </div>
    )
}

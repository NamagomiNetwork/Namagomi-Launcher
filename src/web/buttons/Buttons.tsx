import React, {useState} from 'react'
import {AddMods} from './AddMods'

type Props = { side: string }

export const Buttons = ({side}: Props) => {
    const [manuallyMods, setManuallyMods] = useState<string[]>([])
    const [disable, setDisable] = useState(false)

    async function setup() {
        setDisable(true)
        await window.namagomiAPI.setupNamagomiLauncherProfile(side)
        const mods = await window.namagomiAPI.downloadModFiles(side)
        setManuallyMods(mods)
        await window.namagomiAPI.downloadAllConfigFiles(side)
        setDisable(false)
    }

    return (
        <div id={'buttons'}>
            <button onClick={async () => {
                await setup()
                window.namagomiAPI.checkUpdate(side).then()
            }} disabled={disable}>Update
            </button>

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

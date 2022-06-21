import React, {useEffect} from 'react'
import './Log.css'
import IpcRendererEvent = Electron.IpcRendererEvent

export const Log = () => {
    const [log, setLog] = React.useState<string>('Logだよ～ん\n|log|log|log|log|\nlogはこちらです\nうるさかったですか？すみません')

    useEffect(() => {
        window.namagomiAPI.log((event: IpcRendererEvent, level: string, contents: string) => {
                const built = buildLog(level, contents)
                setLog((l) => `${l}\n${built}`)
            }
        )
    }, [])

    useEffect(() => {
        const logElement = document.getElementById('log')
        if (logElement !== null)
            logElement.scrollTop = logElement.scrollHeight
    }, [log])

    return (
        <div className="log">
            <textarea id={'log'} readOnly={true} value={log} wrap={'off'}></textarea>
        </div>
    )
}

function buildLog(level: string, contents: string) {
    const now = getNow()
    return `${now}[${level}] ${contents}`
}

function getNow() {
    const now = Date.now()
    const hour = Math.floor(now / 1000 / 60 / 60)
    const min = Math.floor(now / 1000 / 60 % 60)
    const sec = Math.floor(now / 1000 % 60)
    const millsec = Math.floor(now % 1000)

    return `${hour}:${min}:${sec}.${millsec}`
}
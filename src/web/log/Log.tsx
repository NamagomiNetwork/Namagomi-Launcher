import React, {useEffect} from 'react'
import './Log.css'
import IpcRendererEvent = Electron.IpcRendererEvent

export const Log = () => {
    const [log, setLog] = React.useState<string>('Logだよ～ん\n|log|log|log|log|\nlogはこちらです\nうるさかったですか？すみません')
    const [wrap, setWrap] = React.useState<'soft' | 'hard' | 'off'>('off')

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
            <div className="log-header">
                Log
                <div className={'wrap'}>
                    <input type={'checkbox'} id={'wrap-switch'} onChange={(e) => {
                        setWrap(e.target.checked ? 'soft' : 'off')
                    }}/>
                    <label htmlFor={'wrap-switch'}>wrap</label>
                </div>
            </div>

            <textarea id={'log'} readOnly={true} value={log} wrap={wrap}></textarea>
        </div>
    )
}

function buildLog(level: string, contents: string) {
    const now = getNow()
    return `${now}[${level}] ${contents}`
}

function getNow() {
    const now = performance.now()
    const hour = Math.floor(now / 1000 / 60 / 60)
    const min = Math.floor(now / 1000 / 60 % 60)
    const sec = Math.floor(now / 1000 % 60)
    const millsec = Math.floor(now % 1000)

    return `${hour}:${min}:${sec}.${millsec}`
}
import React from 'react'
import './Log.css'
import IpcRendererEvent = Electron.IpcRendererEvent

export const Log = () => {
    const [log, setLog] = React.useState<string>('Logだよ～ん\nlogはこちらです')

    window.namagomiAPI.log((event: IpcRendererEvent, level: string, contents: string) => {
        const built =  buildLog(level, contents)
        const concat = `${log}\n${built}`
        setLog(concat)
        console.log(built)
        console.log(concat)
    })

    return (
        <div className="log">
            <textarea readOnly={true}>
                {log}
            </textarea>
        </div>
    )
}

function buildLog(level: string, contents: string) {
    const now = getNow()
    return `${now}[${level}] ${contents}`
}

function getNow(){
    const date = new Date()
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDay()
    const h = date.getHours()
    const min = date.getMinutes()
    const s = date.getSeconds()
    return `${y}/${m}/${d} ${h}:${min}:${s}`
}
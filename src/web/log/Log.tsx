import React from 'react'
import './Log.css'
import IpcRendererEvent = Electron.IpcRendererEvent

export const Log = () => {
    const [log, setLog] = React.useState<string>('Logだよ～ん')

    window.namagomiAPI.log((event: IpcRendererEvent, level: string, contents: string) => {
        const built =  buildLog(level, contents)
        setLog(log + '\n' + built)
    })

    return (
        <div className="log">
            <p>{log}</p>
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
import React from 'react'
import './Log.css'

export const Log = () => {
    const [log, setLog] = React.useState<string>('Logだよ～ん')

    return (
        <div className="log">
            <p>{log}</p>
        </div>
    )
}
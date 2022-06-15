import React from "react"
import './Version.css'
import { version } from '/package.json'

export const Version = () => {
    return (
        <div className="version">
            <p>version: {version}</p>
        </div>
    )
}
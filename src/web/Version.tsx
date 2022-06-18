import React from 'react'
import './Version.css'
import * as packageInfo from '../../package.json'

export const Version = () => {
    return (
        <div className="version">
            <p>version: {packageInfo.version}</p>
        </div>
    )
}
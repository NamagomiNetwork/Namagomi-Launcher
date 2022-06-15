import React from "react"
import './Version.css'
import { version } from '/package.json'

type Props = {}

export const Version = ({}: Props) => {
    return (
        <div className="version">
            <p>version: {version}</p>
        </div>
    )
}
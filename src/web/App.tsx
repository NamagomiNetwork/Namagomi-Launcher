import React from 'react'
import './App.css'
import {Version} from './Version'
import {Switch} from './Switch'
import {Log} from './log/Log'

export const App = () => {
    return (
        <div className="container">
            <div className={"flexElements"}>
                <Switch/>
                <Log/>
            </div>
            <footer>
                <Version/>
            </footer>
        </div>
    )
}
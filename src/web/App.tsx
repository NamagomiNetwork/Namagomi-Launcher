import React from 'react'
import './App.css'
import {Version} from './footer/Version'
import {Switch} from './Switch'
import {Log} from './log/Log'
import {Updatable} from './footer/Updatable'

export const App = () => {
    return (
        <div className="container">
            <div className={"flexElements"}>
                <Switch/>
                <Log/>
            </div>
            <footer>
                <Version/>
                <Updatable/>
            </footer>
        </div>
    )
}
import React from 'react'
import './App.css'
import {Switch} from './Switch'
import {Log} from './log/Log'
import {Footer} from './footer/Footer'

export const App = () => {
    return (
        <div className="container">
            <div className={"flexElements"}>
                <Switch/>
                <Log/>
            </div>
            <Footer/>
        </div>
    )
}
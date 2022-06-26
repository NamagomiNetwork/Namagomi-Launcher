import React from 'react'
import './App.css'
import {Switch} from './Switch'
import {Log} from './log/Log'
import {Footer} from './footer/Footer'
import {Auth} from './microsoft/Auth'

export const App = () => {
    return (
        <div className="container">
            <div className={"flexElements"}>
                <Switch/>
                <Auth/>
                <Log/>
            </div>
            <Footer/>
        </div>
    )
}
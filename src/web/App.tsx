import React from 'react'
import './App.css'
import {Version} from './Version'
import {Switch} from './Switch'

export const App = () => {
    return (
        <div className="container">
            <Switch/>
            <Version/>
        </div>
    )
}
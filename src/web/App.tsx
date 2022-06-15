import React from 'react';
import './App.css'
import {Buttons} from './client/Buttons'
import {Version} from './Version'

export const App = () => {
    return (
        <div className="container">
            <Buttons/>
            <Version/>
        </div>
    )
}
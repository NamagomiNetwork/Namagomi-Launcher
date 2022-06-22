import React from 'react'
import {Version} from './Version'
import {Updatable} from './Updatable'
import './Footer.css'

export function Footer() {
    return (
        <footer>
            <Version/>
            <Updatable/>
        </footer>
    )
}
import React from 'react'
import {log} from '../../../generic/Logger'

function Auth() {

    return (
        <div className={'auth'}>
            <button className={'login-button'}>login</button>
        </div>
    )
}

function login() {
    log.info('login')
}
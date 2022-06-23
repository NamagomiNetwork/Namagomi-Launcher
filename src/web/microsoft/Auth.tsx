import React from 'react'

export function Auth() {

    return (
        <div className={'auth'}>
            <button className={'login-button'} onClick={login}>login</button>
        </div>
    )
}

function login() {
    console.info('login')
    window.namagomiAPI.login()
}
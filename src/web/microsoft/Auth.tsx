import React from 'react'

export function Auth() {

    return (
        <div className={'auth'}>
            <button className={'login-button'} onClick={login}>login</button>
            <button className={'logout-button'} onClick={logout}>logout</button>
        </div>
    )
}

function login() {
    console.info('login')
    window.namagomiAPI.login()
}

function logout() {
    console.info('logout')
    window.namagomiAPI.logout()
}
import React, {useEffect} from 'react'

export const Updatable = () => {
    const [updateAvailable, setUpdateAvailable] = React.useState(false)

    useEffect(() => {
        window.namagomiAPI.checkUpdateBack((event, updatable)=>{
            setUpdateAvailable(updatable)
        })
    }, [])

    return (
        <div className="updateAble">
            {
                updateAvailable ? '更新可能' : '最新の状態です'
            }
        </div>
    )
}
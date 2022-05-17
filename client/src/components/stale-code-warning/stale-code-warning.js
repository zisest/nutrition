import { useEffect, useState } from 'react'
import './stale-code-warning.css'



export default function StaleCodeWarning () {
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    let IS_HIDDEN = localStorage.getItem('STALE_CODE_WARNING_HIDDEN')
    if (IS_HIDDEN === null) setIsHidden(false)
    else {
      try {
        IS_HIDDEN = JSON.parse(IS_HIDDEN)
        setIsHidden(IS_HIDDEN)
      } catch (error) {
        console.error(error)
      }
    }
  }, [])

  function hide () {
    try {
      localStorage.setItem('STALE_CODE_WARNING_HIDDEN', true)
    } catch (error) {
      console.error(error)
    }
    setIsHidden(true)
  }

  const isHiddenStyle = isHidden ? 'stale-code-warning__wrapper_hidden' : ''

  return (
    <div className={"stale-code-warning__wrapper" + isHiddenStyle}>
      <div className="stale-code-warning">
        <div>
          This app is quite old and not mobile friendly.
          <br/>
          I'm much better at all things development now :)
        </div>
        <button className="stale-code-warning__button" onClick={hide}>
          Ok
        </button>        
      </div>
    </div>
  )
}
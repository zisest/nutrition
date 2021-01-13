import React from "react"
import './switch.css'

// value: boolean
function Switch({ value, onChange, name, label }) {

  return (
    <label className="switch_label">
      <div className="switch">
        <input type="checkbox" onChange={onChange} checked={value} />
        <span className="switch_slider"></span>
      </div>

      {label || name}
    </label>
  )

}

Switch.defaultProps = {
}

export default Switch
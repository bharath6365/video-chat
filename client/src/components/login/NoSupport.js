import React, {useState, useRef} from 'react'

export default function NoSupport() {

  return (
    <div className="name-form-container">
      <p>Sorry it looks like you don't have Webcam support in your system and hence this app can't function. Try loading it in a device where you have a camera.</p>
    </div>
  )
}

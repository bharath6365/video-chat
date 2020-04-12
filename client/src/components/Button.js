import React from 'react'

export default function Button({variant, handleClick, children}) {
  return (
    <button onClick={handleClick} className={variant || 'primary'}>
      {children}
    </button>
  )
}

// Used to show the Call Accepting Screen
import React from 'react'

export default function CallReceiving({receivingCall, name, acceptCall, rejectCall}) {
  if (!receivingCall) return null;
  return (
    <div>
      <h1>{name} is calling you</h1>
      <button onClick={acceptCall}>Accept</button>
    </div>
  )
}

import React from 'react'
import Button from './Button';

export default function UserList({users, yourID, handleClick, yourStream}) {
  return (
    <section className="user-list">
      <h1 className="align-center">Users online</h1>
        <ul>
        {Object.keys(users).map((key) => {
          // You dont want to call yourself for heaven sake.
          if (key === yourID) {
            return null;
          }
          const userName = users[key].name;
          // return <Button handleClick={() => handleClick(key, yourStream)}>Call {userName}</Button>;
          return (
            <li>
              <h6>{userName}</h6>
              <Button handleClick={() => handleClick(key, yourStream)}>Call</Button>
            </li>
          )
        })}
        </ul>
    </section>
  )
}

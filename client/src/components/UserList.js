import React from 'react'
import styled from 'styled-components';
import Button from './Button';

export default function UserList({users, yourID, handleClick, yourStream}) {
  return (
    <section className="user-list">
      <h1 className="align-center">Users online</h1>
        <StyledList>
        {Object.keys(users).map((key) => {
          const userName = users[key].name;
          // You dont want to call yourself for heaven sake.
          if (key === yourID || userName === null) {
            return null;
          }
          // return <Button handleClick={() => handleClick(key, yourStream)}>Call {userName}</Button>;
          return (
            <li>
              <h6>{userName}</h6>
              <Button handleClick={() => handleClick(key, yourStream)}>Call</Button>
            </li>
          )
        })}
        </StyledList>
    </section>
  )
}

const StyledList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;
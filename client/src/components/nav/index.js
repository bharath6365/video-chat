import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import styled from 'styled-components';

const handleLogoutClick = (history) => {
  localStorage.removeItem('name');
  localStorage.removeItem('avatarNumber');
  window.location.pathname = '/';
}

export default function Navigation() {
  
  const isHomePage = window.location.pathname === '/';
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('name') ? true : false);


  return (
    <StyledNav className={isHomePage ? "sticky" : ""}>
      
      <h2>OneChat</h2>
      
      {
        loggedIn && (
          <h4 onClick={handleLogoutClick.bind(null, history)}>Logout</h4>
        )  
      }
    </StyledNav>
  )
}


const StyledNav = styled.nav`
  background: black;
  color: #fff;
  padding: 10px 10vw;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-family: 'Kavoon', cursive;
    font-size: 2rem;
  }

  img {
    height: 75px;
  }

  h4 {
    cursor: pointer;
    font-size: 1.25rem;
    margin: 0;
  }

  &.sticky {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    width: 100%;
  }
`
import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../../images/one-chat-logo.png';

const handleLogoutClick = (history) => {
  localStorage.removeItem('name');
  localStorage.removeItem('avatarNumber');
  window.location.pathname = '/';
}

export default function Navigation({history}) {

 
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('name') ? true : false);

  console.log(loggedIn, history);

  return (
    <StyledNav>
      <img src={Logo} alt="Company Logo" />
      
      
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

  img {
    height: 75px;
  }

  h4 {
    cursor: pointer;
    font-size: 1.25rem;
    margin: 0;
  }
`
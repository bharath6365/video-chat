import React, {useState, useEffect} from 'react'
import { useHistory } from 'react-router-dom';

const handleLogoutClick = (history) => {
  console.log('History is', history);
  localStorage.removeItem('name');
  localStorage.removeItem('avatarNumber');
  history.push('/');
}

export default function Navigation() {
  const history = useHistory();
  
  const isHomePage = window.location.pathname === '/';
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('name') ? true : false);


  return (
    <nav className={isHomePage ? "sticky" : ""}>
      
      <h2>OneChat</h2>
      
      {
        loggedIn && (
          <h4 onClick={handleLogoutClick.bind(null, history)}>Logout</h4>
        )  
      }
    </nav>
  )
}


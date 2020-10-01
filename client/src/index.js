import React from 'react';
import ReactDOM from 'react-dom';
import SnackbarProvider from 'react-simple-snackbar';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Nav from './components/nav';
import * as serviceWorker from './serviceWorker';
import GetName from './components/login';
import NoSupport from './components/login/NoSupport';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <SnackbarProvider>
        <Nav />
        <Route path="/" exact component={GetName} />
        <Route path="/chat" exact component={App} />
        <Route path="/no-support" exact component={NoSupport} />
      </SnackbarProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

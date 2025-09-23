import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk'; // Correctly import thunk as default
import { jwtDecode } from 'jwt-decode'; // Ensure jwtDecode is imported correctly
//import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import rootReducer from './rootReducer';
import { userLoggedIn } from './actions/auth';
import setAuthorizationHeader from './utils/setAuthorizationHeader';

import 'semantic-ui-css/semantic.min.css';
import './css/index.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';

import App from './App';

import reportWebVitals from './reportWebVitals';

const middleware = [thunk]; // Add other middleware if necessary

// Create the Redux store with middleware and dev tools
const store = createStore(
  rootReducer,
  applyMiddleware(...middleware)
);

const token = localStorage.getItem('cardReaderJWT');
if (token) {
  try {
    const payload = jwtDecode(token);
    const user = {
      token,
      email: payload.email,
      username: payload.username,
      userlevel: payload.userlevel,
      coursename: payload.coursename,
    };
    setAuthorizationHeader(token);
    store.dispatch(userLoggedIn(user));
  } catch (error) {
    console.error("Invalid token", error);
  }
}

// Set up ReactDOM to render the application
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path="*" element={<App />} /> {/* Render the App component at all routes */}
      </Routes>
    </Provider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
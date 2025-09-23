import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';

import './css/App.css';

import UserRoute from './components/routes/UserRoute';
import GuestRoute from './components/routes/GuestRoute';
import HomePage from './components/pages/HomePage';
import TopNavigation from './components/navigation/TopNavigation';
import Dashboard from './components/pages/Dashboard';
import Manage from './components/pages/Manage';
import SignInPage from './components/pages/SignInPage';
import WarningPage from './components/pages/WarningPage';

const App = ({ isAuthenticated }) => (
  <div>
    <PrimeReactProvider>
    {isAuthenticated && <TopNavigation />}
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/manage" element={<UserRoute><Manage /></UserRoute>} />
      <Route path="/unauthorized" element={<GuestRoute><WarningPage /></GuestRoute>} />
      <Route path="/signin/:username" element={<GuestRoute><SignInPage /></GuestRoute>} />
    </Routes>
    </PrimeReactProvider>
  </div>
);

App.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.username,
  };
}

export default connect(mapStateToProps)(App);
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ isAuthenticated, islevel }) => {
  if (!isAuthenticated || !(islevel === 'Admin' || islevel === 'Super Admin')) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

AdminRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  islevel: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
    islevel: state.user.userlevel,
  };
}

export default connect(mapStateToProps)(AdminRoute);
import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { confirmUserName } from "../../actions/auth";
import { useParams, useNavigate } from "react-router-dom";

const SignInPage = ({ confirmUserName }) => {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    confirmUserName(username)
      .then(() => navigate("/dashboard"))
      .catch(err => {
        console.error("Error confirming username:", err);
      });
  }, [confirmUserName, username, navigate]); 

  return (
    <div className="flex align-items-center justify-content-center flex-wrap field col-12">
      <div className="homeContentDown">
         <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>
    </div>
  );
};

SignInPage.propTypes = {
  confirmUserName: PropTypes.func.isRequired
};

export default connect(null, { confirmUserName })(SignInPage);
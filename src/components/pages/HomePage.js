import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import  * as actions from "../../actions/auth";

import westernEngLogo from "../../img/logo.png";
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

const HomePage = ({isAuthenticated, logout}) => (

  <div className="ui two column centered grid">
   <div className="four column centered row homeContentDown">
     <div className="card flex justify-content-center">
      <Card className="homeCardWidth">
         <img src={westernEngLogo} className="homeLogoImg" alt="Western Engineering Logo"/>
         <div>
          <h1>Card Reader App</h1>
            {isAuthenticated ? 
            (
            <div>
            <Link to="/dashboard"><Button label="Dashboard" severity="help" raised/></Link>
            <br/><br/>
            <Button onClick={() => logout()} label="Log out" severity="help" raised/>
            </div>
            ) 
            : 
            (
            <a href="http://localhost:8080" className="textColorWhite"><Button label="Sign In with Your Western Account" severity="help" raised/></a>
          )}
         </div>
      </Card>
     </div>
   </div>
  </div>
);

HomePage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token
  };
}

export default connect(mapStateToProps,{ logout: actions.logout })(HomePage);
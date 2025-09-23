import React from 'react';
import westernEngLogo from "../../img/logo.png";

class WarningPage extends React.Component {


  render() {
    return (
  <div className="ui two column centered grid">
   <div className="four column centered row homeContentDown">
     <div className="ui centered cards">
      <div className="card homeCardWidth">
        <div className="content">
         <img src={westernEngLogo} className="homeLogoImg" alt="Western Engineering Logo"/>
         <div>
          <h1>Card Reader App</h1>
           <p>You are not authorized to sign into this application!</p>
           <p>If you have any question, please contact <a href="http://localhost:8080" className="textColorBold">Information Technologies Group</a></p>
         </div>
        </div>
      </div>
     </div>
   </div>
  </div>
    );
  }
}



export default WarningPage;
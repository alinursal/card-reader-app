import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as actions from "../../actions/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { Menubar } from 'primereact/menubar';
import { Badge } from 'primereact/badge';

import westernLogo from "../../img/western-university-logo.png";

const TopNavigationWrapper = (props) => {
  const navigate = useNavigate();
  return <TopNavigation {...props} navigate={navigate} />;
};

class TopNavigation extends React.Component {

  itemRenderer = (item) => (
    <button 
     className="flex align-items-center p-menuitem-link" 
     onClick={item.command} 
     type="button"
     tabIndex={item.tabindex || 0}
     aria-hidden={false} 
    >
      <span className={item.icon} />
      <span className="mx-2">{item.label}</span>
      {item.badge && <Badge className="ml-auto" value={item.badge} />}
      {item.shortcut && (
        <span className="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">
          {item.shortcut}
        </span>
      )}
    </button>
  );

  render() {
    const { user, logout, navigate } = this.props;

    const leftItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => {
          navigate('/dashboard');
        },
        attributes: { 'aria-hidden': false, tabindex: 0 },
      },
      {
        label: 'Manage',
        icon: 'pi pi-file',
        command: () => {
          navigate('/manage');
        },
        attributes: { 'aria-hidden': false, tabindex: 0 },
      }
    ];

    const rightMenu = (
      <Menubar
        model={[
          {
            label: user.username,
            icon: 'pi pi-user',
            items: [
              {
                label: 'Log out',
                icon: 'pi pi-sign-out',
                command: () => {
                  logout();
                  navigate('/');
                },
                attributes: { 'aria-hidden': false, tabindex: 0 },
              },
            ],
          },
        ]}
        aria-hidden={false}
        tabIndex={0}
      />
    );

    const start = (
      <Link to="/" aria-hidden={false} tabIndex={0}>
      <img
        alt="western logo"
        src={westernLogo}
        height="40"
        className="mr-2"
      />
      </Link>
    );

    return (
      <div>
        <div className="card">
          <Menubar model={leftItems} start={start} end={rightMenu} aria-hidden={false} tabIndex={0}/>
        </div>
      </div>
    );
  }
}

TopNavigation.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  logout: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    islevel: state.user.userlevel,
  };
}

export default connect(mapStateToProps, { logout: actions.logout })(TopNavigationWrapper);

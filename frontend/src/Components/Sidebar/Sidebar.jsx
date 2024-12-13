import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import logo__light from '../Assets/BuddyBudget_black.png';

const Sidebar = ({handleLogout}) => {

  return (
        <div className="sidebar">
        <img src={logo__light} alt="Logo" />
            <div className="side-wrapper">
                <div className="side-title">ADMIN PANEL</div>
                <div className="side-menu">
                    <a className="sidebar-link is-active" ><svg viewBox="0 0 24 24" fill="currentColor"/>Dashboard</a>
                    <a className="sidebar-link" ><svg viewBox="0 0 24 24" fill="currentColor"/><Link to="/superhome/users">Users</Link></a>
                    <a className="sidebar-link" ><svg viewBox="0 0 24 24" fill="currentColor"/><Link to="/superhome/transactions">Transactions</Link></a>
                    <a className="sidebar-link" ><svg viewBox="0 0 24 24" fill="currentColor"/><Link to="/superhome/categories">Categories</Link></a>
                    <a className="sidebar-link" ><svg viewBox="0 0 24 24" fill="currentColor"/><Link to="/superhome/accounts">Acounts</Link></a>
                    <a className="sidebar-link" ><svg viewBox="0 0 24 24" fill="currentColor"/><Link to="/superhome/debts">Debt</Link></a>
                </div>

            </div>
            <div className="side-wrapper">

            <div className="side-menu">
                <a className="sidebar-link" onClick={handleLogout}><svg viewBox="0 0 24 24" fill="currentColor"/>Log out</a>
            </div>
            </div>

        </div>
  );
};

export default Sidebar;

import React from "react";


import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";
import "./Layout.css";

import { Outlet } from "react-router-dom";


const MainLayout = () => {
  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};



export default MainLayout;
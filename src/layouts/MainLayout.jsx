import React from "react";


import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";
import "./Layout.css";

import { Outlet } from "react-router-dom";

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../services/notificationSocket";

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
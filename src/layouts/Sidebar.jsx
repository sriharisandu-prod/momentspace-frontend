import React from "react";
import {
  Home,
  Compass,
  MessageCircle,
  Bell,
  Bookmark,
  Heart,
  MapPin,
  Layers,
  Plus,
  ChevronRight,
} from "lucide-react";

import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();

  const username = user?.username || "User";

  const profilePhoto =
    user?.profilePhotoUrl ||
    user?.profilePhoto ||
    "https://i.pravatar.cc/100?img=12";

  const menuItems = [
    {
      label: "Home",
      icon: Home,
      path: "/home",
    },
    {
      label: "Explore",
      icon: Compass,
      path: "/explore",
    },
    {
      label: "Messages",
      icon: MessageCircle,
      path: "/messages",
      badge: "💬 | Chat",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      notification: true,
    },
    {
      label: "Saved Memories",
      icon: Bookmark,
      path: "/saved",
    },
  ];

  const spaceItems = [
    {
      label: "My Memories",
      icon: Heart,
      path: "/profile",
    },
    {
      label: "Locations",
      icon: MapPin,
      path: "/locations",
    },
    {
      label: "Categories",
      icon: Layers,
      path: "/categories",
    },
  ];

  return (
    <aside className="app-sidebar">

      {/* =====================================================
          USER PROFILE
      ===================================================== */}

      <Link
        to="/profile"
        className="sidebar-user-card"
      >

        <div className="sidebar-avatar">

          <img
            src={profilePhoto}
            alt={username}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

        </div>

        <div className="sidebar-user-info">

          <strong>
            {username}
          </strong>

          <span>
            @{username
              .toLowerCase()
              .replace(/\s+/g, "")}
          </span>

        </div>

        <ChevronRight
          size={18}
          className="sidebar-user-arrow"
        />

      </Link>


      {/* =====================================================
          MENU
      ===================================================== */}

      <div className="sidebar-section">

        <div className="sidebar-section-title">
          MENU
        </div>

        <nav className="sidebar-nav">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <Icon size={20} />

                <span>
                  {item.label}
                </span>

                {item.badge && (
                  <span className="sidebar-badge">
                    {item.badge}
                  </span>
                )}

                {item.notification && (
                  <span className="sidebar-notification-dot"></span>
                )}

              </NavLink>
            );
          })}

        </nav>

      </div>


      {/* =====================================================
          YOUR SPACE
      ===================================================== */}

      <div className="sidebar-section">

        <div className="sidebar-section-title">
          YOUR SPACE
        </div>

        <nav className="sidebar-nav">

          {spaceItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <Icon size={20} />

                <span>
                  {item.label}
                </span>

              </NavLink>
            );
          })}

        </nav>

      </div>


      {/* =====================================================
          CREATE MEMORY
      ===================================================== */}

      <div className="sidebar-create-card">

        <div className="sidebar-create-icon">
          <Plus size={22} />
        </div>

        <div className="sidebar-create-content">

          <strong>
            Create a memory
          </strong>

          <span>
            Save your moments forever.
          </span>

        </div>

        <Link
          to="/create"
          className="sidebar-create-link"
        >
          Create
        </Link>

      </div>

    </aside>
  );
};

export default Sidebar;
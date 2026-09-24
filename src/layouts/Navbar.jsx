import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Heart,
  Search,
  Home,
  Compass,
  MessageCircle,
  Bell,
  Plus,
  Menu,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Loader2,
  UserRound,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { searchUsers } from "../services/userService";

import "./Navbar.css";

const Navbar = () => {

  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // PROFILE MENU
  // =========================================================

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef = useRef(null);

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchText, setSearchText] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const searchRef = useRef(null);

  // =========================================================
  // CLOSE PROFILE MENU
  // =========================================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // =========================================================
  // CLOSE SEARCH DROPDOWN
  // =========================================================

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // =========================================================
  // SEARCH USERS
  // =========================================================

  useEffect(() => {

    const value = searchText.trim();

    if (!value) {

      setSearchResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      setSearchError("");

      return;
    }

    // Don't call backend for a single character.
    if (value.length < 2) {

      setSearchResults([]);
      setSearchOpen(true);
      setSearchError(
        "Type at least 2 characters"
      );

      return;
    }

    setSearchOpen(true);
    setSearchLoading(true);
    setSearchError("");

    const timer = setTimeout(
      async () => {

        try {

          const results =
            await searchUsers(value);

          setSearchResults(
            Array.isArray(results)
              ? results
              : []
          );

        } catch (error) {

          console.error(
            "User search failed:",
            error
          );

          setSearchResults([]);

          setSearchError(
            error?.response?.data?.message ||
              "Unable to search users."
          );

        } finally {

          setSearchLoading(false);

        }

      },
      300
    );

    return () => {
      clearTimeout(timer);
    };

  }, [searchText]);

  // =========================================================
  // OPEN USER PROFILE
  // =========================================================

  const handleUserSelect = (selectedUser) => {

    if (!selectedUser?.id) {
      return;
    }

    setSearchOpen(false);
    setSearchText("");
    setSearchResults([]);
    setSearchError("");

    navigate(
      `/profile/${selectedUser.id}`
    );
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = () => {

    setSearchText("");
    setSearchResults([]);
    setSearchError("");
    setSearchOpen(false);

  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleSearchKeyDown = (event) => {

    if (event.key !== "Enter") {
      return;
    }

    const value = searchText.trim();

    if (!value) {
      return;
    }

    if (searchResults.length > 0) {

      handleUserSelect(
        searchResults[0]
      );

    }

  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    setMenuOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });

  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const profileImage =
    user?.profilePhotoUrl ||
    "https://i.pravatar.cc/150?img=12";

  const username =
    user?.username ||
    "User";

  // =========================================================
  // ACTIVE LINK
  // =========================================================

  const isActive = (path) => {

    if (path === "/home") {

      return (
        location.pathname === "/home" ||
        location.pathname === "/"
      );

    }

    return location.pathname.startsWith(
      path
    );
  };

  return (
    <header className="top-navbar">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="navbar-left">

        {/* BRAND */}

        <Link
          to="/home"
          className="navbar-brand"
        >
          <div className="navbar-brand-icon">
            <Heart
              size={22}
              fill="currentColor"
            />
          </div>

          <span className="navbar-brand-text">
            Memories
            <span>Hub</span>
          </span>
        </Link>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className={`navbar-search-wrapper ${
            searchOpen
              ? "search-open"
              : ""
          }`}
          ref={searchRef}
        >

          <div className="navbar-search">

            <Search
              size={20}
              className="navbar-search-icon"
            />

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              onFocus={() => {

                if (
                  searchText.trim()
                ) {
                  setSearchOpen(true);
                }

              }}
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search memories, people, places..."
              aria-label="Search users"
            />

            {searchText && (
              <button
                type="button"
                className="navbar-search-clear"
                onClick={
                  handleClearSearch
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

          </div>

          {/* =================================================
              SEARCH DROPDOWN
          ================================================= */}

          {searchOpen && (
            <div className="navbar-search-dropdown">

              {/* LOADING */}

              {searchLoading && (
                <div className="navbar-search-status">

                  <Loader2
                    size={18}
                    className="navbar-search-spinner"
                  />

                  <span>
                    Searching users...
                  </span>

                </div>
              )}

              {/* ERROR */}

              {!searchLoading &&
                searchError && (
                  <div className="navbar-search-status">

                    <Search size={10} />

                    <span>
                      {searchError}
                    </span>

                  </div>
                )}

              {/* NO RESULTS */}

              {!searchLoading &&
                !searchError &&
                searchText.trim().length >= 2 &&
                searchResults.length === 0 && (
                  <div className="navbar-search-status">

                    <UserRound
                      size={20}
                    />

                    <div>
                      <strong>
                        No users found
                      </strong>

                      <span>
                        Try another username or email
                      </span>
                    </div>

                  </div>
                )}

              {/* RESULTS */}

              {!searchLoading &&
                !searchError &&
                searchResults.length > 0 && (
                  <div>

                    <div className="navbar-search-heading">
                      People
                    </div>

                    {searchResults
                      .slice(0, 8)
                      .map((result) => {

                        const resultImage =
                          result.profilePhotoUrl ||
                          "https://i.pravatar.cc/100?img=12";

                        return (
                          <button
                            type="button"
                            key={result.id}
                            className="navbar-search-result"
                            onClick={() =>
                              handleUserSelect(
                                result
                              )
                            }
                          >

                            <img
                              src={resultImage}
                              alt={
                                result.username
                              }
                              className="navbar-search-avatar"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "https://i.pravatar.cc/100?img=12";
                              }}
                            />

                            <div className="navbar-search-user-info">

                              <strong>
                                {result.username}
                              </strong>

                              <span>
                                {result.email}
                              </span>

                            </div>

                            <UserRound
                              size={17}
                              className="navbar-search-user-icon"
                            />

                          </button>
                        );

                      })}

                  </div>
                )}

            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="navbar-right">

        {/* HOME */}

        <Link
          to="/home"
          className={`navbar-link ${
            isActive("/home")
              ? "active"
              : ""
          }`}
        >
          <Home size={21} />

          <span>
            Home
          </span>
        </Link>

        {/* EXPLORE */}

        <Link
          to="/explore"
          className={`navbar-link ${
            isActive("/explore")
              ? "active"
              : ""
          }`}
        >
          <Compass size={21} />

          <span>
            Explore
          </span>
        </Link>

        {/* MESSAGES */}

        <Link
          to="/messages"
          className={`navbar-link ${
            isActive("/messages")
              ? "active"
              : ""
          }`}
        >
          <MessageCircle size={22} />

          <span>
            Messages
          </span>
        </Link>

        {/* NOTIFICATIONS */}

        <Link
          to="/notifications"
          className={`navbar-icon-button ${
            isActive("/notifications")
              ? "active"
              : ""
          }`}
          aria-label="Notifications"
        >
          <Bell size={22} />

          <span className="notification-dot" />
        </Link>

        {/* CREATE */}

        <Link
          to="/create"
          className="navbar-create-button"
        >
          <Plus size={21} />

          <span>
            Create
          </span>
        </Link>

        {/* =================================================
            PROFILE MENU
        ================================================= */}

        <div
          className="navbar-profile-wrapper"
          ref={menuRef}
        >

          <button
            type="button"
            className={`navbar-profile-button ${
              menuOpen
                ? "open"
                : ""
            }`}
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
          >

            <img
              src={profileImage}
              alt={username}
              className="navbar-profile-image"
            />

            <span className="navbar-profile-name">
              {username}
            </span>

            <ChevronDown
              size={16}
              className={`navbar-profile-chevron ${
                menuOpen
                  ? "rotate"
                  : ""
              }`}
            />

          </button>

          {menuOpen && (
            <div className="navbar-profile-menu">

              {/* PROFILE */}

              <Link
                to="/profile"
                className="navbar-dropdown-item"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                <User size={18} />

                <div>
                  <strong>
                    My Profile
                  </strong>

                  <span>
                    View your memories
                  </span>
                </div>
              </Link>

              {/* SETTINGS */}

              <Link
                to="/settings"
                className="navbar-dropdown-item"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                <Settings size={18} />

                <div>
                  <strong>
                    Settings
                  </strong>

                  <span>
                    Account preferences
                  </span>
                </div>
              </Link>

              <div className="navbar-dropdown-divider" />

              {/* LOGOUT */}

              <button
                type="button"
                className="navbar-dropdown-item logout-item"
                onClick={handleLogout}
              >
                <LogOut size={18} />

                <div>
                  <strong>
                    Logout
                  </strong>

                  <span>
                    Sign out of MemoriesHub
                  </span>
                </div>
              </button>

            </div>
          )}

        </div>

        {/* MOBILE MENU */}

        <button
          type="button"
          className="navbar-mobile-menu"
          aria-label="Menu"
        >
          <Menu size={23} />
        </button>

      </div>

    </header>
  );
};

export default Navbar;
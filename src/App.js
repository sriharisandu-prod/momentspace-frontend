import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "./contexts/AuthContext";

import {
  CallProvider,
  useCall,
} from "./contexts/CallContext";

import CallPanel from "./components/CallPanel";

import SavedMemories from "./pages/SavedMemories";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreateMemory from "./pages/CreateMemory";

import Categories from "./pages/Categories";
import Locations from "./pages/Locations";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";


/*
 * =========================================================
 * PROTECTED ROUTE
 * =========================================================
 */

const ProtectedRoute = ({
  children,
}) => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#f8fafc",

          color:
            "#64748b",

          fontSize:
            "15px",

          fontWeight:
            600,
        }}
      >
        Loading MemoriesHub...
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
};


/*
 * =========================================================
 * GLOBAL CALL PANEL
 * =========================================================
 */

const GlobalCallPanel = () => {
  const {
    call,
    incomingCall,
  } = useCall();


  /*
   * Don't render anything when
   * there is no call.
   */
  if (
    !call &&
    !incomingCall
  ) {
    return null;
  }


  /*
   * CallPanel itself gets all
   * call state from useCall().
   */
  return (
    <CallPanel />
  );
};


/*
 * =========================================================
 * PROTECTED APP LAYOUT
 * =========================================================
 *
 * CallProvider wraps the entire logged-in
 * application.
 *
 * Therefore:
 *
 * Messages
 * Home
 * Explore
 * Profile
 * etc.
 *
 * can all access useCall().
 */

const ProtectedApp =
  () => {
    return (
      <CallProvider>

        <MainLayout />

        <GlobalCallPanel />

      </CallProvider>
    );
  };


/*
 * =========================================================
 * APP ROUTES
 * =========================================================
 */

const AppRoutes = () => {
  return (
    <Routes>

      {/* ===================================================
          PUBLIC ROUTES
      ==================================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      <Route
        path="/register"
        element={
          <Register />
        }
      />


      {/* ===================================================
          PROTECTED ROUTES
      ==================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <ProtectedApp />
          </ProtectedRoute>
        }
      >

        <Route
          path="/home"
          element={
            <Home />
          }
        />

        <Route
          path="/explore"
          element={
            <Explore />
          }
        />

        <Route
          path="/create"
          element={
            <CreateMemory />
          }
        />

        <Route
          path="/saved"
          element={
            <SavedMemories />
          }
        />

        <Route
          path="/categories"
          element={
            <Categories />
          }
        />

        <Route
          path="/locations"
          element={
            <Locations />
          }
        />

        <Route
          path="/messages"
          element={
            <Messages />
          }
        />

        <Route
          path="/notifications"
          element={
            <Notifications />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile />
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <PublicProfile />
          }
        />

        <Route
          path="/settings"
          element={
            <Settings />
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

      </Route>


      {/* ===================================================
          FALLBACK
      ==================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/home"
            replace
          />
        }
      />

    </Routes>
  );
};


/*
 * =========================================================
 * APP
 * =========================================================
 */

const App = () => {
  return (
    <BrowserRouter>

      <AppRoutes />

    </BrowserRouter>
  );
};


export default App;
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
import SavedMemories from "./pages/SavedMemories";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreateMemory from "./pages/CreateMemory";
import Saved from "./pages/Saved";
import Categories from "./pages/Categories";
import Locations from "./pages/Locations";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";


const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "15px",
          fontWeight: 600,
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


const AppRoutes = () => {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================== */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* Home */}
        <Route
          path="/home"
          element={<Home />}
        />

        {/* Explore */}
        <Route
          path="/explore"
          element={<Explore />}
        />

        {/* Create Memory */}
        <Route
          path="/create"
          element={<CreateMemory />}
        />

        {/* Saved Memories */}
        <Route
  path="/saved"
  element={<SavedMemories />}
/>

        {/* Categories */}
        <Route
          path="/categories"
          element={<Categories />}
        />

        {/* Locations */}
        <Route
          path="/locations"
          element={<Locations />}
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Current User Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Other User Profile */}
        <Route
          path="/profile/:userId"
          element={<PublicProfile />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

        {/* Unknown protected route */}
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


      {/* Unknown public route */}
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


const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};


export default App;
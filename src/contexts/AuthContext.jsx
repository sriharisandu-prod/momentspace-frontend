import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user when app starts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("memorieshub_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to restore user:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("memorieshub_user");
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // Called after successful login
  const login = (authResponse) => {
    const loggedInUser = {
      id:
        authResponse?.id ??
        authResponse?.user?.id ??
        null,

      username:
        authResponse?.username ??
        authResponse?.user?.username ??
        "",

      email:
        authResponse?.email ??
        authResponse?.user?.email ??
        "",

      profilePhotoUrl:
        authResponse?.profilePhotoUrl ??
        authResponse?.user?.profilePhotoUrl ??
        null,
    };

    localStorage.setItem("token", authResponse.token);

    localStorage.setItem(
      "memorieshub_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // Used when profile information changes
  const updateUser = (updatedUser) => {
    setUser((previousUser) => {
      const nextUser = {
        ...previousUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "memorieshub_user",
        JSON.stringify(nextUser)
      );

      return nextUser;
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("memorieshub_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
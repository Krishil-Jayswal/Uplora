import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./App.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

const App = () => {
  const { User, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !User) {
    return <div>Loading ...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!User ? <Index /> : <Navigate to={"/dashboard"} />}
        ></Route>
        <Route
          path="/login"
          element={!User ? <Login /> : <Navigate to={"/dashboard"} />}
        ></Route>
        <Route
          path="signup"
          element={!User ? <Signup /> : <Navigate to={"/dashboard"} />}
        ></Route>
        <Route
          path="/dashboard"
          element={User ? <Dashboard /> : <Navigate to={"/login"} />}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
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
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;

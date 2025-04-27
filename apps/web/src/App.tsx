import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const User = useAuthStore((state) => state.User);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

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

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
                path="/signup"
                element={!User ? <Signup /> : <Navigate to={"/dashboard"} />}
              ></Route>
              <Route
                path="/dashboard"
                element={User ? <Dashboard /> : <Navigate to={"/login"} />}
              ></Route>
              <Route
                path="/new-project"
                element={User ? <NewProject /> : <Navigate to={"/login"} />}
              ></Route>
              <Route
                path="/project/:projectId"
                element={User ? <ProjectDetail/> : <Navigate to={"/login"}/>}
              ></Route>
              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

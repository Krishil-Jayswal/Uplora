import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { User, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-linear-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">U</span>
                </div>
                <span className="text-2xl font-bold text-foreground">Uplora</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {User ? (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                    Dashboard
                  </Link>
                  <span className="text-muted-foreground px-3 py-2 text-sm">
                    {User?.name}
                  </span>
                  <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                    Home
                  </Link>
                  <Link to="/#features" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                    Features
                  </Link>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm">
                    Login
                  </Link>
                  <Button asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {User ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block text-foreground hover:bg-secondary px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="block text-muted-foreground px-3 py-2 rounded-md text-base font-medium">
                  {User?.name}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block text-muted-foreground hover:bg-secondary hover:text-foreground px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="block text-foreground hover:bg-secondary px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/#features" 
                  className="block text-muted-foreground hover:bg-secondary hover:text-foreground px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/login" 
                  className="block text-muted-foreground hover:bg-secondary hover:text-foreground px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block text-muted-foreground hover:bg-secondary hover:text-foreground px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

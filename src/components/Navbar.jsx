import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Fish, LogOut, Shield, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const Navbar = ({
  cartItemCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setShowLogin } = useAuth();
  const { adminUser, logout: adminLogout, setShowAdminLogin } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Determine which user to show (admin on admin pages, regular user elsewhere)
  const currentUser = isAdminPage ? adminUser : user;
  
  const handleSignOut = async () => {
    if (isAdminPage && adminUser) {
      adminLogout();
    } else {
      logout();
    }
    navigate("/");
    setMobileMenuOpen(false);
  };
  
  const handleSignIn = () => {
    if (isAdminPage) {
      setShowAdminLogin(true);
    } else {
      setShowLogin(true);
    }
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-3 sm:px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <Fish className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-bold text-foreground text-sm sm:text-base md:text-lg whitespace-nowrap">
              Sakthi Fish Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link to="/products">
              <Button variant="ghost" size="sm">Products</Button>
            </Link>
            <Link to="/stores">
              <Button variant="ghost" size="sm">Stores</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">About</Button>
            </Link>
            <Link to="/support">
              <Button variant="ghost" size="sm">Support</Button>
            </Link>
            
            {location.pathname.startsWith('/admin') && adminUser?.role === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Admin Dashboard"
                onClick={() => navigate('/admin/dashboard')}
              >
                <Shield className="h-5 w-5" />
              </Button>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isAdminPage && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdminPage && adminUser && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                        Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleSignIn} size="sm">Sign In</Button>
            )}
          </div>

          {/* Mobile: Cart + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" onClick={handleNavClick}>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-card border-b shadow-lg z-40 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container p-4 space-y-2">
              <Link to="/products" onClick={handleNavClick}>
                <Button variant="ghost" className="w-full justify-start">Products</Button>
              </Link>
              <Link to="/stores" onClick={handleNavClick}>
                <Button variant="ghost" className="w-full justify-start">Stores</Button>
              </Link>
              <Link to="/about" onClick={handleNavClick}>
                <Button variant="ghost" className="w-full justify-start">About</Button>
              </Link>
              <Link to="/support" onClick={handleNavClick}>
                <Button variant="ghost" className="w-full justify-start">Support</Button>
              </Link>
              
              {currentUser ? (
                <>
                  <div className="border-t pt-2 mt-2">
                    {!isAdminPage && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { navigate("/orders"); handleNavClick(); }}
                        >
                          My Orders
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { navigate("/profile"); handleNavClick(); }}
                        >
                          Profile
                        </Button>
                      </>
                    )}
                    {isAdminPage && adminUser && (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { navigate("/admin/profile"); handleNavClick(); }}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { navigate("/admin/dashboard"); handleNavClick(); }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-2 mt-2">
                  <Button onClick={handleSignIn} className="w-full">Sign In</Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
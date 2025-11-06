import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logoutUser } from '../../redux/slice/user.slice';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // Apply theme on mount and when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <nav className="bg-background shadow-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">Talentloom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
              >
                <span>Home</span>
              </Link>

              {isAuthenticated && (
                <Button asChild>
                  <Link
                    to="/create-post"
                  >
                    + Ask Question
                  </Link>
                </Button>
              )}
            </div>

            {/* User Menu or Auth Buttons */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 text-foreground hover:text-foreground"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar?.secure_url} alt={user.fullName} />
                      <AvatarFallback>{user?.fullName?.split(' ')[0]?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block">{user?.fullName?.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border py-1 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-popover-foreground">{user?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="text-foreground border-foreground/20 hover:bg-accent" asChild>
                    <Link
                      to="/login"
                    >
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link
                      to="/register"
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              {isOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="flex items-center space-x-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <span>Home</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/create-post"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span>+</span>
                  <span>Ask Question</span>
                </Link>
              )}

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar?.secure_url} alt={user.fullName} />
                      <AvatarFallback>{user?.fullName?.split(' ')[0]?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-foreground hover:text-destructive w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
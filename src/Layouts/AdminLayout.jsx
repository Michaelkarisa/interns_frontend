// src/components/layout/AdminLayout.jsx
import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  UserCog,
  ClipboardList,
  Building,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { useAuthStore } from '@/Stores/authStore';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { useAppStore } from '@/api/favicon';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Interns', href: '/interns', icon: Users },
  { name: 'Projects', href: '/projects', icon: FileText },
  { name: 'Users', href: '/users', icon: UserCog },
  { name: 'Audit Logs', href: '/auditlogs', icon: ClipboardList },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const { appName, favicon } = useAppStore(); // ✅ Fixed: favicon instead of appIcon
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [isClient, setIsClient] = useState(false);
  
  // Logout modal state
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [loggingOut, setLoggingOut] = useState(false);
  const countdownInterval = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      setLoggingOut(false);
      setShowLogoutWarning(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutWarning(true);
    setCountdown(15);
    setLoggingOut(false);

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          performLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelLogout = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setShowLogoutWarning(false);
  };

  const sidebarWidth = collapsed ? 70 : 200;
  const headerHeight = 64;

  const filteredNavItems = navItems.filter(
    (item) => item.href !== '/users' || user?.role === 'super_admin'
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - ✅ Fixed: removed duplicate motion.div wrapper */}
      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-30 h-full bg-white border-r border-gray-200 flex flex-col"
        style={{ overflow: 'hidden' }}
      >
        {/* Logo Section */}
        <div
          className="border-b border-gray-200 flex items-center"
          style={{ height: headerHeight }}
        >
          <div className="px-2 flex items-center gap-3 w-full">
            {/* ✅ Fixed: appIcon → favicon */}
            {favicon ? (
              <img
                src={favicon}
                alt="Company logo"
                className="h-10 w-10 object-contain rounded-md border"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-gray-900" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h1
                  key="logo-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-xl font-bold text-gray-800 whitespace-nowrap"
                >
                  {/* ✅ Fixed: appname → appName */}
                  {appName}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-start text-gray-500 hover:text-gray-700"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1" style={{ marginLeft: isClient ? sidebarWidth : 200 }}>
        {/* Topbar */}
        <header
          className="bg-white border-b border-gray-200 p-4 flex justify-end items-center z-20"
          style={{
            position: 'fixed',
            top: 0,
            left: isClient ? sidebarWidth : 200,
            right: 0,
            height: headerHeight,
          }}
        >
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-medium text-gray-700">{user.name}</span>
                  <User className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-gray-500 text-sm">Not authenticated</span>
          )}
        </header>

        {/* Page Content */}
        <main
          className="p-4 lg:p-6"
          style={{
            marginTop: headerHeight,
            minHeight: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Logout Alert Dialog */}
      <AlertDialog open={showLogoutWarning} onOpenChange={setShowLogoutWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out automatically in{" "}
              <span className="font-bold text-red-600">{countdown} seconds</span>{" "}
              unless you cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="!flex !flex-row !justify-between !space-x-0">
            <AlertDialogCancel onClick={cancelLogout} disabled={loggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (countdownInterval.current) {
                  clearInterval(countdownInterval.current);
                  countdownInterval.current = null;
                }
                performLogout();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging out...
                </>
              ) : (
                "Continue Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLayout;
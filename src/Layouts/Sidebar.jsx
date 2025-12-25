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
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Interns', path: '/interns', icon: Users },
  { name: 'Projects', path: '/projects', icon: FileText },
  { name: 'Users', path: '/users', icon: UserCog },
  { name: 'Audit Logs', path: '/auditlogs', icon: ClipboardList },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ collapsed, toggleSidebar, auth }) => {
  const sidebarWidth = collapsed ? 70 : 200;
  const headerHeight = '64px';
  const location = useLocation();

  const { user = {}, appIcon, appname = 'Admin Portal' } = auth || {};

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 z-30 h-full bg-white border-r border-gray-200 flex flex-col"
      style={{ overflow: 'hidden' }}
    >
      {/* Logo */}
      <div className="border-b border-gray-200 flex items-center" style={{ height: headerHeight }}>
        <div className="px-2 flex items-center gap-3 w-full">
          {appIcon ? (
            <img src={appIcon} alt="Company logo" className="h-10 w-10 rounded-md border" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xl font-bold text-gray-800 whitespace-nowrap"
              >
                {appname}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {navItems
            .filter(item => item.path !== '/users' || user.role === 'super_admin')
            .map(item => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-3 py-4 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 5 }}
                          className="whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

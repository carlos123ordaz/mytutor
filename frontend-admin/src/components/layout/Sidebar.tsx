import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  GraduationCap,
  CalendarCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap as BrandIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { to: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { to: '/courses', icon: <BookOpen className="w-5 h-5" />, label: 'Courses' },
      { to: '/course-requests', icon: <FileQuestion className="w-5 h-5" />, label: 'Course Requests' },
    ],
  },
  {
    title: 'Users',
    items: [
      { to: '/users', icon: <Users className="w-5 h-5" />, label: 'All Users' },
      { to: '/teachers', icon: <GraduationCap className="w-5 h-5" />, label: 'Teachers' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/reservations', icon: <CalendarCheck className="w-5 h-5" />, label: 'Reservations' },
      { to: '/reviews', icon: <Star className="w-5 h-5" />, label: 'Reviews' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-slate-800 text-white flex flex-col transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <BrandIcon className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-white text-lg">MyTutor</span>
            <p className="text-xs text-slate-400 leading-none">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && group.title && (
              <p className="px-4 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {collapsed && group.title && <div className="my-2 border-t border-slate-700 mx-2" />}
            {group.items.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors text-sm font-medium',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

import { useLocation } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/courses': 'Courses',
  '/course-requests': 'Course Requests',
  '/users': 'Users',
  '/teachers': 'Teachers',
  '/reservations': 'Reservations',
  '/reviews': 'Reviews',
};

export function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? 'Admin Panel';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {user && (
          <div className="flex items-center gap-2">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:block">Logout</span>
        </Button>
      </div>
    </header>
  );
}

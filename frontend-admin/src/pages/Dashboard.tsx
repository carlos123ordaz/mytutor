import { Link } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, CalendarCheck, FileQuestion, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStats } from '../hooks/useAdminData';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/utils';

export function Dashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) return <PageSpinner />;

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        Failed to load dashboard stats. Please try refreshing.
      </div>
    );
  }

  const chartData = stats.reservationsLast7Days.map((item) => ({
    date: formatDate(item.date, 'MMM d'),
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers.toLocaleString()}
          icon={<GraduationCap className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses.toLocaleString()}
          icon={<BookOpen className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Total Reservations"
          value={stats.totalReservations.toLocaleString()}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Row 2: Pending Actions + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Pending Actions</h2>
          <Link to="/course-requests?status=pending">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Course Requests</p>
                    <p className="text-xs text-gray-500">Awaiting review</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">{stats.pendingCourseRequests}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/reservations?status=pending_review">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pending Reservations</p>
                    <p className="text-xs text-gray-500">Awaiting confirmation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-600">{stats.pendingReservations}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          {stats.pendingTeacherApprovals > 0 && (
            <Link to="/teachers?isApproved=false">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200">
                <CardContent className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Teacher Applications</p>
                      <p className="text-xs text-gray-500">Pending approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">{stats.pendingTeacherApprovals}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          <Card>
            <CardContent className="py-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.completedReservations.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-700">Reservations — Last 7 Days</h2>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [value ?? 0, 'Reservations']}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { to: '/users', label: 'All Users', icon: <Users className="w-5 h-5" />, color: 'blue' },
            { to: '/teachers', label: 'Teachers', icon: <GraduationCap className="w-5 h-5" />, color: 'purple' },
            { to: '/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" />, color: 'green' },
            { to: '/course-requests', label: 'Requests', icon: <FileQuestion className="w-5 h-5" />, color: 'yellow' },
            { to: '/reservations', label: 'Reservations', icon: <CalendarCheck className="w-5 h-5" />, color: 'orange' },
            { to: '/reviews', label: 'Reviews', icon: <span className="text-lg">⭐</span>, color: 'red' },
          ].map(({ to, label, icon, color }) => (
            <Link key={to} to={to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center gap-2 py-4 px-2 text-center">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}-50 text-${color}-600`}>
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

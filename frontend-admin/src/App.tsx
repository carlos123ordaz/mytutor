import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CoursesList } from './pages/courses/CoursesList';
import { CourseRequests } from './pages/courses/CourseRequests';
import { UsersList } from './pages/users/UsersList';
import { TeachersList } from './pages/users/TeachersList';
import { ReservationsList } from './pages/reservations/ReservationsList';
import { ReviewsList } from './pages/reviews/ReviewsList';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<CoursesList />} />
            <Route path="/course-requests" element={<CourseRequests />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/teachers" element={<TeachersList />} />
            <Route path="/reservations" element={<ReservationsList />} />
            <Route path="/reviews" element={<ReviewsList />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

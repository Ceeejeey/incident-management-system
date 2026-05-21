import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Index from './pages/Index';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import IncidentReport from './pages/incidents/IncidentReport';
import AdminReviewReport from './pages/incidents/AdminReviewReport';
import AdminTrackIncidents from './pages/incidents/AdminTrackIncidents';
import StaffIncidentReport from './pages/incidents/StaffIncidentReport';
import StudentIncidentTracking from './pages/incidents/StudentIncidentTracking';
import StaffIncidentTracking from './pages/incidents/StaffIncidentTracking';
import StaffCommunication from './pages/chat/StaffCommunication';
import ChatStaff from './pages/chat/ChatStaff';
import ChatStudent from './pages/chat/ChatStudent';
import StudentNotifications from './pages/notifications/StudentNotifications';
import StaffNotifications from './pages/notifications/StaffNotifications';
import FeedbackForm from './pages/feedback/FeedbackForm';
import AdminViewFeedback from './pages/feedback/AdminViewFeedback';
import EmergencyContacts from './pages/emergency/EmergencyContacts';
import EmergencyContactList from './pages/emergency/EmergencyContactList';
import AdminUserManagement from './pages/users/AdminUserManagement';
import ChangePassword from './pages/users/ChangePassword';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/dashboards/admin_dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboards/staff_dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/dashboards/student_dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

              <Route path="/incident/report" element={<ProtectedRoute allowedRoles={['student', 'staff']}><IncidentReport /></ProtectedRoute>} />
              <Route path="/admin/review-incidents" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviewReport /></ProtectedRoute>} />
              <Route path="/admin/trackIncidents" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrackIncidents /></ProtectedRoute>} />
              <Route path="/staff/assigned-incidents" element={<ProtectedRoute allowedRoles={['staff']}><StaffIncidentReport /></ProtectedRoute>} />
              <Route path="/student/incidents" element={<ProtectedRoute allowedRoles={['student']}><StudentIncidentTracking /></ProtectedRoute>} />
              <Route path="/staff/incidents" element={<ProtectedRoute allowedRoles={['staff']}><StaffIncidentTracking /></ProtectedRoute>} />

              <Route path="/communication/staff_communication" element={<ProtectedRoute allowedRoles={['staff']}><StaffCommunication /></ProtectedRoute>} />
              <Route path="/communication/chat/staff/:studentId" element={<ProtectedRoute allowedRoles={['staff']}><ChatStaff /></ProtectedRoute>} />
              <Route path="/communication/chat/student" element={<ProtectedRoute allowedRoles={['student']}><ChatStudent /></ProtectedRoute>} />

              <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><StudentNotifications /></ProtectedRoute>} />
              <Route path="/staff/notifications" element={<ProtectedRoute allowedRoles={['staff']}><StaffNotifications /></ProtectedRoute>} />

              <Route path="/feedback" element={<ProtectedRoute allowedRoles={['student', 'staff']}><FeedbackForm /></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['admin']}><AdminViewFeedback /></ProtectedRoute>} />

              <Route path="/emergencyContacts" element={<ProtectedRoute allowedRoles={['student', 'staff']}><EmergencyContacts /></ProtectedRoute>} />
              <Route path="/emergency-contacts-list" element={<ProtectedRoute><EmergencyContactList /></ProtectedRoute>} />

              <Route path="/user-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

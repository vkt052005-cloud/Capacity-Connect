import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initializeStorage } from "./data/seed";
import { useAuthStore } from "./store/authStore";
import { useNotificationsStore } from "./store/notificationsStore";
import { useCoursesStore } from "./store/coursesStore";
import { useAssessmentsStore } from "./store/assessmentsStore";
import { useUsersStore } from "./store/usersStore";
import { useLiveSessionsStore } from "./store/liveSessionsStore";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Public Pages
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { QrAuthPage } from "./pages/public/QrAuthPage";
import { NotFoundPage } from "./pages/public/NotFoundPage";

// Trainee Pages
import { TraineeDashboard } from "./pages/trainee/TraineeDashboard";
import { TraineeProfile } from "./pages/trainee/TraineeProfile";
import { CourseCatalog } from "./pages/trainee/CourseCatalog";
import { CourseDetail } from "./pages/trainee/CourseDetail";
import { Assessments } from "./pages/trainee/Assessments";
import { TakeAssessment } from "./pages/trainee/TakeAssessment";
import { Certificates } from "./pages/trainee/Certificates";
import { FeedbackPage } from "./pages/trainee/Feedback";
import { TraineeLiveClasses } from "./pages/trainee/TraineeLiveClasses";

// Trainer Pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerProfile from "./pages/trainer/TrainerProfile";
import TrainerLibrary from "./pages/trainer/TrainerLibrary";
import Questionnaires from "./pages/trainer/Questionnaires";
import TrainerReports from "./pages/trainer/TrainerReports";
import TrainerCourses from "./pages/trainer/TrainerCourses";
import { TrainerLiveClasses } from "./pages/trainer/TrainerLiveClasses";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CompetencyMapping from "./pages/admin/CompetencyMapping";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminProfile from "./pages/admin/AdminProfile";

function App() {
  const { loadFromStorage } = useAuthStore();
  const { load: loadNotifications } = useNotificationsStore();
  const { load: loadCourses } = useCoursesStore();
  const { load: loadAssessments } = useAssessmentsStore();
  const { load: loadUsers } = useUsersStore();
  const { load: loadLiveSessions } = useLiveSessionsStore();

  useEffect(() => {
    initializeStorage();
    loadFromStorage();
    loadNotifications();
    loadCourses();
    loadAssessments();
    loadUsers();
    loadLiveSessions();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/qr" element={<QrAuthPage />} />

        {/* Role Short Aliases */}
        <Route path="/trainee" element={<Navigate to="/trainee/dashboard" replace />} />
        <Route path="/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Trainee Routes */}
        <Route path="/trainee/dashboard" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TraineeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/trainee/live-classes" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TraineeLiveClasses />
          </ProtectedRoute>
        } />
        <Route path="/trainee/profile" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TraineeProfile />
          </ProtectedRoute>
        } />
        <Route path="/trainee/courses" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <CourseCatalog />
          </ProtectedRoute>
        } />
        <Route path="/trainee/course/:id" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <CourseDetail />
          </ProtectedRoute>
        } />
        <Route path="/trainee/assessments" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <Assessments />
          </ProtectedRoute>
        } />
        <Route path="/trainee/assessment/:id" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <TakeAssessment />
          </ProtectedRoute>
        } />
        <Route path="/trainee/certificates" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <Certificates />
          </ProtectedRoute>
        } />
        <Route path="/trainee/feedback" element={
          <ProtectedRoute allowedRoles={["trainee"]}>
            <FeedbackPage />
          </ProtectedRoute>
        } />

        {/* Trainer Routes */}
        <Route path="/trainer/dashboard" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/trainer/live-classes" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerLiveClasses />
          </ProtectedRoute>
        } />
        <Route path="/trainer/profile" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerProfile />
          </ProtectedRoute>
        } />
        <Route path="/trainer/courses" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerCourses />
          </ProtectedRoute>
        } />
        <Route path="/trainer/library" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerLibrary />
          </ProtectedRoute>
        } />
        <Route path="/trainer/questionnaires" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <Questionnaires />
          </ProtectedRoute>
        } />
        <Route path="/trainer/reports" element={
          <ProtectedRoute allowedRoles={["trainer"]}>
            <TrainerReports />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CourseManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/competency" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CompetencyMapping />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminNotifications />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminReports />
          </ProtectedRoute>
        } />

        {/* Zero-404 Fault-Tolerant Wildcard Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

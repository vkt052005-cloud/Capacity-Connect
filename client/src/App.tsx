import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GovernmentRibbon from './components/layout/GovernmentRibbon';
import FloatingHeader from './components/layout/FloatingHeader';
import NoticeRibbon from './components/layout/NoticeRibbon';
import Footer from './components/layout/Footer';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyCertificatePage from './pages/verify/VerifyCertificatePage';
import { useAuth } from './contexts/AuthContext';

// Trainee Module
const OfficerDesk = lazy(() => import('./pages/trainee/OfficerDesk'));
const CourseCatalog = lazy(() => import('./pages/trainee/CourseCatalog'));
const ResourceLibrary = lazy(() => import('./pages/trainee/ResourceLibrary'));
const AssessmentEngine = lazy(() => import('./pages/trainee/AssessmentEngine'));
const CourseFeedback = lazy(() => import('./pages/trainee/CourseFeedback'));
const MyCertificates = lazy(() => import('./pages/trainee/MyCertificates'));

// Trainer Module
const FacultyStudio = lazy(() => import('./pages/trainer/FacultyStudio'));
const AssessmentBuilder = lazy(() => import('./pages/trainer/AssessmentBuilder'));
const ResourceUploader = lazy(() => import('./pages/trainer/ResourceUploader'));
const CohortGradebook = lazy(() => import('./pages/trainer/CohortGradebook'));

// Admin Module
const UserApproval = lazy(() => import('./pages/admin/UserApproval'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const CompetencyMapper = lazy(() => import('./pages/admin/CompetencyMapper'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading module...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="text-8xl font-bold gradient-text">404</div>
    <h2 className="text-2xl font-semibold text-slate-200">Page Not Found</h2>
    <p className="text-slate-400 text-center max-w-md">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <a href="/" className="btn-primary mt-4 inline-block no-underline">
      Return to Home
    </a>
  </div>
);

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <GovernmentRibbon />
      <FloatingHeader />
      <NoticeRibbon />

      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyCertificatePage />} />
            <Route path="/courses" element={<CourseCatalog />} />

            {/* Trainee Routes */}
            <Route path="/trainee" element={
              <ProtectedRoute allowedRoles={['trainee']}><OfficerDesk /></ProtectedRoute>
            } />
            <Route path="/trainee/courses" element={
              <ProtectedRoute allowedRoles={['trainee']}><CourseCatalog /></ProtectedRoute>
            } />
            <Route path="/trainee/resources" element={
              <ProtectedRoute allowedRoles={['trainee']}><ResourceLibrary /></ProtectedRoute>
            } />
            <Route path="/trainee/assessments" element={
              <ProtectedRoute allowedRoles={['trainee']}><AssessmentEngine /></ProtectedRoute>
            } />
            <Route path="/trainee/feedback" element={
              <ProtectedRoute allowedRoles={['trainee']}><CourseFeedback /></ProtectedRoute>
            } />
            <Route path="/trainee/certificates" element={
              <ProtectedRoute allowedRoles={['trainee']}><MyCertificates /></ProtectedRoute>
            } />

            {/* Trainer Routes */}
            <Route path="/trainer" element={
              <ProtectedRoute allowedRoles={['trainer']}><FacultyStudio /></ProtectedRoute>
            } />
            <Route path="/trainer/assessments" element={
              <ProtectedRoute allowedRoles={['trainer']}><AssessmentBuilder /></ProtectedRoute>
            } />
            <Route path="/trainer/resources" element={
              <ProtectedRoute allowedRoles={['trainer']}><ResourceUploader /></ProtectedRoute>
            } />
            <Route path="/trainer/gradebook" element={
              <ProtectedRoute allowedRoles={['trainer']}><CohortGradebook /></ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}><AnalyticsDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}><UserApproval /></ProtectedRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedRoute allowedRoles={['admin']}><ContentManager /></ProtectedRoute>
            } />
            <Route path="/admin/competency" element={
              <ProtectedRoute allowedRoles={['admin']}><CompetencyMapper /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

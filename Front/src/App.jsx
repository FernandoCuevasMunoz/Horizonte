import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Sell = lazy(() => import('./pages/Sell'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Publish = lazy(() => import('./pages/Publish'));

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminForgotPassword = lazy(() => import('./pages/AdminForgotPassword'));
const AdminResetPassword = lazy(() => import('./pages/AdminResetPassword'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProperties = lazy(() => import('./pages/AdminProperties'));
const AdminPropertyForm = lazy(() => import('./pages/AdminPropertyForm'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));

function Loader() {
  return <div className="min-h-screen bg-cream flex items-center justify-center text-moss font-bold text-lg">Cargando...</div>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<Loader />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/propiedades" element={<Properties />} />
        <Route path="/propiedades/:code" element={<PropertyDetail />} />
        <Route path="/vender" element={<Sell />} />
        <Route path="/arriendos" element={<Properties mode="rent" />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/publicar" element={<Publish />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="propiedades" element={<AdminProperties />} />
          <Route path="propiedades/nueva" element={<AdminPropertyForm />} />
          <Route path="propiedades/:id" element={<AdminPropertyForm />} />
          <Route path="mensajes" element={<AdminMessages />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}

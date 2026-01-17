import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";

/* Páginas sin Layout */
import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";
import RegisterComplete from "../pages/RegisterComplete";
import Onboarding from "../pages/Onboarding";
import WelcomeCall from "../pages/WelcomeCall";
import Maintenance from "../pages/Maintenance";
import TestCalls from "../pages/TestCalls";

/* Paciente */
import Home from "../pages/Home";
import Glucose from "../pages/glucose/Glucose";
import GlucoseHistory from "../pages/glucose/GlucoseHistory";
import Pressure from "../pages/pressure/Pressure";
import Food from "../pages/food/Food";
import FoodHistory from "../pages/food/FoodHistory";
import AppAppointments from "../pages/appointments/Appointments";
import AddAppointment from "../pages/appointments/AddAppointment";
import Profile from "../pages/Profile";
import Robot from "../pages/Robot";
import Wellbeing from "../pages/Wellbeing";
import DailyLog from "../pages/DailyLog";
import WeightControl from "../pages/WeightControl";
import InsulinControl from "../pages/insulin/InsulinControl";
import QuitSmoking from "../pages/smoking/QuitSmoking";

/* Medicinas */
import Medicines from "../pages/medicines/Medicines";
import AddMedicine from "../pages/medicines/AddMedicine";
import EditMedicine from "../pages/medicines/EditMedicine";

/* Cuidadores */
import CaretakerHome from "../pages/caretaker/CaretakerHome";
import CaretakerPatients from "../pages/caretaker/CaretakerPatients";
import CaretakerPatientDetail from "../pages/caretaker/CaretakerPatientDetail";
import CaretakerAlerts from "../pages/caretaker/CaretakerAlerts";
import CaretakerMessages from "../pages/caretaker/CaretakerMessages";

/* Admin */
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetail from "../pages/admin/AdminUserDetail";
import AdminPatients from "../pages/admin/AdminPatients";
import AdminPatientDetail from "../pages/admin/AdminPatientDetail";
import AdminCaregivers from "../pages/admin/AdminCaregivers";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminLogs from "../pages/admin/AdminLogs";
import AdminConfig from "../pages/admin/AdminConfig";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINAS SIN LAYOUT */}
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-complete" element={<RegisterComplete />} />
        {/* Onboarding for Google Users */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/welcome-call" element={<WelcomeCall />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/test-calls" element={<TestCalls />} />

        {/* PÁGINAS CON LAYOUT */}
        {/* PÁGINAS CON LAYOUT (PROTEGIDAS) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Paciente */}
            <Route path="/home" element={<Home />} />

            {/* Medicinas */}
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/medicines/add" element={<AddMedicine />} />
            <Route path="/medicines/edit/:id" element={<EditMedicine />} />

            {/* Glicemia y Presión */}
            <Route path="/glucose" element={<Glucose />} />
            <Route path="/glucose/history" element={<GlucoseHistory />} />
            <Route path="/pressure" element={<Pressure />} />
            <Route path="/weight" element={<WeightControl />} />
            <Route path="/insulin" element={<InsulinControl />} />
            <Route path="/quit-smoking" element={<QuitSmoking />} />

            {/* Alimentación */}
            <Route path="/food" element={<Food />} />
            <Route path="/food/history" element={<FoodHistory />} />

            {/* Citas */}
            <Route path="/appointments" element={<AppAppointments />} />
            <Route path="/appointments/add" element={<AddAppointment />} />

            {/* Perfil + Robot + Bitácora */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/robot" element={<Robot />} />
            <Route path="/wellbeing" element={<Wellbeing />} />
            <Route path="/daily-log" element={<DailyLog />} />

            {/* Cuidador */}
            <Route path="/caretaker" element={<CaretakerHome />} />
            <Route path="/caretaker/patients" element={<CaretakerPatients />} />
            <Route
              path="/caretaker/patient/:id"
              element={<CaretakerPatientDetail />}
            />
            <Route path="/caretaker/alerts" element={<CaretakerAlerts />} />
            <Route path="/caretaker/messages" element={<CaretakerMessages />} />

            {/* Admin (Solo rol admin) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/user/:id" element={<AdminUserDetail />} />
              <Route path="/admin/patients" element={<AdminPatients />} />
              <Route path="/admin/patient/:id" element={<AdminPatientDetail />} />
              <Route path="/admin/caregivers" element={<AdminCaregivers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/config" element={<AdminConfig />} />
            </Route>

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

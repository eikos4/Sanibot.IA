import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

/* Páginas sin Layout */
import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";
import RegisterComplete from "../pages/RegisterComplete";

/* Páginas Paciente */
import Home from "../pages/Home";
import Glucose from "../pages/glucose/Glucose";
import GlucoseHistory from "../pages/glucose/GlucoseHistory";
import Food from "../pages/food/Food";
import FoodHistory from "../pages/food/FoodHistory";
import Appointments from "../pages/Appointments";
import AddAppointment from "../pages/AddAppointment";
import Profile from "../pages/Profile";
import Robot from "../pages/Robot";

/* Medicinas (Nueva carpeta correcta) */
import Medicines from "../pages/medicines/Medicines";
import AddMedicine from "../pages/medicines/AddMedicine";
import EditMedicine from "../pages/medicines/EditMedicine";

/* Cuidadores */
import CaretakerHome from "../pages/CaretakerHome";
import CaretakerPatients from "../pages/CaretakerPatients";
import CaretakerPatientDetail from "../pages/CaretakerPatientDetail";
import CaretakerAlerts from "../pages/CaretakerAlerts";
import CaretakerMessages from "../pages/CaretakerMessages";

/* Admin */
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetail from "../pages/AdminUserDetail";
import AdminPatients from "../pages/AdminPatients";
import AdminPatientDetail from "../pages/AdminPatientDetail";
import AdminCaregivers from "../pages/AdminCaregivers";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminLogs from "../pages/AdminLogs";
import AdminConfig from "../pages/AdminConfig";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINAS SIN LAYOUT */}
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-complete" element={<RegisterComplete />} />


        {/* PÁGINAS CON LAYOUT */}
        <Route element={<MainLayout />}>

          {/* Paciente */}
          <Route path="/home" element={<Home />} />

          {/* Medicinas */}
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/add" element={<AddMedicine />} />
          <Route path="/medicines/edit/:id" element={<EditMedicine />} />

          {/* Glicemia */}
          <Route path="/glucose" element={<Glucose />} />
          <Route path="/glucose/history" element={<GlucoseHistory />} />

          {/* Alimentación */}
          <Route path="/food" element={<Food />} />
          <Route path="/food/history" element={<FoodHistory />} />

          {/* Citas */}
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/add" element={<AddAppointment />} />

          {/* Perfil y Robot */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/robot" element={<Robot />} />

          {/* Cuidador */}
          <Route path="/caretaker" element={<CaretakerHome />} />
          <Route path="/caretaker/patients" element={<CaretakerPatients />} />
          <Route path="/caretaker/patient/:id" element={<CaretakerPatientDetail />} />
          <Route path="/caretaker/alerts" element={<CaretakerAlerts />} />
          <Route path="/caretaker/messages" element={<CaretakerMessages />} />

          {/* Admin */}
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

      </Routes>
    </BrowserRouter>
  );
}

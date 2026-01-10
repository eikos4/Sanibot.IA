import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

/* Páginas sin Layout */
import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";

/* Páginas con Layout (Paciente) */
import Home from "../pages/Home";
import Medicines from "../pages/Medicines";
import AddMedicine from "../pages/AddMedicine";
import Glucose from "../pages/Glucose";
import GlucoseHistory from "../pages/GlucoseHistory";
import Food from "../pages/Food";
import FoodHistory from "../pages/FoodHistory";
import Appointments from "../pages/Appointments";
import AddAppointment from "../pages/AddAppointment";
import Profile from "../pages/Profile";
import Robot from "../pages/Robot";

/* Cuidadores */
import CaretakerHome from "../pages/CaretakerHome";
import CaretakerPatients from "../pages/CaretakerPatients";
import CaretakerPatientDetail from "../pages/CaretakerPatientDetail";
import CaretakerAlerts from "../pages/CaretakerAlerts";
import CaretakerMessages from "../pages/CaretakerMessages";

/* Administrador */
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetail from "../pages/AdminUserDetail";
import AdminPatients from "../pages/AdminPatients";
import AdminPatientDetail from "../pages/AdminPatientDetail";
import AdminCaregivers from "../pages/AdminCaregivers";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminLogs from "../pages/AdminLogs";
import AdminConfig from "../pages/AdminConfig";
import RegisterComplete from "../pages/RegisterComplete";


import Medicines from "../pages/medicines/Medicines";
import AddMedicine from "../pages/medicines/AddMedicine";
import EditMedicine from "../pages/medicines/EditMedicine";



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINAS QUE NO USAN LAYOUT */}
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />

        {/* PÁGINAS QUE SÍ USAN LAYOUT */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/add" element={<AddMedicine />} />
                <Route path="/glucose" element={<Glucose />} />
                <Route path="/glucose/history" element={<GlucoseHistory />} />
                <Route path="/food" element={<Food />} />
                <Route path="/food/history" element={<FoodHistory />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/appointments/add" element={<AddAppointment />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/robot" element={<Robot />} />

                {/* Cuidador */}
                <Route path="/caretaker" element={<CaretakerHome />} />
                <Route path="/caretaker/patients" element={<CaretakerPatients />} />
                <Route path="/caretaker/patient/:id" element={<CaretakerPatientDetail />} />
                <Route path="/caretaker/alerts" element={<CaretakerAlerts />} />
                <Route path="/caretaker/messages" element={<CaretakerMessages />} />

                {/* Administrador */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/user/:id" element={<AdminUserDetail />} />
                <Route path="/admin/patients" element={<AdminPatients />} />
                <Route path="/admin/patient/:id" element={<AdminPatientDetail />} />
                <Route path="/admin/caregivers" element={<AdminCaregivers />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/config" element={<AdminConfig />} />
                <Route path="/register-complete" element={<RegisterComplete />} />


                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/add" element={<AddMedicine />} />
                <Route path="/medicines/edit/:id" element={<EditMedicine />} />


              </Routes>
            </MainLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";

import Home from "../pages/Home";
import Medicines from "../pages/Medicines";
import AddMedicine from "../pages/AddMedicine";
import Glucose from "../pages/Glucose";
import Food from "../pages/Food";
import Appointments from "../pages/Appointments";
import Robot from "../pages/Robot";

import GlucoseHistory from "../pages/GlucoseHistory";
import FoodHistory from "../pages/FoodHistory";
import AddAppointment from "../pages/AddAppointment";
import Profile from "../pages/Profile";

import CaretakerHome from "../pages/CaretakerHome";
import CaretakerPatients from "../pages/CaretakerPatients";
import CaretakerPatientDetail from "../pages/CaretakerPatientDetail";
import CaretakerAlerts from "../pages/CaretakerAlerts";
import CaretakerMessages from "../pages/CaretakerMessages";





import MainLayout from "../layout/MainLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/add" element={<AddMedicine />} />
          <Route path="/glucose" element={<Glucose />} />
          <Route path="/food" element={<Food />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/robot" element={<Robot />} />
          <Route path="/glucose/history" element={<GlucoseHistory />} />
          <Route path="/food/history" element={<FoodHistory />} />
          <Route path="/appointments/add" element={<AddAppointment />} />
          <Route path="/profile" element={<Profile />} />


          <Route path="/caretaker" element={<CaretakerHome />} />
          <Route path="/caretaker/patients" element={<CaretakerPatients />} />
          <Route path="/caretaker/patient/:id" element={<CaretakerPatientDetail />} />
          <Route path="/caretaker/alerts" element={<CaretakerAlerts />} />
          <Route path="/caretaker/messages" element={<CaretakerMessages />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/user/:id" element={<AdminUserDetail />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/patient/:id" element={<AdminPatientDetail />} />
          <Route path="/admin/caregivers" element={<AdminCaregivers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/config" element={<AdminConfig />} />




        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

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

import MainLayout from "../layout/MainLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

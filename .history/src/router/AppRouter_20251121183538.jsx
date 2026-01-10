import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import Register from "../pages/Register";

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

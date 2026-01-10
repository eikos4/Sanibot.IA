import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

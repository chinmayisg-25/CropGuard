import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Risk from "./pages/Risk";
import LocalHealth from "./pages/LocalHealth";
import ReportOutbreak from "./pages/ReportOutbreak";
import Weather from "./pages/Weather";
import CropHealth from "./pages/CropHealth";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main application */}
        <Route
          path="/*"
          element={
            <div className="app-container">
              <Sidebar />

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/diagnosis" element={<Diagnosis />} />
                  <Route path="/risk" element={<Risk />} />
                  <Route path="/local-health" element={<LocalHealth />} />
                  <Route path="/report" element={<ReportOutbreak />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/crop-health" element={<CropHealth />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Risk from "./pages/Risk";
import Weather from "./pages/Weather";

function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">✦</div>

      <span className="section-label">CROPGUARD</span>

      <h1>{title}</h1>

      <p>{description}</p>

      <span className="coming-badge">
        Module ready for development
      </span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <Header />

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route
                path="/diagnosis"
                element={<Diagnosis />}
              />

              <Route
                path="/risk"
                element={<Risk />}
              />

              <Route
                path="/local-health"
                element={
                  <PlaceholderPage
                    title="Local Crop Health"
                    description="Community reports, disease hotspots and regional crop-health intelligence will appear here."
                  />
                }
              />

              <Route
                path="/assistant"
                element={
                  <PlaceholderPage
                    title="Ask CropGuard"
                    description="The intelligent agriculture assistant will provide crop-health guidance here."
                  />
                }
              />

              <Route
  path="/weather"
  element={<Weather />}
/>
                
            

              <Route
                path="/alerts"
                element={
                  <PlaceholderPage
                    title="Alerts"
                    description="Smart crop-health alerts and early warnings will appear here."
                  />
                }
              />

              <Route
                path="/crop-health"
                element={
                  <PlaceholderPage
                    title="Crop Health"
                    description="Diagnosis history, crop-health timeline and follow-up monitoring will appear here."
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
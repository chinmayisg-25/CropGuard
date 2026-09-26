import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { path: "/", label: t("nav_dashboard"), icon: "⌂" },
    { path: "/diagnosis", label: t("nav_checkCrop"), icon: "⌁" },
    { path: "/risk", label: t("nav_checkRisk"), icon: "⚠" },
    { path: "/local-health", label: t("nav_localHealth"), icon: "⌖" },
    { path: "/report", label: t("nav_reportDisease"), icon: "✚" },
    { path: "/weather", label: t("nav_weather"), icon: "☼" },
    { path: "/crop-health", label: t("nav_cropHealth"), icon: "📋" },
  ];

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open navigation menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div>
          <div className="brand">
            <div className="brand-mark">CG</div>
            <h2>CropGuard</h2>

            <button
              className="mobile-close-button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              type="button"
            >
              ×
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-heading">
              {t("navigation")}
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    icon: "⌂",
    path: "/",
  },
  {
    label: "Check My Crop",
    icon: "⌁",
    path: "/diagnosis",
  },
  {
    label: "Check My Risk",
    icon: "⚠",
    path: "/risk",
  },
  {
    label: "Local Crop Health",
    icon: "⌖",
    path: "/local-health",
  },
  {
    label: "Ask CropGuard",
    icon: "✦",
    path: "/assistant",
  },
  {
    label: "Weather",
    icon: "☼",
    path: "/weather",
  },
  {
    label: "Alerts",
    icon: "♢",
    path: "/alerts",
  },
  {
    label: "Crop Health",
    icon: "↗",
    path: "/crop-health",
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">CG</div>

        <div>
          <h1>CropGuard</h1>
          <p>Crop Health Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-heading">MAIN</p>

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-status">
          <span className="status-dot"></span>

          <div>
            <strong>CropGuard Ready</strong>
            <span>Intelligence system active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
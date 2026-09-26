import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const {
    language,
    setLanguage,
    t,
    user,
    logout,
  } = useLanguage();
  const navigate = useNavigate();

  const indianLanguages = [
    { code: "EN", nativeName: "English" },
    { code: "KN", nativeName: "ಕನ್ನಡ" },
    { code: "HI", nativeName: "हिन्दी" },
    { code: "MR", nativeName: "मराठी" },
    { code: "BN", nativeName: "বাংলা" },
    { code: "KOK", nativeName: "कोंकणी" },
    { code: "AS", nativeName: "অসমীয়া" },
    { code: "TE", nativeName: "తెలుగు" },
    { code: "TA", nativeName: "தமிழ்" },
    { code: "GU", nativeName: "ગુજરાતી" },
    { code: "ML", nativeName: "മലയാളം" },
    { code: "PA", nativeName: "ਪੰਜਾਬੀ" },
    { code: "OR", nativeName: "ଓଡ଼ିଆ" },
    { code: "UR", nativeName: "اردو" },
    { code: "MAI", nativeName: "मैथिली" },
    { code: "SAT", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
    { code: "KS", nativeName: "کٲشُر" },
    { code: "NE", nativeName: "नेपाली" },
    { code: "SD", nativeName: "سنڌي" },
    { code: "BRX", nativeName: "बर'/बड़" },
    { code: "DOI", nativeName: "डोगरी" },
    { code: "SA", nativeName: "संस्कृतम्" },
  ];

  return (
    <header className="top-header">
      <div>
        <p className="header-eyebrow">
          {t("eyebrow")}
        </p>

        <h2>
          {t("greeting")}
        </h2>
      </div>

      <div className="header-actions">

        {/* Notification */}
        <button
          className="icon-button"
          title="Notifications"
          type="button"
        >
          ♢
        </button>

        {/* Language selector */}
        <div className="language-dropdown-wrapper">
          <select
            className="language-button"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select language"
          >
            {indianLanguages.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
              >
                {lang.nativeName}
              </option>
            ))}
          </select>

          <span className="language-arrow">
            ⌄
          </span>
        </div>

        {/* Profile */}
        <button
  type="button"
  className="profile"
  onClick={() => navigate("/profile")}
  style={{
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  }}
>
  <div className="profile-avatar">
    {user?.name
      ? user.name.charAt(0).toUpperCase()
      : "F"}
  </div>

  <div className="profile-info">
    <strong>
      {user?.name || t("profileName")}
    </strong>

    <span>
      {user?.district
        ? `${user.district}, ${user.state}`
        : t("profileFarm")}
    </span>
  </div>
</button>

        {/* Logout */}
        {user && (
          <button
            onClick={logout}
            className="logout-button"
            type="button"
          >
            {t("logout")}
          </button>
        )}

      </div>
    </header>
  );
}

export default Header;
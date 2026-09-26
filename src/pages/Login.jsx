import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Login.css";

function Login() {
  const { t, login, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    farmerId: "",
    pin: "",
    state: "",
    district: "",
    taluk: "",
    village: "",
  });

  const [error, setError] = useState("");

  const languages = [
    { code: "EN", name: "English" },
    { code: "KN", name: "ಕನ್ನಡ" },
    { code: "HI", name: "हिन्दी" },
    { code: "MR", name: "मराठी" },
    { code: "TE", name: "తెలుగు" },
    { code: "TA", name: "தமிழ்" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const {
      name,
      farmerId,
      pin,
      state,
      district,
      taluk,
      village,
    } = formData;

    if (
      !name.trim() ||
      !farmerId.trim() ||
      !pin.trim() ||
      !state.trim() ||
      !district.trim() ||
      !taluk.trim() ||
      !village.trim()
    ) {
      setError(t("loginValidation"));
      return;
    }

    login({
      name: name.trim(),
      farmerId: farmerId.trim(),
      state: state.trim(),
      district: district.trim(),
      taluk: taluk.trim(),
      village: village.trim(),
      role: "farmer",
    });

    navigate("/");
  };

  const handleDemoLogin = () => {
    login({
      name: "Chinmayi S G",
      farmerId: "CG-FARMER-1024",
      state: "Karnataka",
      district: "Shivamogga",
      taluk: "Demo Taluk",
      village: "Demo Village",
      role: "farmer",
    });

    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-top">
          <div className="login-brand">
            <div className="login-brand-mark">CG</div>

            <div>
              <h1>CropGuard</h1>
              <p>{t("loginBrandSub")}</p>
            </div>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="login-language"
            aria-label={t("selectLanguage")}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="login-heading">
          <h2>{t("loginTitle")}</h2>

          <p>{t("loginSub")}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">

          <div className="form-group">
            <label>{t("farmerNameLabel")}</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("farmerNamePlaceholder")}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>{t("farmerIdLabel")}</label>

            <input
              type="text"
              name="farmerId"
              value={formData.farmerId}
              onChange={handleChange}
              placeholder={t("farmerIdPlaceholder")}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>{t("pinLabel")}</label>

            <input
              type="password"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              placeholder={t("pinPlaceholder")}
              maxLength={6}
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label>{t("stateLabel")}</label>

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder={t("statePlaceholder")}
            />
          </div>

          <div className="form-group">
            <label>{t("districtLabel")}</label>

            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder={t("districtPlaceholder")}
            />
          </div>

          <div className="form-group">
            <label>{t("talukLabel")}</label>

            <input
              type="text"
              name="taluk"
              value={formData.taluk}
              onChange={handleChange}
              placeholder={t("talukPlaceholder")}
            />
          </div>

          <div className="form-group">
            <label>{t("villageLabel")}</label>

            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              placeholder={t("villagePlaceholder")}
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            {t("verifyContinue")}
          </button>

        </form>

        <div className="login-divider">
          <span>{t("or")}</span>
        </div>

        <button
          type="button"
          className="demo-login-button"
          onClick={handleDemoLogin}
        >
          {t("demoLogin")}
        </button>

        <div className="login-note">
          <strong>{t("prototypeLogin")}</strong>

          <span>{t("prototypeNote")}</span>
        </div>

      </div>
    </div>
  );
}

export default Login;
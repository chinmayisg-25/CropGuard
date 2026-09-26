import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("cropguard-language") || "EN";
  });

  const [diagnosisHistory, setDiagnosisHistory] = useState(() => {
    const saved = localStorage.getItem("cropguard-diagnosis-history");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [communityReports, setCommunityReports] = useState(() => {
    const saved = localStorage.getItem("cropguard-community-reports");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cropguard-user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Save selected language
  useEffect(() => {
    localStorage.setItem("cropguard-language", language);
  }, [language]);

  // Save diagnosis history
  useEffect(() => {
    localStorage.setItem(
      "cropguard-diagnosis-history",
      JSON.stringify(diagnosisHistory)
    );
  }, [diagnosisHistory]);

  // Save community reports
  useEffect(() => {
    localStorage.setItem(
      "cropguard-community-reports",
      JSON.stringify(communityReports)
    );
  }, [communityReports]);

  // Translation function
  const t = (key) => {
    const currentLanguage = translations[language];

    if (currentLanguage && currentLanguage[key]) {
      return currentLanguage[key];
    }

    if (translations.EN && translations.EN[key]) {
      return translations.EN[key];
    }

    return key;
  };

  // Add diagnosis record
  const addDiagnosis = (newRecord) => {
    setDiagnosisHistory((prev) => [newRecord, ...prev]);
  };

  // Add community/outbreak report
  const addReport = (newReport) => {
    setCommunityReports((prev) => [newReport, ...prev]);
  };

  // Login with complete farmer profile
  const login = (profile) => {
    const loggedInUser =
      typeof profile === "string"
        ? {
            name: profile || "Farmer",
            role: "farmer",
          }
        : {
            name: profile?.name || "Farmer",
            farmerId: profile?.farmerId || "",
            state: profile?.state || "",
            district: profile?.district || "",
            taluk: profile?.taluk || "",
            village: profile?.village || "",
            role: profile?.role || "farmer",
          };

    setUser(loggedInUser);

    localStorage.setItem(
      "cropguard-user",
      JSON.stringify(loggedInUser)
    );
  };

  // Update farmer profile
  const updateProfile = (updatedProfile) => {
    setUser((previousUser) => {
      const updatedUser = {
        ...(previousUser || {}),
        ...updatedProfile,
      };

      localStorage.setItem(
        "cropguard-user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("cropguard-user");
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,

        // Backward-compatible names
        lang: language,
        setLang: setLanguage,

        diagnosisHistory,
        addDiagnosis,

        communityReports,
        addReport,

        user,
        login,
        updateProfile,
        logout,

        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

function Profile() {
  const { user, updateProfile } = useLanguage();

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    farmerId: user?.farmerId || "",
    state: user?.state || "",
    district: user?.district || "",
    taluk: user?.taluk || "",
    village: user?.village || "",
    role: user?.role || "farmer",
  });

  if (!user) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Farmer Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      farmerId: user?.farmerId || "",
      state: user?.state || "",
      district: user?.district || "",
      taluk: user?.taluk || "",
      village: user?.village || "",
      role: user?.role || "farmer",
    });

    setEditing(false);
  };

  const fields = [
    { name: "name", label: "Farmer Name" },
    { name: "farmerId", label: "Farmer ID" },
    { name: "state", label: "State" },
    { name: "district", label: "District" },
    { name: "taluk", label: "Taluk" },
    { name: "village", label: "Village" },
    { name: "role", label: "Role" },
  ];

  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              color: "#4f7d55",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            FARMER IDENTITY
          </p>

          <h1
            style={{
              margin: 0,
              color: "#18351d",
              fontSize: "30px",
            }}
          >
            My Profile
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#718075",
            }}
          >
            Your identity and farm region used across CropGuard reports.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              padding: "11px 18px",
              border: "none",
              borderRadius: "9px",
              background: "#2e7d32",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2ebe3",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 8px 25px rgba(30,70,35,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
            paddingBottom: "22px",
            borderBottom: "1px solid #edf1ed",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#e7f3e8",
              color: "#2e7d32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "800",
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || "F"}
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                color: "#18351d",
              }}
            >
              {user.name}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718075",
                fontSize: "14px",
              }}
            >
              {user.village || "Village"} · {user.district || "District"},{" "}
              {user.state || "State"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#405445",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {field.label}
              </label>

              {editing ? (
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={field.name === "farmerId"}
                  style={{
                    width: "100%",
                    height: "44px",
                    boxSizing: "border-box",
                    padding: "0 12px",
                    border: "1px solid #d5dfd6",
                    borderRadius: "9px",
                    background:
                      field.name === "farmerId" ? "#f3f5f3" : "#fff",
                    color: "#26392a",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    borderRadius: "9px",
                    background: "#f7f9f7",
                    border: "1px solid #edf1ed",
                    color: "#26392a",
                    fontSize: "14px",
                  }}
                >
                  {user[field.name] || "Not provided"}
                </div>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid #edf1ed",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "10px 18px",
                border: "1px solid #ccd8ce",
                borderRadius: "9px",
                background: "#fff",
                color: "#405445",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "9px",
                background: "#2e7d32",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
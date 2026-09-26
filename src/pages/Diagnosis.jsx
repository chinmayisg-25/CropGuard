// src/pages/Diagnosis.jsx
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { analyzeCrop } from "../services/diagnosisService";

const CROPS = [
  "Rice",
  "Wheat",
  "Cotton",
  "Soybean",
  "Tomato",
  "Potato",
  "Maize",
  "Sugarcane",
  "Other",
];

const GROWTH_STAGES = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Maturity",
];

const MAX_IMAGES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

function checkImageQuality(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      URL.revokeObjectURL(url);

      if (width < 320 || height < 200) {
        resolve({
          status: "poor",
          width,
          height,
        });
        return;
      }

      if (width < 640 || height < 480) {
        resolve({
          status: "acceptable",
          width,
          height,
        });
        return;
      }

      if (width < 800 || height < 600) {
        resolve({
          status: "acceptable",
          width,
          height,
        });
        return;
      }

      resolve({
        status: "good",
        width,
        height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);

      resolve({
        status: "poor",
        width: 0,
        height: 0,
        unreadable: true,
      });
    };

    img.src = url;
  });
}

function getConfidence(prediction) {
  if (!prediction) return null;

  const value =
    prediction.confidence ??
    prediction.score ??
    prediction.probability ??
    null;

  if (value === null || value === undefined) return null;

  const numeric = Number(value);

  if (Number.isNaN(numeric)) return null;

  return numeric <= 1 ? numeric * 100 : numeric;
}

function Diagnosis() {
  const { t, addDiagnosis } = useLanguage();

  const [crop, setCrop] = useState("Rice");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qualityChecking, setQualityChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /*
   * Small translation helper for messages containing values
   * such as image count or image dimensions.
   */
  const tr = (key, variables = {}) => {
    let text = t(key);

    Object.entries(variables).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });

    return text;
  };

  /*
   * Internal crop values remain English because the backend
   * expects these values. Only the displayed text is translated.
   */
  const getCropLabel = (value) => {
    const keyMap = {
      Rice: "diagnosisCropRice",
      Wheat: "diagnosisCropWheat",
      Cotton: "diagnosisCropCotton",
      Soybean: "diagnosisCropSoybean",
      Tomato: "diagnosisCropTomato",
      Potato: "diagnosisCropPotato",
      Maize: "diagnosisCropMaize",
      Sugarcane: "diagnosisCropSugarcane",
      Other: "diagnosisCropOther",
    };

    return t(keyMap[value] || value);
  };

  /*
   * Internal growth-stage values remain English for the backend.
   */
  const getStageLabel = (value) => {
    const keyMap = {
      Seedling: "diagnosisStageSeedling",
      Vegetative: "diagnosisStageVegetative",
      Flowering: "diagnosisStageFlowering",
      Fruiting: "diagnosisStageFruiting",
      Maturity: "diagnosisStageMaturity",
    };

    return t(keyMap[value] || value);
  };

  const handleImageUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    setError("");
    setResult(null);

    if (selectedFiles.length > MAX_IMAGES) {
      setError(
        tr("diagnosisErrorMaxImages", {
          count: MAX_IMAGES,
        })
      );
      return;
    }

    const invalidFiles = selectedFiles.filter(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type
        )
    );

    if (invalidFiles.length) {
      setError(t("diagnosisErrorFileType"));
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_SIZE
    );

    if (oversizedFiles.length) {
      setError(t("diagnosisErrorFileSize"));
      return;
    }

    setQualityChecking(true);

    const checkedFiles = [];

    for (const file of selectedFiles) {
      const quality = await checkImageQuality(file);

      checkedFiles.push({
        file,
        preview: URL.createObjectURL(file),
        quality,
      });
    }

    setFiles(checkedFiles);
    setQualityChecking(false);
  };

  const removeImage = (index) => {
    setFiles((current) => {
      const copy = [...current];

      if (copy[index]?.preview) {
        URL.revokeObjectURL(copy[index].preview);
      }

      copy.splice(index, 1);
      return copy;
    });

    setResult(null);
  };

  const runAnalysis = async () => {
    setError("");
    setResult(null);

    if (!crop) {
      setError(t("diagnosisErrorCrop"));
      return;
    }

    if (!growthStage) {
      setError(t("diagnosisErrorGrowthStage"));
      return;
    }

    if (!files.length) {
      setError(t("diagnosisErrorNoImages"));
      return;
    }

    const usableFiles = files.filter(
      (item) => item.quality.status !== "poor"
    );

    if (!usableFiles.length) {
      setError(t("diagnosisErrorPoorImages"));
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeCrop({
        crop,
        growthStage,
        images: usableFiles,
      });

      setResult(data);

      const predictions =
        data?.ai_analysis?.predictions || [];

      const firstPrediction = predictions[0];

      if (firstPrediction) {
        const confidence = getConfidence(firstPrediction);

        const diagnosisRecord = {
          id: Date.now(),
          disease:
            firstPrediction.disease ||
            firstPrediction.condition ||
            firstPrediction.label ||
            firstPrediction.name ||
            t("diagnosisUncertainCondition"),
          confidence:
            confidence !== null
              ? `${confidence.toFixed(1)}%`
              : "N/A",
          date: new Date().toLocaleDateString(),
          image: usableFiles[0]?.preview || null,
          crop,
          growthStage,
        };

        try {
          addDiagnosis(diagnosisRecord);
        } catch {
          // Timeline integration is optional for this demo.
        }
      }
    } catch (err) {
      setError(
        err?.message ||
          t("diagnosisErrorBackend")
      );
    } finally {
      setLoading(false);
    }
  };

  const compatibility =
    result?.crop_compatibility?.status || null;

  const predictions =
    result?.ai_analysis?.predictions || [];

  const firstPrediction = predictions[0];

  const confidence = getConfidence(firstPrediction);

  const predictionName =
    firstPrediction?.disease ||
    firstPrediction?.condition ||
    firstPrediction?.label ||
    firstPrediction?.name ||
    firstPrediction?.class_name ||
    t("diagnosisUncertainCondition");

  const predictionCrop =
    firstPrediction?.crop ||
    t("diagnosisUnknown");

  return (
    <div className="diagnosis-page">
      {/* HEADER */}
      <div className="diagnosis-header">
        <h1>{t("diagnosisTitle")}</h1>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "20px",
          }}
        >
          {t("diagnosisDesc")}
        </p>
      </div>

      {/* CROP CONTEXT */}
      <div className="clean-card">
        <h3 style={{ marginTop: 0 }}>
          {t("diagnosisStep1")}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {t("diagnosisCropLabel")}
            </label>

            <select
              className="input-field"
              value={crop}
              onChange={(e) => {
                setCrop(e.target.value);
                setResult(null);
              }}
            >
              {CROPS.map((item) => (
                <option key={item} value={item}>
                  {getCropLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {t("diagnosisGrowthStageLabel")}
            </label>

            <select
              className="input-field"
              value={growthStage}
              onChange={(e) => {
                setGrowthStage(e.target.value);
                setResult(null);
              }}
            >
              {GROWTH_STAGES.map((item) => (
                <option key={item} value={item}>
                  {getStageLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* IMAGE UPLOAD */}
      <div
        className="clean-card"
        style={{ marginTop: "18px" }}
      >
        <h3 style={{ marginTop: 0 }}>
          {t("diagnosisStep2")}
        </h3>

        <p
          style={{
            color: "var(--text-muted)",
            marginTop: 0,
          }}
        >
          {t("diagnosisUploadDescription")}
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          className="input-field"
        />

        {qualityChecking && (
          <p style={{ marginTop: "12px" }}>
            {t("diagnosisCheckingQuality")}
          </p>
        )}

        {files.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "14px",
              marginTop: "18px",
            }}
          >
            {files.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "10px",
                  background: "#fff",
                }}
              >
                <img
                  src={item.preview}
                  alt={tr("diagnosisImageAlt", {
                    number: index + 1,
                  })}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                  }}
                >
                  <strong>
                    {tr("diagnosisImageNumber", {
                      number: index + 1,
                    })}
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      color:
                        item.quality.status === "good"
                          ? "#15803d"
                          : item.quality.status ===
                              "acceptable"
                            ? "#a16207"
                            : "#b91c1c",
                    }}
                  >
                    {item.quality.status === "good"
                      ? t("diagnosisGoodQuality")
                      : item.quality.status ===
                          "acceptable"
                        ? t("diagnosisAcceptableQuality")
                        : t("diagnosisPoorQuality")}
                  </div>

                  <div
                    style={{
                      color: "var(--text-muted)",
                      marginTop: "3px",
                    }}
                  >
                    {item.quality.unreadable
                      ? t("diagnosisUnableRead")
                      : item.quality.status === "poor"
                        ? tr("diagnosisTooSmall", {
                            width: item.quality.width,
                            height: item.quality.height,
                          })
                        : item.quality.status ===
                            "acceptable"
                          ? tr(
                              "diagnosisLowResolution",
                              {
                                width:
                                  item.quality.width,
                                height:
                                  item.quality.height,
                              }
                            )
                          : tr(
                              "diagnosisGoodResolution",
                              {
                                width:
                                  item.quality.width,
                                height:
                                  item.quality.height,
                              }
                            )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    marginTop: "8px",
                    border: "none",
                    background: "transparent",
                    color: "#b91c1c",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {t("diagnosisRemove")}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={runAnalysis}
          disabled={
            loading ||
            qualityChecking ||
            files.length === 0
          }
          style={{
            marginTop: "18px",
            width: "auto",
          }}
        >
          {loading
            ? t("diagnosisRunning")
            : t("diagnosisAnalyze")}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            marginTop: "18px",
            padding: "14px 16px",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            color: "#991b1b",
          }}
        >
          <strong>
            {t("diagnosisErrorTitle")}
          </strong>

          <div style={{ marginTop: "4px" }}>
            {error}
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div
          className="clean-card"
          style={{ marginTop: "18px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {t("diagnosisComplete")}
            </h2>

            <span
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                background:
                  compatibility === "compatible"
                    ? "#dcfce7"
                    : "#fef2f2",
                color:
                  compatibility === "compatible"
                    ? "#166534"
                    : "#991b1b",
              }}
            >
              {compatibility === "compatible"
                ? t("diagnosisContextSupported")
                : compatibility === "mismatch"
                  ? t("diagnosisContextMismatch")
                  : t("diagnosisContextLimited")}
            </span>
          </div>

          {/* CONTEXT SUMMARY */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <div
              style={{
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <small>
                {t("diagnosisCropLabel")}
              </small>

              <div>
                <strong>
                  {getCropLabel(crop)}
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <small>
                {t("diagnosisGrowthStageLabel")}
              </small>

              <div>
                <strong>
                  {getStageLabel(growthStage)}
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              <small>
                {t("diagnosisImagesAnalyzed")}
              </small>

              <div>
                <strong>
                  {result?.input?.image_count ||
                    files.length}
                </strong>
              </div>
            </div>
          </div>

          {/* AI PREDICTION */}
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "12px",
              background:
                compatibility === "compatible"
                  ? "#f0fdf4"
                  : "#fff7ed",
              border:
                compatibility === "compatible"
                  ? "1px solid #86efac"
                  : "1px solid #fdba74",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {t("diagnosisPrediction")}
            </h3>

            <p>
              <strong>
                {t("diagnosisPossibleCondition")}:
              </strong>{" "}
              {predictionName}
            </p>

            <p>
              <strong>
                {t("diagnosisPredictedCrop")}:
              </strong>{" "}
              {predictionCrop}
            </p>

            <p>
              <strong>
                {t("diagnosisConfidence")}:
              </strong>{" "}
              {confidence !== null
                ? `${confidence.toFixed(1)}%`
                : t("diagnosisNotAvailable")}
            </p>

            {compatibility === "compatible" && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#166534",
                  fontWeight: 600,
                }}
              >
                ✓ {t("diagnosisCompatibleMessage")}
              </div>
            )}

            {compatibility === "mismatch" && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#9a3412",
                  fontWeight: 600,
                }}
              >
                ⚠ {t("diagnosisMismatchMessage")}
              </div>
            )}

            {compatibility === "unsupported" && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#9a3412",
                  fontWeight: 600,
                }}
              >
                ⚠ {t("diagnosisUnsupportedMessage")}
              </div>
            )}
          </div>

          {/* SAFETY CHECK */}
          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {t("diagnosisSafetyCheck")}
            </h3>

            <div
              style={{
                display: "grid",
                gap: "8px",
              }}
            >
              <div>
                ✓{" "}
                {tr("diagnosisMultipleImages", {
                  count: files.length,
                  plural:
                    files.length !== 1 ? "s" : "",
                })}
              </div>

              <div>
                ✓ {t("diagnosisQualityChecked")}
              </div>

              <div>
                ✓{" "}
                {tr("diagnosisCropSupplied", {
                  crop: getCropLabel(crop),
                })}
              </div>

              <div>
                ✓{" "}
                {tr("diagnosisStageSupplied", {
                  stage: getStageLabel(
                    growthStage
                  ),
                })}
              </div>

              <div>
                {compatibility === "compatible"
                  ? `✓ ${t(
                      "diagnosisConsistencyPassed"
                    )}`
                  : `⚠ ${t(
                      "diagnosisConsistencyLimited"
                    )}`}
              </div>
            </div>

            <p
              style={{
                marginBottom: 0,
                marginTop: "12px",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              {t("diagnosisSafetyDescription")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Diagnosis;
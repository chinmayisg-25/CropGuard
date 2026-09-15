import "./Diagnosis.css";
import { useEffect, useRef, useState } from "react";
import { analyzeCrop } from "../services/diagnosisService";

const crops = [
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

const growthStages = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Maturity",
];

function Diagnosis() {
  const fileInputRef = useRef(null);

  const [crop, setCrop] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [images, setImages] = useState([]);
  const [qualityResults, setQualityResults] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const results = images.map((image) => {
      const width = image.width;
      const height = image.height;

      const resolutionGood = width >= 640 && height >= 480;
      const sizeGood = image.file.size <= 10 * 1024 * 1024;

      let status = "good";
      let message = "Image quality looks suitable for analysis.";

      if (!resolutionGood) {
        status = "warning";
        message = "Low resolution. A clearer image is recommended.";
      } else if (!sizeGood) {
        status = "warning";
        message = "Image is too large. Please use an image below 10 MB.";
      }

      return {
        id: image.id,
        status,
        message,
      };
    });

    setQualityResults(results);
  }, [images]);

  function handleImageSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots = 5 - images.length;
    const filesToProcess = selectedFiles.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        setImages((currentImages) => [
          ...currentImages,
          {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: imageUrl,
            width: image.width,
            height: image.height,
          },
        ]);
      };

      image.src = imageUrl;
    });

    event.target.value = "";
  }

  function removeImage(id) {
    setImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return currentImages.filter((image) => image.id !== id);
    });

    setAnalysisResult(null);
    setAnalysisError("");
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function startAnalysis() {
    if (!crop || !growthStage || images.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError("");

    try {
      const result = await analyzeCrop({
        crop,
        growthStage,
        images,
      });

      console.log("CropGuard analysis response:", result);

      setAnalysisResult(result);
    } catch (error) {
      console.error("CropGuard analysis error:", error);

      setAnalysisError(
        error.message || "Unable to connect to the CropGuard backend."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const hasWarning = qualityResults.some(
    (result) => result.status === "warning"
  );

  const canAnalyze =
    crop !== "" &&
    growthStage !== "" &&
    images.length > 0 &&
    !hasWarning;

  return (
    <div className="diagnosis-page">
      <section className="diagnosis-intro">
        <div>
          <span className="section-label">SMART CROP DIAGNOSIS</span>

          <h1>Check My Crop</h1>

          <p>
            Give CropGuard a little context about your crop and upload clear
            images. This information will be used together with environmental
            intelligence for the diagnosis.
          </p>
        </div>

        <div className="diagnosis-step-indicator">
          <span className="step-active">1</span>
          <span className="step-line"></span>
          <span>2</span>
          <span className="step-line"></span>
          <span>3</span>
        </div>
      </section>

      <section className="diagnosis-card">
        <div className="diagnosis-card-header">
          <div>
            <span className="section-label">STEP 1</span>
            <h2>Tell us about your crop</h2>
          </div>

          <span className="diagnosis-number">01</span>
        </div>

        <div className="diagnosis-fields">
          <div className="field-group">
            <label htmlFor="crop">
              Crop <span>*</span>
            </label>

            <select
              id="crop"
              value={crop}
              onChange={(event) => {
                setCrop(event.target.value);
                setAnalysisResult(null);
                setAnalysisError("");
              }}
            >
              <option value="">Select your crop</option>

              {crops.map((cropName) => (
                <option key={cropName} value={cropName}>
                  {cropName}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="growth-stage">
              Growth stage <span>*</span>
            </label>

            <select
              id="growth-stage"
              value={growthStage}
              onChange={(event) => {
                setGrowthStage(event.target.value);
                setAnalysisResult(null);
                setAnalysisError("");
              }}
            >
              <option value="">Select growth stage</option>

              {growthStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="diagnosis-card">
        <div className="diagnosis-card-header">
          <div>
            <span className="section-label">STEP 2</span>
            <h2>Add crop images</h2>

            <p className="card-description">
              Upload up to 5 images. Multiple views can help CropGuard
              understand visible symptoms more reliably.
            </p>
          </div>

          <span className="image-count">{images.length} / 5</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleImageSelection}
        />

        {images.length === 0 ? (
          <button
            type="button"
            className="upload-area"
            onClick={openFilePicker}
          >
            <span className="upload-icon">↑</span>

            <strong>Upload crop images</strong>

            <span>Tap to choose photos from your device</span>

            <small>
              JPG, PNG or other common image formats · Up to 5 images
            </small>
          </button>
        ) : (
          <>
            <div className="image-grid">
              {images.map((image, index) => {
                const quality = qualityResults.find(
                  (result) => result.id === image.id
                );

                return (
                  <div className="image-preview-card" key={image.id}>
                    <img
                      src={image.url}
                      alt={`Crop sample ${index + 1}`}
                    />

                    <div className="image-preview-overlay">
                      <span>Image {index + 1}</span>

                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>

                    {quality && (
                      <div
                        className={`quality-badge ${quality.status}`}
                      >
                        {quality.status === "good"
                          ? "✓ Good"
                          : "⚠ Check"}
                      </div>
                    )}
                  </div>
                );
              })}

              {images.length < 5 && (
                <button
                  type="button"
                  className="add-more-image"
                  onClick={openFilePicker}
                >
                  <span>+</span>
                  <strong>Add another</strong>
                  <small>
                    {5 - images.length} slot
                    {5 - images.length === 1 ? "" : "s"} remaining
                  </small>
                </button>
              )}
            </div>

            {hasWarning && (
              <div className="quality-warning">
                <span>⚠</span>

                <div>
                  <strong>Image quality needs attention</strong>

                  <p>
                    One or more images may not be suitable for reliable
                    analysis. Try uploading a clearer image.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {images.length > 0 && (
        <section className="diagnosis-card quality-card">
          <div className="diagnosis-card-header">
            <div>
              <span className="section-label">STEP 3</span>
              <h2>Review before analysis</h2>
            </div>

            <span className="review-icon">✓</span>
          </div>

          <div className="review-list">
            <div className="review-row">
              <span>Crop</span>
              <strong>{crop || "Not selected"}</strong>
            </div>

            <div className="review-row">
              <span>Growth stage</span>
              <strong>{growthStage || "Not selected"}</strong>
            </div>

            <div className="review-row">
              <span>Images</span>
              <strong>
                {images.length} image{images.length === 1 ? "" : "s"}
              </strong>
            </div>

            <div className="review-row">
              <span>Image quality</span>

              <strong
                className={hasWarning ? "warning-text" : "good-text"}
              >
                {hasWarning ? "Needs attention" : "Ready"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="analyze-button"
            disabled={!canAnalyze || isAnalyzing}
            onClick={startAnalysis}
          >
            {isAnalyzing ? (
              <>
                <span className="loading-spinner"></span>
                Sending to CropGuard...
              </>
            ) : (
              <>
                Analyze my crop
                <span>→</span>
              </>
            )}
          </button>

          {!crop || !growthStage ? (
            <p className="form-hint">
              Select your crop and growth stage before starting analysis.
            </p>
          ) : hasWarning ? (
            <p className="form-hint">
              Please replace the image that needs attention before
              analysis.
            </p>
          ) : null}

          {analysisError && (
            <div className="quality-warning">
              <span>⚠</span>

              <div>
                <strong>Analysis request failed</strong>
                <p>{analysisError}</p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="analysis-result">
              <span className="section-label">CROPGUARD RESPONSE</span>

              <h3>Request received successfully ✓</h3>

              <p>
                Your crop information and image{" "}
                {analysisResult.input?.image_count === 1
                  ? "has"
                  : "have"}{" "}
                been successfully sent to the CropGuard backend.
              </p>

              <div className="review-list">
                <div className="review-row">
                  <span>Crop</span>
                  <strong>
                    {analysisResult.input?.crop || crop}
                  </strong>
                </div>

                <div className="review-row">
                  <span>Growth stage</span>
                  <strong>
                    {analysisResult.input?.growth_stage ||
                      growthStage}
                  </strong>
                </div>

                <div className="review-row">
                  <span>Images received</span>
                  <strong>
                    {analysisResult.input?.image_count ??
                      images.length}
                  </strong>
                </div>
              </div>

              <p className="form-hint">
                AI disease and pest inference will be connected after
                the trained model is integrated.
              </p>
            </div>
          )}
        </section>
      )}

      <section className="diagnosis-info">
        <div className="info-icon">✦</div>

        <div>
          <strong>Why CropGuard asks for context</strong>

          <p>
            The image is only one part of the assessment. CropGuard is
            designed to combine crop condition with growth stage, weather,
            location, historical intelligence and local reports.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Diagnosis;
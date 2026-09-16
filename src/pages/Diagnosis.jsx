import { useState } from "react";
import "./Diagnosis.css";
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function Diagnosis() {
  const [crop, setCrop] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [images, setImages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
      return "Please upload a valid image file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 10 MB.`;
    }

    return null;
  };

  const checkImageQuality = (file) => {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        if (image.width < 640 || image.height < 480) {
          resolve(
            `${file.name} is too small. Please use an image at least 640 × 480 pixels.`
          );
        } else {
          resolve(null);
        }

        URL.revokeObjectURL(image.src);
      };

      image.onerror = () => {
        resolve(`Unable to read ${file.name}.`);
      };

      image.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setError("");
    setAnalysisResult(null);

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newImages = [];

    for (const file of selectedFiles) {
      const validationError = validateImage(file);

      if (validationError) {
        setError(validationError);
        continue;
      }

      const qualityError = await checkImageQuality(file);

      if (qualityError) {
        setError(qualityError);
        continue;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((previous) => [...previous, ...newImages]);

    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((previous) => {
      const imageToRemove = previous[indexToRemove];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return previous.filter(
        (_, index) => index !== indexToRemove
      );
    });

    setAnalysisResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalysisResult(null);

    if (!crop) {
      setError("Please select a crop.");
      return;
    }

    if (!growthStage) {
      setError("Please select the crop growth stage.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one crop image.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeCrop({
        crop,
        growthStage,
        images,
      });

      console.log("CropGuard AI response:", result);

      setAnalysisResult(result);
    } catch (err) {
      console.error("CropGuard analysis error:", err);

      setError(
        err?.message ||
          "Unable to analyze the crop. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictions =
    analysisResult?.ai_analysis?.predictions || [];

  return (
    <div className="diagnosis-page">
      <div className="diagnosis-header">
        <div>
          <h1>Check My Crop</h1>
          <p>
            Upload crop images and let CropGuard analyze them
            using the trained AI model.
          </p>
        </div>
      </div>

      <div className="diagnosis-card">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="crop">Crop</label>

            <select
              id="crop"
              value={crop}
              onChange={(event) => {
                setCrop(event.target.value);
                setAnalysisResult(null);
                setError("");
              }}
            >
              <option value="">Select crop</option>

              {CROPS.map((cropName) => (
                <option key={cropName} value={cropName}>
                  {cropName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="growth-stage">
              Growth Stage
            </label>

            <select
              id="growth-stage"
              value={growthStage}
              onChange={(event) => {
                setGrowthStage(event.target.value);
                setAnalysisResult(null);
                setError("");
              }}
            >
              <option value="">Select growth stage</option>

              {GROWTH_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="upload-section">
          <div className="upload-header">
            <div>
              <h2>Crop Images</h2>
              <p>
                Upload up to {MAX_IMAGES} clear crop images.
              </p>
            </div>

            <span>
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <label className="upload-box">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
            />

            <div className="upload-icon">+</div>

            <strong>Upload crop images</strong>

            <span>
              JPG, PNG or WebP • Maximum 10 MB each
            </span>
          </label>

          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map((image, index) => (
                <div
                  className="image-preview-card"
                  key={`${image.file.name}-${index}`}
                >
                  <img
                    src={image.preview}
                    alt={`Crop preview ${index + 1}`}
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>

                  <span>{image.file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="diagnosis-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing
            ? "Analyzing with CropGuard AI..."
            : "Analyze my crop →"}
        </button>
      </div>

      {analysisResult && (
        <div className="analysis-results">
          <div className="results-header">
            <div>
              <h2>CropGuard AI Analysis</h2>

              <p>
                Analysis completed for{" "}
                <strong>
                  {analysisResult.input?.crop || crop}
                </strong>{" "}
                at the{" "}
                <strong>
                  {analysisResult.input?.growth_stage ||
                    growthStage}
                </strong>{" "}
                stage.
              </p>
            </div>

            <span className="result-status">
              ✓ Completed
            </span>
          </div>

          <div className="result-summary">
            <div className="summary-item">
              <span>Crop</span>
              <strong>
                {analysisResult.input?.crop || crop}
              </strong>
            </div>

            <div className="summary-item">
              <span>Growth stage</span>
              <strong>
                {analysisResult.input?.growth_stage ||
                  growthStage}
              </strong>
            </div>

            <div className="summary-item">
              <span>Images analyzed</span>
              <strong>
                {analysisResult.input?.image_count ||
                  images.length}
              </strong>
            </div>
          </div>

          <div className="prediction-section">
            <h3>AI Prediction</h3>

            {predictions.length === 0 ? (
              <div className="no-prediction">
                The AI model did not return a prediction.
              </div>
            ) : (
              predictions.map((prediction, index) => (
                <div
                  className="prediction-card"
                  key={`${prediction.class_name}-${index}`}
                >
                  <div className="prediction-main">
                    <div>
                      <span className="prediction-label">
                        Model prediction
                      </span>

                      <h3>
                        {prediction.condition ||
                          "Unknown condition"}
                      </h3>

                      <p>
                        Model crop:{" "}
                        <strong>
                          {prediction.crop || "Unknown"}
                        </strong>
                      </p>

                      <p>
                        Type:{" "}
                        <strong>
                          {prediction.condition_type ||
                            "Unknown"}
                        </strong>
                      </p>
                    </div>

                    <div className="confidence-box">
                      <span>Model confidence</span>

                      <strong>
                        {prediction.confidence_percent}%
                      </strong>
                    </div>
                  </div>

                  <div className="prediction-class">
                    Model class:{" "}
                    <code>
                      {prediction.class_name}
                    </code>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="ai-disclaimer">
            <strong>Important:</strong> This is the output
            of the trained CropGuard AI model. Model
            confidence is not the same as guaranteed
            real-world field diagnosis. CropGuard should
            consider crop context, image quality, weather,
            location and expert validation before making
            field-level recommendations.
          </div>
        </div>
      )}
    </div>
  );
}

export default Diagnosis;
const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeCrop({
  crop,
  growthStage,
  images,
}) {
  const formData = new FormData();

  formData.append("crop", crop);
  formData.append("growth_stage", growthStage);

  images.forEach((image) => {
    formData.append("images", image.file);
  });

  const response = await fetch(
    `${API_BASE_URL}/api/diagnosis/analyze`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Crop analysis request failed.",
    );
  }

  return data;
}
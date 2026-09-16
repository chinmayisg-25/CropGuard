from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.ai_inference import predict_images


router = APIRouter(
    prefix="/api/diagnosis",
    tags=["Diagnosis"],
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


MAX_IMAGES = 5
MAX_FILE_SIZE = 10 * 1024 * 1024


# ------------------------------------------------------------
# Crop compatibility mapping
# ------------------------------------------------------------
# The frontend uses "Maize", while the trained model uses
# "Corn". This mapping allows those two names to be treated
# as the same crop.
#
# Only crops actually represented in the trained model are
# considered supported here.
# ------------------------------------------------------------

MODEL_CROP_MAPPING = {
    "rice": "rice",
    "wheat": "wheat",
    "potato": "potato",
    "tomato": "tomato",
    "sugarcane": "sugarcane",
    "maize": "corn",
}


@router.post("/analyze")
async def analyze_crop(
    crop: str = Form(...),
    growth_stage: str = Form(...),
    images: list[UploadFile] = File(...),
):
    # --------------------------------------------------------
    # Validate crop
    # --------------------------------------------------------

    selected_crop = crop.strip()

    if not selected_crop:
        raise HTTPException(
            status_code=400,
            detail="Crop is required.",
        )

    # --------------------------------------------------------
    # Validate growth stage
    # --------------------------------------------------------

    selected_growth_stage = growth_stage.strip()

    if not selected_growth_stage:
        raise HTTPException(
            status_code=400,
            detail="Growth stage is required.",
        )

    # --------------------------------------------------------
    # Validate image count
    # --------------------------------------------------------

    if not images:
        raise HTTPException(
            status_code=400,
            detail="At least one crop image is required.",
        )

    if len(images) > MAX_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"A maximum of {MAX_IMAGES} images is allowed.",
        )

    # --------------------------------------------------------
    # Read and validate images
    # --------------------------------------------------------

    image_bytes_list = []
    image_information = []

    for image in images:

        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image type for "
                    f"'{image.filename}'. "
                    "Please use JPG, PNG, or WebP."
                ),
            )

        image_bytes = await image.read()

        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"'{image.filename}' is larger than "
                    "the 10 MB limit."
                ),
            )

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail=f"'{image.filename}' is empty.",
            )

        image_bytes_list.append(image_bytes)

        image_information.append(
            {
                "filename": image.filename,
                "content_type": image.content_type,
                "size_bytes": len(image_bytes),
            }
        )

    # --------------------------------------------------------
    # Run REAL AI inference
    # --------------------------------------------------------

    try:
        predictions = predict_images(
            image_bytes_list
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "AI inference failed. "
                f"Technical detail: {str(exc)}"
            ),
        ) from exc

    # --------------------------------------------------------
    # Crop compatibility checking
    # --------------------------------------------------------

    selected_crop_key = selected_crop.lower()

    expected_model_crop = MODEL_CROP_MAPPING.get(
        selected_crop_key
    )

    compatibility_results = []

    for prediction in predictions:

        predicted_crop = str(
            prediction.get("crop", "")
        ).strip()

        predicted_crop_key = predicted_crop.lower()

        # ----------------------------------------------------
        # Unsupported frontend crop
        # ----------------------------------------------------

        if expected_model_crop is None:
            compatibility_results.append(
                {
                    "status": "unsupported",
                    "selected_crop": selected_crop,
                    "predicted_crop": predicted_crop,
                    "message": (
                        f"The trained CropGuard AI model does "
                        f"not currently support '{selected_crop}'. "
                        "The prediction must not be treated as "
                        "a confirmed diagnosis for this crop."
                    ),
                }
            )

        # ----------------------------------------------------
        # Supported crop but AI predicted another crop
        # ----------------------------------------------------

        elif predicted_crop_key != expected_model_crop:
            compatibility_results.append(
                {
                    "status": "mismatch",
                    "selected_crop": selected_crop,
                    "predicted_crop": predicted_crop,
                    "message": (
                        "AI prediction does not match the "
                        "selected crop. The prediction must "
                        "not be presented as a confirmed "
                        "diagnosis for the selected crop."
                    ),
                }
            )

        # ----------------------------------------------------
        # AI crop matches selected crop
        # ----------------------------------------------------

        else:
            compatibility_results.append(
                {
                    "status": "compatible",
                    "selected_crop": selected_crop,
                    "predicted_crop": predicted_crop,
                    "message": (
                        "AI-predicted crop matches the "
                        "selected crop."
                    ),
                }
            )

    # --------------------------------------------------------
    # Overall compatibility status
    # --------------------------------------------------------

    if any(
        result["status"] == "mismatch"
        for result in compatibility_results
    ):
        overall_compatibility = "mismatch"

    elif any(
        result["status"] == "unsupported"
        for result in compatibility_results
    ):
        overall_compatibility = "unsupported"

    else:
        overall_compatibility = "compatible"

    # --------------------------------------------------------
    # Return diagnosis response
    # --------------------------------------------------------

    return {
        "status": "completed",
        "message": (
            "Crop information and images were analyzed "
            "using the CropGuard AI model."
        ),
        "input": {
            "crop": selected_crop,
            "growth_stage": selected_growth_stage,
            "image_count": len(images),
            "images": image_information,
        },
        "crop_compatibility": {
            "status": overall_compatibility,
            "results": compatibility_results,
        },
        "ai_analysis": {
            "status": "completed",
            "predictions": predictions,
        },
    }
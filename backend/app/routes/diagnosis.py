from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile


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


@router.post("/analyze")
async def analyze_crop(
    crop: str = Form(...),
    growth_stage: str = Form(...),
    images: list[UploadFile] = File(...),
):
    if not crop.strip():
        raise HTTPException(
            status_code=400,
            detail="Crop is required.",
        )

    if not growth_stage.strip():
        raise HTTPException(
            status_code=400,
            detail="Growth stage is required.",
        )

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

    image_information = []

    for image in images:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image type for '{image.filename}'. "
                    "Please use JPG, PNG, or WebP."
                ),
            )

        image_bytes = await image.read()

        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"'{image.filename}' is larger than the "
                    "10 MB limit."
                ),
            )

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail=f"'{image.filename}' is empty.",
            )

        image_information.append(
            {
                "filename": image.filename,
                "content_type": image.content_type,
                "size_bytes": len(image_bytes),
            }
        )

    return {
        "status": "received",
        "message": (
            "Crop information and images were received successfully. "
            "AI inference will be connected after the trained model "
            "is integrated."
        ),
        "input": {
            "crop": crop.strip(),
            "growth_stage": growth_stage.strip(),
            "image_count": len(images),
            "images": image_information,
        },
        "ai_analysis": {
            "status": "not_available",
            "disease": None,
            "pest": None,
            "confidence": None,
        },
    }
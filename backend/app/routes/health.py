from fastapi import APIRouter

router = APIRouter(
    prefix="/api",
    tags=["System"],
)


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CropGuard API",
        "version": "1.0.0",
    }
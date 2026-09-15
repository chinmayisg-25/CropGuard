from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.diagnosis import router as diagnosis_router


app = FastAPI(
    title="CropGuard API",
    description=(
        "AI-Powered Context-Aware Crop Health Intelligence System "
        "for Early Disease & Pest Detection"
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(diagnosis_router)


@app.get("/")
def root():
    return {
        "message": "CropGuard API is running",
        "status": "ready",
    }
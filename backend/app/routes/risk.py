from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/api/risk",
    tags=["Risk Assessment"],
)


# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class RiskRequest(BaseModel):
    crop: str = Field(..., min_length=1)
    growth_stage: str = Field(..., min_length=1)
    temperature: float
    humidity: float
    precipitation: float
    wind_speed: float
    symptoms: str = ""


# ---------------------------------------------------------
# CROP-SPECIFIC RISK CONDITIONS
# ---------------------------------------------------------

CROP_RISK_CONDITIONS = {
    "rice": {
        "high_humidity": 85,
        "rainfall_trigger": 5,
        "temperature_min": 20,
        "temperature_max": 32,
    },
    "wheat": {
        "high_humidity": 80,
        "rainfall_trigger": 3,
        "temperature_min": 10,
        "temperature_max": 25,
    },
    "tomato": {
        "high_humidity": 80,
        "rainfall_trigger": 3,
        "temperature_min": 18,
        "temperature_max": 30,
    },
    "potato": {
        "high_humidity": 80,
        "rainfall_trigger": 3,
        "temperature_min": 15,
        "temperature_max": 25,
    },
    "maize": {
        "high_humidity": 80,
        "rainfall_trigger": 5,
        "temperature_min": 18,
        "temperature_max": 32,
    },
    "sugarcane": {
        "high_humidity": 85,
        "rainfall_trigger": 5,
        "temperature_min": 20,
        "temperature_max": 35,
    },
    "cotton": {
        "high_humidity": 80,
        "rainfall_trigger": 5,
        "temperature_min": 20,
        "temperature_max": 32,
    },
    "soybean": {
        "high_humidity": 80,
        "rainfall_trigger": 5,
        "temperature_min": 20,
        "temperature_max": 30,
    },
}


# ---------------------------------------------------------
# RISK ASSESSMENT
# ---------------------------------------------------------

def calculate_risk(data: RiskRequest):
    crop_key = data.crop.strip().lower()

    if crop_key not in CROP_RISK_CONDITIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Risk rules are not available for crop: {data.crop}",
        )

    conditions = CROP_RISK_CONDITIONS[crop_key]

    score = 0
    factors = []

    # -----------------------------------------------------
    # HUMIDITY
    # -----------------------------------------------------

    if data.humidity >= conditions["high_humidity"]:
        score += 30

        factors.append({
            "factor": "High humidity",
            "value": f"{data.humidity}%",
            "impact": "increases",
            "reason": (
                "High humidity can create favorable conditions "
                "for several crop diseases."
            ),
        })

    elif data.humidity >= conditions["high_humidity"] - 10:
        score += 15

        factors.append({
            "factor": "Moderate-high humidity",
            "value": f"{data.humidity}%",
            "impact": "slightly increases",
            "reason": (
                "Humidity is elevated and may support disease "
                "development under suitable conditions."
            ),
        })

    else:
        factors.append({
            "factor": "Humidity",
            "value": f"{data.humidity}%",
            "impact": "does not strongly increase",
            "reason": "Humidity is below the elevated-risk threshold.",
        })

    # -----------------------------------------------------
    # PRECIPITATION
    # -----------------------------------------------------

    if data.precipitation >= conditions["rainfall_trigger"]:
        score += 25

        factors.append({
            "factor": "Recent precipitation",
            "value": f"{data.precipitation} mm",
            "impact": "increases",
            "reason": (
                "Recent rainfall can increase leaf wetness and "
                "favorable conditions for some diseases."
            ),
        })

    elif data.precipitation > 0:
        score += 10

        factors.append({
            "factor": "Light precipitation",
            "value": f"{data.precipitation} mm",
            "impact": "slightly increases",
            "reason": (
                "Some rainfall is present, although it is below "
                "the stronger rainfall trigger."
            ),
        })

    else:
        factors.append({
            "factor": "Precipitation",
            "value": "0 mm",
            "impact": "does not increase",
            "reason": "No current precipitation was recorded.",
        })

    # -----------------------------------------------------
    # TEMPERATURE
    # -----------------------------------------------------

    if (
        conditions["temperature_min"]
        <= data.temperature
        <= conditions["temperature_max"]
    ):
        score += 20

        factors.append({
            "factor": "Temperature",
            "value": f"{data.temperature}°C",
            "impact": "supports",
            "reason": (
                "The current temperature is within the broad "
                "crop-specific monitoring range."
            ),
        })

    else:
        factors.append({
            "factor": "Temperature",
            "value": f"{data.temperature}°C",
            "impact": "does not strongly increase",
            "reason": (
                "The current temperature is outside the broad "
                "monitoring range used by this initial rule set."
            ),
        })

    # -----------------------------------------------------
    # FIELD SYMPTOMS
    # -----------------------------------------------------

    symptoms = data.symptoms.strip().lower()

    if symptoms and symptoms not in {
        "no visible symptoms",
        "none",
        "no symptoms",
        "nothing",
    }:
        score += 25

        factors.append({
            "factor": "Field observations",
            "value": data.symptoms.strip(),
            "impact": "increases",
            "reason": (
                "Reported symptoms should be investigated because "
                "visible field observations can indicate an existing "
                "crop-health problem."
            ),
        })
    else:
        factors.append({
            "factor": "Field observations",
            "value": "No visible symptoms",
            "impact": "does not increase",
            "reason": (
                "No visible symptoms were reported during the "
                "current assessment."
            ),
        })

    # -----------------------------------------------------
    # LIMIT SCORE
    # -----------------------------------------------------

    score = min(score, 100)

    # -----------------------------------------------------
    # RISK LEVEL
    # -----------------------------------------------------

    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # -----------------------------------------------------
    # MONITORING MESSAGE
    # -----------------------------------------------------

    if risk_level == "High":
        monitoring_message = (
            "Conditions indicate increased crop-health concern. "
            "Inspect the field closely and consider expert validation "
            "if symptoms are present."
        )

    elif risk_level == "Moderate":
        monitoring_message = (
            "Some conditions may support crop-health problems. "
            "Continue field monitoring and watch for new symptoms."
        )

    else:
        monitoring_message = (
            "Current inputs do not indicate strongly elevated risk "
            "under this initial rule set. Continue normal crop monitoring."
        )

    return {
        "status": "completed",
        "risk_level": risk_level,
        "risk_score": score,
        "crop": data.crop,
        "growth_stage": data.growth_stage,
        "weather": {
            "temperature": data.temperature,
            "humidity": data.humidity,
            "precipitation": data.precipitation,
            "wind_speed": data.wind_speed,
        },
        "factors": factors,
        "monitoring_message": monitoring_message,
        "engine": {
            "type": "rule_based_initial_risk_engine",
            "version": "1.0",
            "note": (
                "This is an initial transparent rule-based assessment. "
                "It is not a confirmed disease diagnosis. Future versions "
                "will incorporate historical disease data, local reports, "
                "weather history and validated agricultural intelligence."
            ),
        },
    }


# ---------------------------------------------------------
# API ENDPOINT
# ---------------------------------------------------------

@router.post("/assess")
def assess_risk(request: RiskRequest):
    return calculate_risk(request)
from pathlib import Path
from typing import Any

import torch
from PIL import Image, UnidentifiedImageError
from torchvision import transforms
from torchvision.models import efficientnet_b0
from torch import nn


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent

MODEL_PATH = (
    PROJECT_ROOT
    / "ai"
    / "models"
    / "cropguard_efficientnet_b0.pth"
)


# ============================================================
# MODEL CONFIGURATION
# ============================================================

DEVICE = torch.device("cpu")
IMAGE_SIZE = 224


# These are exactly the normalization values used during
# CropGuard model training/evaluation.
IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)


# ============================================================
# MODEL STATE
# ============================================================

_model = None
_class_names = None
_checkpoint = None


# ============================================================
# MODEL LOADING
# ============================================================

def load_model() -> None:
    """
    Load the trained CropGuard EfficientNet-B0 model once.

    The model checkpoint contains:
    - model_state_dict
    - class_names
    - num_classes
    - image_size
    - model_name
    - validation_accuracy
    """

    global _model
    global _class_names
    global _checkpoint

    if _model is not None:
        return

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"CropGuard model not found at: {MODEL_PATH}"
        )

    _checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
    )

    num_classes = _checkpoint["num_classes"]

    model = efficientnet_b0(weights=None)

    model.classifier[1] = nn.Linear(
        model.classifier[1].in_features,
        num_classes,
    )

    model.load_state_dict(
        _checkpoint["model_state_dict"]
    )

    model.to(DEVICE)
    model.eval()

    _model = model
    _class_names = _checkpoint["class_names"]


# ============================================================
# IMAGE PREPARATION
# ============================================================

def prepare_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert uploaded image bytes into the tensor expected
    by the trained EfficientNet-B0 model.
    """

    try:
        image = Image.open(
            __import__("io").BytesIO(image_bytes)
        )

        image = image.convert("RGB")

    except UnidentifiedImageError as exc:
        raise ValueError(
            "The uploaded file is not a valid image."
        ) from exc

    except Exception as exc:
        raise ValueError(
            "Unable to read the uploaded image."
        ) from exc

    tensor = IMAGE_TRANSFORM(image)

    tensor = tensor.unsqueeze(0)

    return tensor.to(DEVICE)


# ============================================================
# CLASS NAME PARSING
# ============================================================

def parse_class_name(class_name: str) -> dict[str, Any]:
    """
    Convert a dataset class name such as:

        Tomato___Early_Blight

    into structured information.

    The model's original class name is preserved.
    """

    parts = class_name.split("___", 1)

    if len(parts) == 2:
        crop_name = parts[0]
        condition_name = parts[1].replace("_", " ")

    else:
        crop_name = None
        condition_name = class_name.replace("_", " ")

    if condition_name.lower() == "healthy":
        condition_type = "healthy"
    else:
        condition_type = "disease_or_pest"

    return {
        "class_name": class_name,
        "crop": crop_name,
        "condition": condition_name,
        "condition_type": condition_type,
    }


# ============================================================
# SINGLE IMAGE INFERENCE
# ============================================================

def predict_image(image_bytes: bytes) -> dict[str, Any]:
    """
    Run real EfficientNet-B0 inference on one image.

    Returns:
    - predicted class
    - crop represented by the predicted class
    - condition
    - condition type
    - model confidence
    - model metadata
    """

    load_model()

    input_tensor = prepare_image(image_bytes)

    with torch.no_grad():
        outputs = _model(input_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1,
        )

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1,
        )

    class_index = int(predicted_index.item())

    confidence_value = float(
        confidence.item()
    )

    class_name = _class_names[class_index]

    parsed = parse_class_name(class_name)

    return {
        **parsed,
        "confidence": confidence_value,
        "confidence_percent": round(
            confidence_value * 100,
            2,
        ),
        "model": {
            "name": _checkpoint["model_name"],
            "architecture": "EfficientNet-B0",
            "image_size": _checkpoint["image_size"],
            "num_classes": _checkpoint["num_classes"],
        },
    }


# ============================================================
# MULTI-IMAGE INFERENCE
# ============================================================

def predict_images(
    images: list[bytes],
) -> list[dict[str, Any]]:
    """
    Run independent inference on multiple uploaded images.

    Each image receives its own prediction.

    We do not combine predictions here because different
    images may show different parts of the crop.
    """

    results = []

    for image_bytes in images:
        results.append(
            predict_image(image_bytes)
        )

    return results


# ============================================================
# MODEL INFORMATION
# ============================================================

def get_model_information() -> dict[str, Any]:
    """
    Return information about the currently loaded model.
    """

    load_model()

    return {
        "model_name": _checkpoint["model_name"],
        "architecture": "EfficientNet-B0",
        "num_classes": _checkpoint["num_classes"],
        "image_size": _checkpoint["image_size"],
        "validation_accuracy": _checkpoint[
            "validation_accuracy"
        ],
        "device": str(DEVICE),
        "class_names": _class_names,
    }
from pathlib import Path
import json

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models


# ============================================================
# CROPGUARD — TEST DATASET EVALUATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "prepared_dataset"
MODEL_DIR = BASE_DIR / "models"

TEST_DIR = DATASET_DIR / "test"
MODEL_PATH = MODEL_DIR / "cropguard_efficientnet_b0.pth"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

IMAGE_SIZE = 224
BATCH_SIZE = 16
NUM_WORKERS = 0

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


print("=" * 70)
print("CROPGUARD — TEST DATASET EVALUATION")
print("=" * 70)

print()
print(f"Device:        {DEVICE}")
print(f"Image size:    {IMAGE_SIZE} x {IMAGE_SIZE}")
print(f"Batch size:    {BATCH_SIZE}")

# ------------------------------------------------------------
# Check required files
# ------------------------------------------------------------

if not TEST_DIR.exists():
    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DIR}"
    )

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found:\n{MODEL_PATH}"
    )

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(
        f"Class names file not found:\n{CLASS_NAMES_PATH}"
    )

# ------------------------------------------------------------
# Load class names
# ------------------------------------------------------------

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

print()
print(f"Classes:       {len(class_names)}")
print(f"Test dataset:  {TEST_DIR}")

# ------------------------------------------------------------
# Test transform
# ------------------------------------------------------------

test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# ------------------------------------------------------------
# Load test dataset
# ------------------------------------------------------------

print()
print("Loading test dataset...")

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=test_transform
)

print(f"Test images:   {len(test_dataset)}")

# Make sure dataset class ordering matches model class ordering
if test_dataset.classes != class_names:
    raise ValueError(
        "Class ordering mismatch between test dataset and class_names.json.\n"
        f"Dataset classes: {test_dataset.classes}\n"
        f"Model classes:   {class_names}"
    )

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS
)

# ------------------------------------------------------------
# Load EfficientNet-B0 architecture
# ------------------------------------------------------------

print()
print("Loading EfficientNet-B0...")

model = models.efficientnet_b0(weights=None)

num_features = model.classifier[1].in_features

model.classifier[1] = nn.Linear(
    num_features,
    len(class_names)
)

# ------------------------------------------------------------
# Load trained weights
# ------------------------------------------------------------

print()
print("Loading trained model:")
print(MODEL_PATH)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model = model.to(DEVICE)
model.eval()

print("Model loaded successfully.")

# ------------------------------------------------------------
# Evaluate
# ------------------------------------------------------------

print()
print("=" * 70)
print("RUNNING TEST EVALUATION")
print("=" * 70)
print()

criterion = nn.CrossEntropyLoss()

total_loss = 0.0
correct = 0
total = 0

with torch.no_grad():

    for batch_index, (images, labels) in enumerate(test_loader, start=1):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(outputs, labels)

        total_loss += loss.item() * images.size(0)

        predictions = torch.argmax(outputs, dim=1)

        correct += (predictions == labels).sum().item()
        total += labels.size(0)

        if batch_index % 50 == 0 or batch_index == len(test_loader):
            accuracy = 100.0 * correct / total

            print(
                f"Batch {batch_index:4d}/{len(test_loader)} "
                f"| Accuracy: {accuracy:.2f}%"
            )

# ------------------------------------------------------------
# Final results
# ------------------------------------------------------------

test_loss = total_loss / total
test_accuracy = 100.0 * correct / total

print()
print("=" * 70)
print("TEST EVALUATION COMPLETE")
print("=" * 70)

print()
print(f"Test images:       {total}")
print(f"Test loss:         {test_loss:.4f}")
print(f"Test accuracy:     {test_accuracy:.2f}%")
print()

print("=" * 70)
print("IMPORTANT")
print("=" * 70)
print()
print(
    "This result is the performance of the trained model on the "
    "held-out test dataset."
)
print(
    "It should not be treated as guaranteed real-world field accuracy."
)
print()
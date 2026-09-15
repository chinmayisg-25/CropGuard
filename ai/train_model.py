from pathlib import Path
import json
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models


# ============================================================
# CROPGUARD — REAL AI MODEL TRAINING
# EfficientNet-B0 Transfer Learning
# Checkpoint + Resume + Progress
# ============================================================

BASE_DIR = Path(r"C:\Users\selen\CropGuard\ai")

DATASET_DIR = BASE_DIR / "prepared_dataset"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_PATH = MODEL_DIR / "cropguard_efficientnet_b0.pth"
CHECKPOINT_PATH = MODEL_DIR / "training_checkpoint.pth"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
HISTORY_PATH = MODEL_DIR / "training_history.json"


# ============================================================
# SETTINGS
# ============================================================

IMAGE_SIZE = 224

BATCH_SIZE = 16

NUM_EPOCHS = 10

LEARNING_RATE = 0.0003

NUM_WORKERS = 0

SEED = 42

# Set to True to continue from an existing checkpoint.
# Set to False to start training from the beginning.
RESUME_TRAINING = True


# ============================================================
# DEVICE
# ============================================================

torch.manual_seed(SEED)

if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 70)
print("CROPGUARD — REAL AI TRAINING")
print("=" * 70)

print()
print(f"Device:        {DEVICE}")
print(f"Image size:    {IMAGE_SIZE} x {IMAGE_SIZE}")
print(f"Batch size:    {BATCH_SIZE}")
print(f"Epochs:        {NUM_EPOCHS}")
print(f"Learning rate: {LEARNING_RATE}")
print(f"Resume:        {RESUME_TRAINING}")


# ============================================================
# CHECK DATASET
# ============================================================

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "val"

if not TRAIN_DIR.exists():
    raise FileNotFoundError(
        f"Training dataset not found:\n{TRAIN_DIR}"
    )

if not VAL_DIR.exists():
    raise FileNotFoundError(
        f"Validation dataset not found:\n{VAL_DIR}"
    )


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

train_transforms = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=15
    ),

    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    ),
])


val_transforms = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    ),
])


# ============================================================
# LOAD DATASETS
# ============================================================

print()
print("Loading datasets...")

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transforms
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transforms
)

class_names = train_dataset.classes

num_classes = len(class_names)

print()
print(f"Training images:   {len(train_dataset)}")
print(f"Validation images: {len(val_dataset)}")
print(f"Classes:            {num_classes}")


if train_dataset.classes != val_dataset.classes:
    raise ValueError(
        "Training and validation classes do not match."
    )


# ============================================================
# SAVE CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        class_names,
        file,
        indent=4
    )

print()
print("Class names saved to:")
print(CLASS_NAMES_PATH)


# ============================================================
# DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=NUM_WORKERS
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=NUM_WORKERS
)


# ============================================================
# CLASS WEIGHTS
# ============================================================

print()
print("Calculating class weights...")

class_counts = torch.zeros(
    num_classes,
    dtype=torch.float32
)

for _, label in train_dataset.samples:
    class_counts[label] += 1


class_weights = (
    class_counts.sum() /
    (num_classes * class_counts)
)

class_weights = class_weights.to(DEVICE)

print()
print("Class weights:")

for index, class_name in enumerate(class_names):

    print(
        f"{class_name:<45}"
        f"{class_counts[index].item():>6.0f} images  "
        f"weight={class_weights[index].item():.3f}"
    )


# ============================================================
# LOAD EFFICIENTNET-B0
# ============================================================

print()
print("Loading EfficientNet-B0...")

weights = models.EfficientNet_B0_Weights.DEFAULT

model = models.efficientnet_b0(
    weights=weights
)


# ============================================================
# REPLACE CLASSIFIER
# ============================================================

input_features = (
    model.classifier[1].in_features
)

model.classifier[1] = nn.Linear(
    input_features,
    num_classes
)

model = model.to(DEVICE)


# ============================================================
# LOSS FUNCTION
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=0.0001
)


# ============================================================
# TRAINING STATE
# ============================================================

start_epoch = 0

best_val_accuracy = 0.0

history = []


# ============================================================
# RESUME CHECKPOINT
# ============================================================

if RESUME_TRAINING and CHECKPOINT_PATH.exists():

    print()
    print("=" * 70)
    print("CHECKPOINT FOUND")
    print("=" * 70)

    print()
    print("Loading checkpoint:")
    print(CHECKPOINT_PATH)

    checkpoint = torch.load(
        CHECKPOINT_PATH,
        map_location=DEVICE
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    optimizer.load_state_dict(
        checkpoint["optimizer_state_dict"]
    )

    start_epoch = checkpoint["epoch"] + 1

    best_val_accuracy = checkpoint.get(
        "best_val_accuracy",
        0.0
    )

    history = checkpoint.get(
        "history",
        []
    )

    print()
    print(
        f"Resuming from epoch "
        f"{start_epoch + 1}/{NUM_EPOCHS}"
    )

    print(
        f"Best validation accuracy so far: "
        f"{best_val_accuracy * 100:.2f}%"
    )

else:

    print()
    print("No training checkpoint found.")

    print()
    print(
        "Starting training from the beginning."
    )


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch(epoch_number):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    total_batches = len(train_loader)

    print()

    for batch_index, (images, labels) in enumerate(
        train_loader,
        start=1
    ):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item() *
            images.size(0)
        )

        predictions = (
            outputs.argmax(dim=1)
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

        # Show progress every 50 batches
        if (
            batch_index % 50 == 0
            or batch_index == total_batches
        ):

            current_loss = (
                running_loss / total
            )

            current_accuracy = (
                correct / total
            )

            print(
                f"Batch "
                f"{batch_index:>4}/{total_batches} | "
                f"Loss: {current_loss:.4f} | "
                f"Accuracy: "
                f"{current_accuracy * 100:.2f}%"
            )

    epoch_loss = (
        running_loss / total
    )

    epoch_accuracy = (
        correct / total
    )

    return epoch_loss, epoch_accuracy


# ============================================================
# VALIDATION FUNCTION
# ============================================================

@torch.no_grad()
def validate():

    model.eval()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in val_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        running_loss += (
            loss.item() *
            images.size(0)
        )

        predictions = (
            outputs.argmax(dim=1)
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = (
        running_loss / total
    )

    epoch_accuracy = (
        correct / total
    )

    return epoch_loss, epoch_accuracy


# ============================================================
# TRAINING LOOP
# ============================================================

print()
print("=" * 70)
print("STARTING TRAINING")
print("=" * 70)

training_start = time.time()


for epoch in range(
    start_epoch,
    NUM_EPOCHS
):

    epoch_start = time.time()

    print()
    print(
        f"Epoch {epoch + 1}/{NUM_EPOCHS}"
    )

    print("-" * 70)

    train_loss, train_accuracy = (
        train_one_epoch(
            epoch + 1
        )
    )

    print()
    print("Running validation...")

    val_loss, val_accuracy = (
        validate()
    )

    epoch_time = (
        time.time() -
        epoch_start
    )

    print()
    print(
        f"Train Loss:          "
        f"{train_loss:.4f}"
    )

    print(
        f"Train Accuracy:      "
        f"{train_accuracy * 100:.2f}%"
    )

    print(
        f"Validation Loss:     "
        f"{val_loss:.4f}"
    )

    print(
        f"Validation Accuracy: "
        f"{val_accuracy * 100:.2f}%"
    )

    print(
        f"Epoch Time:          "
        f"{epoch_time / 60:.2f} minutes"
    )

    history.append({
        "epoch": epoch + 1,
        "train_loss": train_loss,
        "train_accuracy": train_accuracy,
        "val_loss": val_loss,
        "val_accuracy": val_accuracy,
        "epoch_time_seconds": epoch_time
    })


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "class_names":
                    class_names,

                "num_classes":
                    num_classes,

                "image_size":
                    IMAGE_SIZE,

                "model_name":
                    "efficientnet_b0",

                "validation_accuracy":
                    val_accuracy
            },
            MODEL_PATH
        )

        print()
        print(
            "✓ BEST MODEL SAVED"
        )

        print(
            f"Validation accuracy: "
            f"{val_accuracy * 100:.2f}%"
        )


    # ========================================================
    # SAVE CHECKPOINT
    # ========================================================

    torch.save(
        {
            "epoch": epoch,

            "model_state_dict":
                model.state_dict(),

            "optimizer_state_dict":
                optimizer.state_dict(),

            "best_val_accuracy":
                best_val_accuracy,

            "history":
                history,

            "class_names":
                class_names,

            "num_classes":
                num_classes,

            "image_size":
                IMAGE_SIZE,

            "model_name":
                "efficientnet_b0"
        },
        CHECKPOINT_PATH
    )

    print()
    print(
        "✓ CHECKPOINT SAVED"
    )

    print(
        CHECKPOINT_PATH
    )


    # ========================================================
    # SAVE TRAINING HISTORY
    # ========================================================

    with open(
        HISTORY_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            history,
            file,
            indent=4
        )

    print()
    print(
        "✓ TRAINING HISTORY SAVED"
    )


# ============================================================
# FINAL MESSAGE
# ============================================================

total_training_time = (
    time.time() -
    training_start
)

print()
print("=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print()

print(
    f"Best validation accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

print()

print("Best model:")
print(MODEL_PATH)

print()

print("Checkpoint:")
print(CHECKPOINT_PATH)

print()

print("Class names:")
print(CLASS_NAMES_PATH)

print()

print("Training history:")
print(HISTORY_PATH)

print()

print(
    f"Total training time: "
    f"{total_training_time / 60:.2f} minutes"
)

print()
print("=" * 70)
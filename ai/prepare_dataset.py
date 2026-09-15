from pathlib import Path
import hashlib
import random
import shutil


# ============================================================
# CROPGUARD DATASET PREPARATION
# ============================================================

PLANTVILLAGE = Path(
    r"C:\Users\selen\Downloads\PlantVillage-Dataset-master"
    r"\PlantVillage-Dataset-master\raw\color"
)

FIVE_CROP = Path(
    r"C:\Users\selen\Downloads\archive\Crop Diseases Dataset"
    r"\Crop Diseases\Crop___Disease"
)

OUTPUT = Path(
    r"C:\Users\selen\CropGuard\ai\prepared_dataset"
)

SEED = 42

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}


# ============================================================
# PLANTVILLAGE → CROPGUARD CLASS MAPPING
# ============================================================

PLANTVILLAGE_CLASSES = {
    "Corn___Common_Rust": PLANTVILLAGE / "Corn_(maize)___Common_rust_",
    "Corn___Gray_Leaf_Spot": PLANTVILLAGE / "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn___Healthy": PLANTVILLAGE / "Corn_(maize)___healthy",
    "Corn___Northern_Leaf_Blight": PLANTVILLAGE / "Corn_(maize)___Northern_Leaf_Blight",

    "Potato___Early_Blight": PLANTVILLAGE / "Potato___Early_blight",
    "Potato___Healthy": PLANTVILLAGE / "Potato___healthy",
    "Potato___Late_Blight": PLANTVILLAGE / "Potato___Late_blight",

    "Tomato___Bacterial_Spot": PLANTVILLAGE / "Tomato___Bacterial_spot",
    "Tomato___Early_Blight": PLANTVILLAGE / "Tomato___Early_blight",
    "Tomato___Healthy": PLANTVILLAGE / "Tomato___healthy",
    "Tomato___Late_Blight": PLANTVILLAGE / "Tomato___Late_blight",
    "Tomato___Leaf_Mold": PLANTVILLAGE / "Tomato___Leaf_Mold",
    "Tomato___Septoria_Leaf_Spot": PLANTVILLAGE / "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_Mites": PLANTVILLAGE / "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot": PLANTVILLAGE / "Tomato___Target_Spot",
    "Tomato___Tomato_Mosaic_Virus": PLANTVILLAGE / "Tomato___Tomato_mosaic_virus",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": PLANTVILLAGE / "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
}


# ============================================================
# FIVE CROP DISEASE DATASET
# ============================================================

FIVE_CROP_CLASSES = {
    "Rice___Brown_Spot":
        FIVE_CROP / "Rice" / "Rice___Brown_Spot",

    "Rice___Healthy":
        FIVE_CROP / "Rice" / "Rice___Healthy",

    "Rice___Leaf_Blast":
        FIVE_CROP / "Rice" / "Rice___Leaf_Blast",

    "Rice___Neck_Blast":
        FIVE_CROP / "Rice" / "Rice___Neck_Blast",

    "Wheat___Brown_Rust":
        FIVE_CROP / "Wheat" / "Wheat___Brown_Rust",

    "Wheat___Healthy":
        FIVE_CROP / "Wheat" / "Wheat___Healthy",

    "Wheat___Yellow_Rust":
        FIVE_CROP / "Wheat" / "Wheat___Yellow_Rust",

    "Sugarcane___Bacterial_Blight":
        FIVE_CROP / "sugarcane" / "Bacterial Blight",

    "Sugarcane___Healthy":
        FIVE_CROP / "sugarcane" / "Healthy",

    "Sugarcane___Red_Rot":
        FIVE_CROP / "sugarcane" / "Red Rot",
}


# ============================================================
# FUNCTIONS
# ============================================================

def get_images(folder):
    """Return supported image files from a folder."""

    if not folder.exists():
        raise FileNotFoundError(
            f"Dataset folder not found:\n{folder}"
        )

    return sorted(
        [
            path
            for path in folder.rglob("*")
            if path.is_file()
            and path.suffix.lower() in IMAGE_EXTENSIONS
        ]
    )


def file_hash(path):
    """Calculate SHA-256 hash of an image."""

    hasher = hashlib.sha256()

    with open(path, "rb") as file:
        while True:
            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            hasher.update(chunk)

    return hasher.hexdigest()


def remove_exact_duplicates(images):
    """
    Remove exact duplicate images from a class.

    Two files are considered duplicates when their
    SHA-256 hashes are identical.
    """

    unique_images = []
    seen_hashes = set()
    duplicate_count = 0

    for image in images:

        image_hash = file_hash(image)

        if image_hash in seen_hashes:
            duplicate_count += 1
            continue

        seen_hashes.add(image_hash)
        unique_images.append(image)

    return unique_images, duplicate_count


def split_images(images):
    """
    Split images into:
    70% train
    15% validation
    15% test
    """

    images = list(images)

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)

    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]

    val_images = images[train_end:val_end]

    test_images = images[val_end:]

    return train_images, val_images, test_images


def copy_images(images, destination):
    """Copy images into destination folder."""

    destination.mkdir(
        parents=True,
        exist_ok=True
    )

    for image in images:

        destination_file = destination / image.name

        shutil.copy2(
            image,
            destination_file
        )


# ============================================================
# START
# ============================================================

print()
print("=" * 70)
print("CROPGUARD — CLEAN DATASET PREPARATION")
print("=" * 70)


# ============================================================
# CHECK SOURCE DATASETS
# ============================================================

print()
print("Checking source datasets...")

if not PLANTVILLAGE.exists():
    raise FileNotFoundError(
        f"PlantVillage folder not found:\n{PLANTVILLAGE}"
    )

if not FIVE_CROP.exists():
    raise FileNotFoundError(
        f"Five Crop Diseases folder not found:\n{FIVE_CROP}"
    )

print("Source datasets found.")


# ============================================================
# CHECK PLANTVILLAGE CLASSES
# ============================================================

print()
print("=" * 70)
print("CHECKING PLANTVILLAGE CLASSES")
print("=" * 70)

for class_name, source_folder in PLANTVILLAGE_CLASSES.items():

    print(f"{class_name:<42}", end="")

    if not source_folder.exists():

        print("NOT FOUND")

        raise FileNotFoundError(
            f"\nPlantVillage class folder not found:\n"
            f"{source_folder}"
        )

    image_count = len(get_images(source_folder))

    print(f"{image_count} images")


# ============================================================
# CHECK FIVE CROP CLASSES
# ============================================================

print()
print("=" * 70)
print("CHECKING FIVE CROP DISEASE CLASSES")
print("=" * 70)

for class_name, source_folder in FIVE_CROP_CLASSES.items():

    print(f"{class_name:<42}", end="")

    if not source_folder.exists():

        print("NOT FOUND")

        raise FileNotFoundError(
            f"\nFive Crop class folder not found:\n"
            f"{source_folder}"
        )

    image_count = len(get_images(source_folder))

    print(f"{image_count} images")


# ============================================================
# REMOVE OLD PREPARED DATASET
# ============================================================

if OUTPUT.exists():

    print()
    print("Removing previous prepared dataset...")

    shutil.rmtree(OUTPUT)

    print("Previous dataset removed.")


for split in ["train", "val", "test"]:

    (OUTPUT / split).mkdir(
        parents=True,
        exist_ok=True
    )


# ============================================================
# COMBINE CLASS SOURCES
# ============================================================

class_sources = {}

class_sources.update(
    PLANTVILLAGE_CLASSES
)

class_sources.update(
    FIVE_CROP_CLASSES
)


print()
print("=" * 70)
print("PREPARING DATASET")
print("=" * 70)

print(f"Total classes: {len(class_sources)}")


# ============================================================
# PROCESS CLASSES
# ============================================================

random.seed(SEED)

grand_total = 0
grand_train = 0
grand_val = 0
grand_test = 0
grand_duplicates = 0


for class_name in sorted(class_sources):

    source_folder = class_sources[class_name]

    print()
    print("-" * 70)
    print(class_name)
    print("-" * 70)

    images = get_images(source_folder)

    print(
        f"Original images:           {len(images)}"
    )

    unique_images, duplicates = (
        remove_exact_duplicates(images)
    )

    print(
        f"Exact duplicates removed:  {duplicates}"
    )

    if len(unique_images) < 3:

        raise ValueError(
            f"Not enough unique images for:\n{class_name}"
        )

    train_images, val_images, test_images = (
        split_images(unique_images)
    )

    print(
        f"Train:                     {len(train_images)}"
    )

    print(
        f"Validation:                {len(val_images)}"
    )

    print(
        f"Test:                      {len(test_images)}"
    )

    copy_images(
        train_images,
        OUTPUT / "train" / class_name
    )

    copy_images(
        val_images,
        OUTPUT / "val" / class_name
    )

    copy_images(
        test_images,
        OUTPUT / "test" / class_name
    )

    grand_total += len(unique_images)

    grand_train += len(train_images)

    grand_val += len(val_images)

    grand_test += len(test_images)

    grand_duplicates += duplicates


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 70)
print("DATASET PREPARATION COMPLETE")
print("=" * 70)

print(
    f"Total classes:              {len(class_sources)}"
)

print(
    f"Exact duplicates removed:   {grand_duplicates}"
)

print(
    f"Unique images:               {grand_total}"
)

print(
    f"Train images:                {grand_train}"
)

print(
    f"Validation images:           {grand_val}"
)

print(
    f"Test images:                 {grand_test}"
)

print()
print("Output:")
print(OUTPUT)

print()
print("=" * 70)
print("NEXT STEP")
print("=" * 70)

print("Run:")
print("python check_dataset.py")

print()
print("Then:")
print("python check_duplicates.py")

print("=" * 70)
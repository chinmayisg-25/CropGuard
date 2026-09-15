from pathlib import Path
from PIL import Image

# ============================================================
# CROPGUARD — DATASET QUALITY CHECK
# ============================================================

DATASET = Path(r"C:\Users\selen\CropGuard\ai\prepared_dataset")

SPLITS = ["train", "val", "test"]

print()
print("=" * 70)
print("CROPGUARD — DATASET QUALITY CHECK")
print("=" * 70)

if not DATASET.exists():
    raise FileNotFoundError(
        f"Prepared dataset not found:\n{DATASET}"
    )

total_images = 0
total_bad = 0
total_classes = set()

for split in SPLITS:

    split_path = DATASET / split

    print()
    print("=" * 70)
    print(f"{split.upper()} DATA")
    print("=" * 70)

    if not split_path.exists():
        print(f"WARNING: {split_path} does not exist")
        continue

    split_images = 0
    split_bad = 0

    class_folders = [
        folder for folder in split_path.iterdir()
        if folder.is_dir()
    ]

    print(f"Classes: {len(class_folders)}")

    for class_folder in sorted(class_folders):

        total_classes.add(class_folder.name)

        images = [
            file for file in class_folder.iterdir()
            if file.is_file()
        ]

        class_bad = 0

        for image_path in images:

            try:
                with Image.open(image_path) as image:
                    image.verify()

            except Exception:
                class_bad += 1
                total_bad += 1

                print(
                    f"  BAD IMAGE: {image_path}"
                )

        valid_count = len(images) - class_bad

        split_images += valid_count

        print(
            f"{class_folder.name:<42}"
            f"{valid_count:>6} valid"
        )

        if class_bad > 0:
            print(
                f"  WARNING: {class_bad} corrupted/unreadable"
            )

    total_images += split_images
    split_bad += 0

    print()
    print(f"{split.capitalize()} valid images: {split_images}")

print()
print("=" * 70)
print("QUALITY CHECK SUMMARY")
print("=" * 70)

print(f"Total classes:          {len(total_classes)}")
print(f"Total valid images:     {total_images}")
print(f"Corrupted/unreadable:   {total_bad}")

if total_bad == 0:
    print()
    print("RESULT: DATASET PASSED BASIC FILE-INTEGRITY CHECK")
else:
    print()
    print("RESULT: DATASET HAS INVALID FILES")
    print("Those files must be removed before training.")

print()
print("=" * 70)
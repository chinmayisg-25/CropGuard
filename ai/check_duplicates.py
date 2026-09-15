from pathlib import Path
import hashlib

DATASET = Path(r"C:\Users\selen\CropGuard\ai\prepared_dataset")
SPLITS = ["train", "val", "test"]

print()
print("=" * 70)
print("CROPGUARD — TRAIN / VAL / TEST DUPLICATE CHECK")
print("=" * 70)

hashes = {}
total_files = 0
duplicate_count = 0

for split in SPLITS:
    split_path = DATASET / split

    print()
    print(f"Checking {split.upper()}...")

    for class_folder in sorted(split_path.iterdir()):
        if not class_folder.is_dir():
            continue

        for image_path in class_folder.iterdir():
            if not image_path.is_file():
                continue

            total_files += 1

            hasher = hashlib.sha256()

            with open(image_path, "rb") as file:
                while True:
                    chunk = file.read(1024 * 1024)

                    if not chunk:
                        break

                    hasher.update(chunk)

            file_hash = hasher.hexdigest()

            if file_hash in hashes:
                duplicate_count += 1

                previous = hashes[file_hash]

                print()
                print("DUPLICATE FOUND:")
                print(f"  File 1: {previous}")
                print(f"  File 2: {image_path}")
            else:
                hashes[file_hash] = image_path

print()
print("=" * 70)
print("DUPLICATE CHECK SUMMARY")
print("=" * 70)

print(f"Total files checked: {total_files}")
print(f"Duplicate files:     {duplicate_count}")

if duplicate_count == 0:
    print()
    print("RESULT: NO EXACT DUPLICATES FOUND")
    print("Train / validation / test split is clean for exact duplicates.")
else:
    print()
    print("RESULT: DUPLICATES FOUND")
    print("Do NOT start training yet.")
    print("We need to inspect the duplicate files first.")

print()
print("=" * 70)
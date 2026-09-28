import os
import shutil
import subprocess

scratch_dir = r"C:\Users\USER\.gemini\antigravity\brain\670290c3-bbd6-444f-b659-5d2a6590eb1b\scratch"
clone_dir = os.path.join(scratch_dir, "SoulShuffleClone")
source_dir = r"C:\My_Project\EleVora\app\SoulShuffle"

if os.path.exists(clone_dir):
    shutil.rmtree(clone_dir, ignore_errors=True)

# Clone
subprocess.run(["git", "clone", "https://github.com/priyanshusharma99/SoulShuffle.git", "SoulShuffleClone"], cwd=scratch_dir, check=True)

# Copy everything
for root, dirs, files in os.walk(source_dir):
    # Exclude node_modules and .git
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if ".git" in dirs:
        dirs.remove(".git")
        
    for name in files:
        src_path = os.path.join(root, name)
        # Calculate relative path
        rel_path = os.path.relpath(src_path, source_dir)
        dest_path = os.path.join(clone_dir, rel_path)
        
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(src_path, dest_path)

# Add, commit, push
subprocess.run(["git", "add", "."], cwd=clone_dir, check=True)
subprocess.run(["git", "commit", "-m", "Update UI from local"], cwd=clone_dir)
subprocess.run(["git", "push", "origin", "main"], cwd=clone_dir, check=True)
print("Pushed successfully!")

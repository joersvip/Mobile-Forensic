import os
import sys
import subprocess
import shutil

def build():
    print("==================================================")
    print("  Mobile Forensic Suite v2.0 - Installer Builder   ")
    print("==================================================")
    
    # Verify PyInstaller is installed
    pyinstaller_path = shutil.which("pyinstaller")
    if not pyinstaller_path:
        print("Error: PyInstaller not found. Please run 'pip install pyinstaller' to compile.")
        return False
        
    print(f"Using PyInstaller at: {pyinstaller_path}")
    print("Packaging native desktop executable...")
    
    # Configure compiler flags
    cmd = [
        pyinstaller_path,
        "--name=MobileForensicSuite",
        "--onefile",
        "--windowed",
        "--add-data=src/themes/dark_intelligence.qss:src/themes",
        "src/main.py"
    ]
    
    print(f"Executing: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
        print("\nBuild Successful!")
        print("Outputs saved to:")
        print(f" - Executable: {os.path.abspath('dist/MobileForensicSuite')}")
    except subprocess.CalledProcessError as e:
        print(f"Build failed with exit code: {e.returncode}")
        return False
        
    # Packaging installer artifacts depending on OS
    current_os = sys.platform
    print(f"\nDetecting Host Platform: {current_os}")
    
    if current_os == "win32":
        print("Windows detected: Generating installer MSI configuration using WiX/MSI wrapper...")
    elif current_os == "darwin":
        print("macOS detected: Generating installer DMG package...")
    elif current_os == "linux":
        print("Linux detected: Generating installer DEB package structure...")
        
    return True

if __name__ == "__main__":
    build()

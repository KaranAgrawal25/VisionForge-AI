#!/usr/bin/env python3


import inspect
import sys

print("=" * 80)
print("🔍 VideoGPT Diagnostic Check")
print("=" * 80)

try:
    print("\n1️⃣ Attempting to import video_engine...")
    import video_engine
    print("✅ video_engine imported successfully")
    
    print("\n2️⃣ Checking build_video_from_user_images function...")
    func = video_engine.build_video_from_user_images
    print(f"✅ Function found: {func}")
    
    print("\n3️⃣ Inspecting function signature...")
    sig = inspect.signature(func)
    print(f"   Signature: {sig}")
    
    print("\n4️⃣ Function parameters:")
    for param_name, param in sig.parameters.items():
        default = param.default
        if default == inspect.Parameter.empty:
            print(f"   - {param_name} (required)")
        else:
            print(f"   - {param_name} (default: {repr(default)})")
    
    print("\n5️⃣ Testing function call with keyword arguments...")
    try:
        # This will fail but we just want to see the error
        video_engine.build_video_from_user_images(
            image_folder="test",
            style="cinematic", 
            title="Test Title"
        )
    except FileNotFoundError as e:
        print(f"✅ Function accepts keyword arguments (got expected FileNotFoundError)")
    except TypeError as e:
        print(f"❌ Function does NOT accept keyword arguments")
        print(f"   Error: {e}")
        
    print("\n6️⃣ Module file location:")
    print(f"   {video_engine.__file__}")
    
    print("\n" + "=" * 80)
    print("✅ Diagnostic Complete!")
    print("=" * 80)
    
except ImportError as e:
    print(f"❌ Failed to import video_engine: {e}")
    sys.exit(1)
except AttributeError as e:
    print(f"❌ Function not found: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

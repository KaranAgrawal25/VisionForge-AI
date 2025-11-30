"""
FastAPI Backend for VideoGPT
Handles video generation requests
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
import json
from pathlib import Path
import subprocess
import threading
from typing import List
import traceback

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Job status storage (in production, use Redis or database)
jobs = {}

@app.get("/")
def read_root():
    return {"status": "VideoGPT API Running", "version": "2.0"}

@app.post("/api/generate")
async def generate_prompts(data: dict):
    """Generate scene prompts using AI"""
    try:
        title = data.get("title", "")
        style = data.get("style", "cinematic")
        
        if not title:
            raise HTTPException(status_code=400, detail="Title is required")
        
        # Import here to avoid circular imports
        from video_engine import generate_scenes_from_title
        
        scenes = generate_scenes_from_title(title, style)
        
        return {"success": True, "scenes": scenes}
    
    except Exception as e:
        print(f"Error in /api/generate: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload media files (images/videos)"""
    try:
        upload_id = str(uuid.uuid4())
        upload_path = UPLOAD_DIR / upload_id
        upload_path.mkdir(exist_ok=True)
        
        print(f"\n📤 Uploading {len(files)} files to {upload_path}")
        
        for idx, file in enumerate(files):
            # Save file
            file_location = upload_path / file.filename
            with open(file_location, "wb") as f:
                content = await file.read()
                f.write(content)
            
            print(f"   ✓ Saved: {file.filename} ({len(content)} bytes)")
        
        return {
            "success": True,
            "upload_id": upload_id,
            "files_count": len(files)
        }
    
    except Exception as e:
        print(f"Error in /api/upload: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/build")
async def build_video(
    upload_id: str = Form(...),
    title: str = Form(...),
    style: str = Form(...)
):
    """Start video build process"""
    try:
        job_id = str(uuid.uuid4())
        upload_path = UPLOAD_DIR / upload_id
        output_path = OUTPUT_DIR / job_id
        output_path.mkdir(exist_ok=True)
        
        print(f"\n🎬 Starting build job: {job_id}")
        print(f"   Upload ID: {upload_id}")
        print(f"   Title: {title}")
        print(f"   Style: {style}")
        
        # Check if upload exists
        if not upload_path.exists():
            raise HTTPException(status_code=404, detail=f"Upload {upload_id} not found")
        
        # Initialize job status
        jobs[job_id] = {
            "status": "queued",
            "progress": 0,
            "status_message": "Job queued",
            "error": None
        }
        
        # Create images_user folder and copy files
        images_user_path = Path("images_user")
        if images_user_path.exists():
            shutil.rmtree(images_user_path)
        images_user_path.mkdir(exist_ok=True)
        
        # Copy uploaded files to images_user
        for file in upload_path.glob("*"):
            shutil.copy(file, images_user_path / file.name)
            print(f"   ✓ Copied: {file.name}")
        
        # Start build in background thread
        def build_thread():
            try:
                print(f"\n{'='*80}")
                print(f"🎬 BUILD THREAD STARTED - Job {job_id}")
                print(f"{'='*80}\n")
                
                jobs[job_id]["status"] = "building"
                jobs[job_id]["progress"] = 10
                jobs[job_id]["status_message"] = "Analyzing content..."
                
                print("📦 Step 1: Importing video_engine module...")
                # Force reload the module to get latest version
                import importlib
                import sys
                
                # Remove cached module if it exists
                if 'video_engine' in sys.modules:
                    del sys.modules['video_engine']
                
                # Import fresh version
                from video_engine import build_video_from_user_images
                print("✓ Module imported successfully (fresh reload)\n")
                
                jobs[job_id]["progress"] = 30
                jobs[job_id]["status_message"] = "Generating voiceovers..."
                
                print("🎬 Step 2: Starting video build...")
                print(f"   Images folder: {images_user_path}")
                print(f"   Style: {style}")
                print(f"   Title: {title}\n")
                
                # Call with explicit keyword arguments to avoid any confusion
                output_video = build_video_from_user_images(
                    image_folder=str(images_user_path),
                    style=style,
                    title=title
                )
                
                print(f"\n✓ Video build completed!")
                print(f"   Output file: {output_video}\n")
                
                jobs[job_id]["progress"] = 90
                jobs[job_id]["status_message"] = "Finalizing video..."
                
                # Move output video to job output folder
                print("📦 Step 3: Moving output file...")
                final_output = output_path / "final_video.mp4"
                if os.path.exists(output_video):
                    shutil.move(output_video, final_output)
                    print(f"✓ Video saved: {final_output}\n")
                else:
                    raise Exception(f"Output video not found: {output_video}")
                
                jobs[job_id]["status"] = "done"
                jobs[job_id]["progress"] = 100
                jobs[job_id]["status_message"] = "Complete!"
                jobs[job_id]["output_file"] = str(final_output)
                
                print(f"\n{'='*80}")
                print(f"✅ JOB {job_id} COMPLETED SUCCESSFULLY!")
                print(f"{'='*80}\n")
                
            except Exception as e:
                error_msg = str(e)
                print(f"\n{'='*80}")
                print(f"❌ JOB {job_id} FAILED")
                print(f"{'='*80}")
                print(f"Error: {error_msg}\n")
                print("Full traceback:")
                traceback.print_exc()
                print(f"\n{'='*80}\n")
                
                jobs[job_id]["status"] = "error"
                jobs[job_id]["error"] = error_msg
                jobs[job_id]["status_message"] = f"Error: {error_msg}"
        
        # Start background thread
        thread = threading.Thread(target=build_thread, daemon=True)
        thread.start()
        
        return {
            "success": True,
            "job_id": job_id,
            "message": "Build started"
        }
    
    except Exception as e:
        print(f"Error in /api/build: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    """Get job status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs[job_id]

@app.get("/api/video/{job_id}")
async def get_video(job_id: str):
    """Download completed video"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if jobs[job_id]["status"] != "done":
        raise HTTPException(status_code=400, detail="Video not ready")
    
    output_file = jobs[job_id].get("output_file")
    if not output_file or not os.path.exists(output_file):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        output_file,
        media_type="video/mp4",
        filename="video.mp4"
    )

@app.delete("/api/job/{job_id}")
async def delete_job(job_id: str):
    """Clean up job files"""
    if job_id in jobs:
        output_path = OUTPUT_DIR / job_id
        if output_path.exists():
            shutil.rmtree(output_path)
        del jobs[job_id]
        return {"success": True, "message": "Job deleted"}
    
    raise HTTPException(status_code=404, detail="Job not found")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 VideoGPT API Server Starting...")
    print("="*60)
    print("\n📍 API will be available at: http://localhost:8000")
    print("📖 API docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
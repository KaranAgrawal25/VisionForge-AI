"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiPlay, FiCheckCircle, FiCopy, FiZap, FiFilm, FiImage, FiDownload, FiX, FiVideo } from "react-icons/fi";



const API_ROOT = process.env.NEXT_PUBLIC_API_ROOT || "http://localhost:8000";

type Scene = { narration: string; image_prompt: string };

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Helper function to check if file is video
function isVideoFile(filename: string): boolean {
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  return videoExts.some(ext => filename.toLowerCase().endsWith(ext));
}

export default function Page() {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [styleChoice, setStyleChoice] = useState<string>("cinematic");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [btnLoading, setBtnLoading] = useState<{[k:string]:boolean}>({});
  const [copied, setCopied] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const id = setInterval(async () => {
      try {
        const res = await axios.get(`${API_ROOT}/api/status/${jobId}`);
        setStatus(res.data);
        if (res.data.status === "done" || res.data.status === "error") clearInterval(id);
      } catch {
        clearInterval(id);
      }
    }, 1500);
    return () => clearInterval(id);
  }, [jobId]);

  function setLoading(key:string, v:boolean){
    setBtnLoading(prev => ({ ...prev, [key]: v }));
  }

  async function generatePrompts(){
    if (!title.trim()) return alert("Enter a title");
    setLoading("generate", true);
    try {
      const res = await fetch(`${API_ROOT}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, style: styleChoice })
      });
      const data = await res.json();
      setScenes(data.scenes || []);
      setStep(2);
    } catch (e:any) {
      alert("Generate failed: " + e.message);
    } finally { setLoading("generate", false); }
  }

  function onDropFiles(list: FileList | null){
    if (!list) return;
    setFiles(prev => [...prev, ...Array.from(list)]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>){
    if (!e.target.files) return;
    onDropFiles(e.target.files);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadFiles(){
    if (!files.length) return alert("Select files");
    setLoading("upload", true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const res = await fetch(`${API_ROOT}/api/upload`, { method: "POST", body: fd });
      const data = await res.json();
      setUploadId(data.upload_id);
      setStep(3);
    } catch (e:any) {
      alert("Upload failed: " + e.message);
    } finally { setLoading("upload", false); }
  }

  async function startBuild(){
    if (!uploadId) return alert("Upload first");
    setLoading("build", true);
    try {
      const fd = new FormData();
      fd.append("upload_id", uploadId);
      fd.append("title", title);
      fd.append("style", styleChoice);
      const res = await fetch(`${API_ROOT}/api/build`, { method: "POST", body: fd });
      const data = await res.json();
      if (!data.job_id) { alert("No job_id returned"); console.log(data); return; }
      setJobId(data.job_id);
      setStep(4);
    } catch (e:any){
      alert("Build failed: " + e.message);
    } finally { setLoading("build", false); }
  }

  function copyPrompt(index: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      style={{display:"grid", gap: 24}}
    >
      {/* HERO SECTION - Title Input */}
      <motion.div variants={cardVariants} className="card">
        <div style={{display:"grid", gridTemplateColumns: "1fr 400px", gap: 24}}>
          <div>
            <div className="kicker">
              <FiZap style={{display: "inline", marginRight: 6}} />
              START HERE
            </div>
            
            <input
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              placeholder="Type a cinematic title — e.g. 'Midnight Decisions'"
              className="glass"
              style={{
                width:"100%", 
                padding:"18px 20px", 
                fontSize: 18, 
                fontWeight: 600,
                borderRadius: 14, 
                border:"1px solid rgba(255,255,255,0.08)",
                marginBottom: 16
              }}
            />
            
            <div style={{display:"flex", gap: 14, alignItems:"center", flexWrap: "wrap"}}>
              <select 
                value={styleChoice} 
                onChange={(e)=>setStyleChoice(e.target.value)} 
                className="btn btn-ghost"
                style={{minWidth: 140}}
              >
                <option value="cinematic">🎬 Cinematic</option>
                <option value="futuristic">🚀 Futuristic</option>
                <option value="anime">🎌 Anime</option>
                <option value="pixar">🎨 Pixar</option>
              </select>

              <button
                className={`btn btn-primary ${btnLoading["generate"] ? "loading" : ""}`}
                onClick={generatePrompts}
                disabled={!!btnLoading["generate"]}
              >
                <FiPlay /> Generate Prompts
                <span className="dot" />
              </button>

              <div className="small-muted" style={{display: "flex", alignItems: "center", gap: 6}}>
                <FiFilm size={14} />
                Keep title short & cinematic
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="card" style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.05), rgba(6,182,212,0.03))",
            border: "1px solid rgba(167,139,250,0.2)"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 14}}>
              <div className="h2" style={{display: "flex", alignItems: "center", gap: 8}}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: scenes[0] ? "#10b981" : "#6b7280",
                  boxShadow: scenes[0] ? "0 0 12px #10b981" : "none"
                }} />
                Live Preview
              </div>
              <div className="small-muted">Auto</div>
            </div>

            {scenes[0] ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={scenes[0].narration}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="small-muted" style={{marginBottom: 8}}>Narration</div>
                  <div style={{
                    fontWeight: 600, 
                    marginBottom: 12,
                    fontSize: "0.95rem",
                    lineHeight: 1.6
                  }}>{scenes[0].narration}</div>
                  
                  <div className="small-muted" style={{marginBottom: 6}}>Image Prompt</div>
                  <div className="prompt-pre" style={{fontSize: "0.85rem"}}>
                    {scenes[0].image_prompt}
                  </div>
                  
                  <button 
                    className="btn btn-ghost" 
                    onClick={()=>copyPrompt(0, scenes[0].image_prompt)}
                    style={{marginTop: 10, width: "100%", justifyContent: "center"}}
                  >
                    {copied === 0 ? <FiCheckCircle /> : <FiCopy />}
                    {copied === 0 ? "Copied!" : "Copy Prompt"}
                  </button>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div style={{
                textAlign: "center", 
                padding: "40px 20px",
                color: "var(--muted)"
              }}>
                <FiImage size={32} style={{opacity: 0.3, marginBottom: 12}} />
                <div className="small-muted">
                  Generate prompts to preview your first scene
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* SCENES SECTION - Condensed */}
      <AnimatePresence>
        {scenes.length > 0 && (
          <motion.div 
            variants={cardVariants}
            className="card"
          >
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20}}>
              <div>
                <div className="h2" style={{marginBottom: 6}}>
                  📝 {scenes.length} Scenes Generated
                </div>
                <div className="small-muted">
                  Review scenes • Copy prompts • Continue when ready
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={()=>setStep(2)}
              >
                <FiPlay /> Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD SECTION */}
      <motion.div variants={cardVariants} className="card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20}}>
          <div>
            <div className="h2" style={{marginBottom: 6, display: "flex", alignItems: "center", gap: 8}}>
              <FiUpload size={20} />
              Upload Media ({files.length} files)
            </div>
            <div className="small-muted">
              📷 Images & 🎥 Videos supported • Order: scene_0, scene_1, scene_2...
            </div>
          </div>
          <div style={{display:"flex", gap: 10}}>
            {files.length > 0 && (
              <button 
                className="btn btn-ghost" 
                onClick={()=>{ setFiles([]); setUploadId(null); }}
              >
                <FiX /> Clear
              </button>
            )}
            <button
              className={`btn btn-primary ${btnLoading["upload"] ? "loading" : ""}`}
              onClick={uploadFiles}
              disabled={!!btnLoading["upload"] || files.length === 0}
            >
              <FiUpload/> Upload ({files.length})
              <span className="dot" />
            </button>
          </div>
        </div>

        <div
          className={`dropzone ${isDragging ? "dragover" : ""}`}
          onDragOver={(e)=>{ e.preventDefault(); setIsDragging(true); }}
          onDragLeave={()=>setIsDragging(false)}
          onDrop={(e)=>{ e.preventDefault(); setIsDragging(false); onDropFiles(e.dataTransfer.files); }}
          onClick={()=>inputRef.current?.click()}
        >
          <div style={{textAlign:"center", zIndex: 1}}>
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{display: "flex", gap: 20, justifyContent: "center", marginBottom: 16}}>
                <FiImage size={40} style={{opacity: 0.4}} />
                <FiVideo size={40} style={{opacity: 0.4}} />
              </div>
              <div style={{fontWeight: 700, marginBottom: 8, fontSize: "1.05rem"}}>
                {isDragging ? "Drop files here" : "Drag & drop images/videos"}
              </div>
              <div className="small-muted" style={{marginBottom: 14}}>
                JPG, PNG, MP4, MOV, WEBM • Mix and match as needed
              </div>
              <button className="btn btn-ghost" style={{pointerEvents: "none"}}>
                Select Files
              </button>
            </motion.div>
          </div>
          <input 
            ref={inputRef} 
            type="file" 
            multiple 
            accept="image/*,video/*,.mp4,.mov,.avi,.mkv,.webm"
            onChange={handleFileSelect} 
            style={{display:"none"}}
          />
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="thumb-grid"
            >
              {files.map((f,i)=>{
                const isVideo = isVideoFile(f.name);
                return (
                  <motion.div 
                    key={i} 
                    className="thumb"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div style={{
                      display:"flex", 
                      justifyContent:"space-between", 
                      alignItems:"center",
                      marginBottom: 8
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 600, 
                        fontSize: "0.85rem"
                      }}>
                        {isVideo ? <FiVideo size={14} /> : <FiImage size={14} />}
                        {f.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontSize: "0.75rem"
                        }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                    <div className="small-muted" style={{marginBottom: 8}}>
                      {Math.round(f.size/1024)} KB • {isVideo ? "Video" : "Image"}
                    </div>
                    
                    {isVideo ? (
                      <video 
                        src={URL.createObjectURL(f)} 
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                          background: "#000"
                        }}
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                    ) : (
                      <img 
                        src={URL.createObjectURL(f)} 
                        alt={f.name}
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* BUILD & RENDER SECTION */}
      <motion.div variants={cardVariants} className="card">
        <div style={{display:"grid", gridTemplateColumns: "1fr 460px", gap: 24}}>
          <div>
            <div className="h2" style={{marginBottom: 6}}>🎬 Build & Render</div>
            <div className="small-muted" style={{marginBottom: 20}}>
              Start the render and monitor progress in real-time
            </div>

            <div style={{display:"flex", gap: 12, marginBottom: 24, flexWrap: "wrap"}}>
              <button
                className={`btn btn-primary ${btnLoading["build"] ? "loading" : ""}`}
                onClick={startBuild}
                disabled={!!btnLoading["build"] || !uploadId}
              >
                <FiPlay/> Start Build
                <span className="dot" />
              </button>

              <button 
                className="btn btn-ghost" 
                onClick={()=>setStep(2)}
              >
                Back to Upload
              </button>
            </div>

            {/* Status Display */}
            <div style={{
              padding: 18,
              background: "rgba(0,0,0,0.3)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
              }}>
                <div className="small-muted">Status</div>
                <div style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: status?.status === "done" 
                    ? "rgba(16,185,129,0.1)" 
                    : status?.status === "building"
                    ? "rgba(167,139,250,0.1)"
                    : "rgba(107,114,128,0.1)",
                  border: `1px solid ${
                    status?.status === "done" 
                      ? "rgba(16,185,129,0.3)" 
                      : status?.status === "building"
                      ? "rgba(167,139,250,0.3)"
                      : "rgba(107,114,128,0.3)"
                  }`,
                  color: status?.status === "done" 
                    ? "#10b981" 
                    : status?.status === "building"
                    ? "#a78bfa"
                    : "#6b7280",
                  fontWeight: 700,
                  fontSize: "0.85rem"
                }}>
                  {status?.status || "idle"}
                </div>
              </div>
              
              <div className="progress-wrap">
                <div 
                  className="progress-bar" 
                  style={{width: `${status?.progress ?? 0}%`}}
                />
              </div>
              
              <div className="small-muted" style={{marginTop: 10}}>
                Progress: {status?.progress ?? 0}% • {status?.status_message || "Waiting to start"}
              </div>

              {status?.status === "error" && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  color: "#ef4444"
                }}>
                  Error: {status.error}
                </div>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div>
            <div style={{
              display:"flex", 
              justifyContent:"space-between", 
              alignItems:"center",
              marginBottom: 14
            }}>
              <div className="small-muted">Render Output</div>
              {status?.status === "done" && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#10b981",
                  fontSize: "0.9rem"
                }}>
                  <FiCheckCircle />
                  Complete
                </div>
              )}
            </div>

            <div className="card" style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 300
            }}>
              {status?.status === "done" && jobId ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <video 
                    controls 
                    src={`${API_ROOT}/api/video/${jobId}`} 
                    style={{
                      width:"100%", 
                      borderRadius: 12,
                      marginBottom: 14
                    }} 
                  />
                  <div style={{display:"flex", gap: 10}}>
                    <a 
                      className="btn btn-primary" 
                      href={`${API_ROOT}/api/video/${jobId}`} 
                      download
                      style={{flex: 1, justifyContent: "center"}}
                    >
                      <FiDownload/> Download
                    </a>
                    <button 
                      className="btn btn-ghost" 
                      onClick={()=>{ 
                        navigator.clipboard.writeText(`${window.location.origin}/api/video/${jobId}`); 
                        alert("Copied video URL"); 
                      }}
                    >
                      <FiCopy/> Copy Link
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div style={{
                  height: 300, 
                  display:"flex", 
                  alignItems:"center", 
                  justifyContent:"center",
                  flexDirection: "column",
                  gap: 16
                }}>
                  {status?.status === "building" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <FiFilm size={56} style={{opacity: 0.3}} />
                    </motion.div>
                  ) : (
                    <FiFilm size={56} style={{opacity: 0.2}} />
                  )}
                  <div style={{textAlign: "center"}}>
                    <div style={{fontWeight: 700, fontSize: 18, marginBottom: 8}}>
                      {status?.status === "building" ? "Rendering..." : "No render yet"}
                    </div>
                    <div className="small-muted">
                      {status?.status === "building" 
                        ? "Processing your video..." 
                        : "Upload media and start build"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
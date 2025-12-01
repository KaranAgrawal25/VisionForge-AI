import "./globals.css";
import React from "react";
import BackgroundProvider from "./BackgroundProvider";
import { FiZap, FiFilm, FiGithub, FiTwitter } from "react-icons/fi";

export const metadata = {
  title: "VisionForge — AI Cinematic Video Generator",
  description: "Transform ideas into stunning cinematic videos with AI-powered prompts and automated rendering",
  keywords: "AI video, video generator, cinematic AI, automated video creation, AI filmmaking",
  authors: [{ name: "Karan" }],
  openGraph: {
    title: "VisionForge — AI Cinematic Video Generator",
    description: "Transform ideas into stunning cinematic videos with AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisionForge — AI Cinematic Video Generator",
    description: "Transform ideas into stunning cinematic videos with AI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body suppressHydrationWarning={true}>
        <BackgroundProvider>
          {/* Background Layers */}
          <div className="bg-layer">
            <div className="wave" />
            <div className="orbs" />
          </div>

          {/* Main App Container */}
          <div className="app-wrapper" style={{ position: "relative", zIndex: 10 }}>
            {/* Top Navigation Bar */}
            <header style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
            }}>
              <div className="container" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px"
              }}>
                {/* Logo & Brand */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}>
                  <div className="logo-glow" style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FiFilm size={22} color="#030712" />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 900,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.02em",
                      background: "linear-gradient(135deg, #f8fafc, #a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}>
                      VisionForge
                    </div>
                    <div style={{
                      fontSize: "0.7rem",
                      color: "var(--muted)",
                      letterSpacing: "0.05em",
                      marginTop: -2
                    }}>
                      BY KARAN
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <nav style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ padding: "8px 14px" }}
                  >
                    <FiGithub size={18} />
                    <span style={{ display: "none", "@media (min-width: 768px)": { display: "inline" } }}>
                      GitHub
                    </span>
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ padding: "8px 14px" }}
                  >
                    <FiTwitter size={18} />
                  </a>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#a78bfa",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <FiZap size={12} />
                    v2.0 BETA
                  </div>
                </nav>
              </div>
            </header>

            {/* Hero Banner */}
            <div className="container" style={{ paddingTop: "3rem", paddingBottom: "2rem" }}>
              <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 20,
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  marginBottom: 24,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#a78bfa"
                }}>
                  <FiZap size={14} />
                  AI-POWERED CINEMATIC VIDEO CREATION
                </div>
                
                <h1 className="h1" style={{
                  marginBottom: 20,
                  fontSize: "clamp(2.5rem, 5vw, 4rem)"
                }}>
                  Transform Ideas Into
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>
                    Cinematic Videos
                  </span>
                </h1>
                
                <p style={{
                  fontSize: "1.15rem",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  maxWidth: 600,
                  margin: "0 auto 32px"
                }}>
                  Generate stunning AI-powered video prompts, upload your images, 
                  and watch as they transform into professional cinematic content
                </p>

                <div style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 12px #10b981"
                    }} />
                    <span className="small-muted">AI Prompts</span>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 12px #10b981"
                    }} />
                    <span className="small-muted">Auto Rendering</span>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 12px #10b981"
                    }} />
                    <span className="small-muted">4K Export</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="container">
              {children}
            </main>

            {/* Footer */}
            <footer style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              marginTop: "4rem",
              padding: "3rem 0 2rem"
            }}>
              <div className="container">
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 40,
                  marginBottom: 40
                }}>
                  {/* Brand Column */}
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16
                    }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <FiFilm size={18} color="#030712" />
                      </div>
                      <div style={{
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        background: "linear-gradient(135deg, #f8fafc, #a78bfa)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}>
                        VisionForge
                      </div>
                    </div>
                    <p className="small-muted" style={{ lineHeight: 1.6 }}>
                      Next-generation AI video creation platform. 
                      Transform your creative vision into stunning cinematic reality.
                    </p>
                  </div>

                  {/* Features Column */}
                  <div>
                    <div style={{
                      fontWeight: 700,
                      marginBottom: 16,
                      fontSize: "0.95rem"
                    }}>
                      Features
                    </div>
                    <ul style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10
                    }}>
                      <li className="small-muted" style={{ cursor: "pointer" }}>
                        AI Prompt Generation
                      </li>
                      <li className="small-muted" style={{ cursor: "pointer" }}>
                        Image Upload & Processing
                      </li>
                      <li className="small-muted" style={{ cursor: "pointer" }}>
                        Automated Rendering
                      </li>
                      <li className="small-muted" style={{ cursor: "pointer" }}>
                        Multiple Style Presets
                      </li>
                    </ul>
                  </div>

                  {/* Connect Column */}
                  <div>
                    <div style={{
                      fontWeight: 700,
                      marginBottom: 16,
                      fontSize: "0.95rem"
                    }}>
                      Connect
                    </div>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12
                    }}>
                      <a 
                        href="https://github.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="small-muted"
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8,
                          textDecoration: "none"
                        }}
                      >
                        <FiGithub size={16} />
                        GitHub
                      </a>
                      <a 
                        href="https://twitter.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="small-muted"
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8,
                          textDecoration: "none"
                        }}
                      >
                        <FiTwitter size={16} />
                        Twitter
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                  paddingTop: 24,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16
                }}>
                  <div className="footer-note">
                    © 2025 VisionForge by Karan. Powered by AI.
                  </div>
                  <div style={{
                    display: "flex",
                    gap: 20,
                    fontSize: "0.85rem",
                    color: "var(--muted)"
                  }}>
                    <span style={{ cursor: "pointer" }}>Privacy</span>
                    <span style={{ cursor: "pointer" }}>Terms</span>
                    <span style={{ cursor: "pointer" }}>Documentation</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </BackgroundProvider>
      </body>
    </html>
  );
}
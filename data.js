/**
 * ARYAN KUMAR PORTFOLIO — DATA STORE & SYNCHRONIZATION ENGINE
 * Serves as the central single source of truth for both:
 * 1. index.html (Visitor presentation layer)
 * 2. admin.html (Live content management panel)
 */

const rootScope = typeof window !== "undefined" ? window : globalThis;
const STORAGE_KEY = "aryan_portfolio_data_v1";
const SYNC_CHANNEL = "portfolio_sync_channel";

rootScope.DEFAULT_PORTFOLIO_DATA = {
  _lastUpdated: Date.now(),
  profile: {
    name: "Aryan Kumar",
    taglineLine1: "Aryan Kumar",
    taglineLine2: "Building Agentic AI & High-Throughput Web Platforms",
    eyebrow: "FULL-STACK DEVELOPER · AI AGENT ENGINEER · MERN & PYTHON",
    bio: "Passionate software engineer crafting full-stack web applications with MERN and production-grade AI Agentic systems using Python, LangChain, CrewAI, and RAG. Focused on low-latency backends, real-time WebSockets, WebRTC, and clean distributed architectures.",
    avatar: "https://res.cloudinary.com/su1rtayw/image/upload/v1791280125/gtercet5mc8m4ri7nzkt.jpg",
    statusBadge: "AVAILABLE FOR ROLES · 2026",
    roleCaption: "MERN · FastAPI · LangChain · RAG",
    location: "Bhilai, Chhattisgarh, India",
    educationBrief: "B.Tech CS '27 (CGPA 7.8)",
    resumeUrl: "assets/Aryan_resw.pdf",
    phone: "+91-9334706652",
    email: "aryanrajput.dev@gmail.com",
    githubUrl: "https://github.com/aryacreations",
    githubUsername: "aryacreations",
    linkedinUrl: "https://www.linkedin.com/in/aryan-kumar-3562a1376",
    linkedinUsername: "aryan-kumar-3562a1376"
  },
  metrics: [
    { number: "500+", label: "Extension Downloads" },
    { number: "<150ms", label: "RAG Latency (5k+ Docs)" },
    { number: "300+", label: "Orders / Day Handled" },
    { number: "20+", label: "GitHub Repositories" }
  ],
  about: {
    eyebrow: "01 · BIOGRAPHY & VISION",
    title: "ENGINEERING SOFTWARE THAT SOLVES REAL-WORLD PROBLEMS",
    lead: "I am a Computer Science undergraduate at Rungta International Skills University with a deep obsession for building software that performs reliably in the wild.",
    paragraph: "My engineering philosophy revolves around combining robust backend design (FastAPI, Express, Node.js) with modern intelligent systems (CrewAI, LangChain, RAG architectures). Whether it's enabling peer-to-peer real-time voice chat across 500+ gamers, orchestrating multi-agent systems for technical patent research, or managing 300+ daily orders on a food delivery pipeline, I build software that feels instantaneous and rock-solid.",
    polaroids: [
      {
        badge: "TECH LEAD",
        isGold: false,
        title: "Full Stack Developer Club",
        desc: "Leading 50+ student developers at Rungta International Skills University, organizing hands-on hackathons and sprint workshops."
      },
      {
        badge: "AI AGENTS",
        isGold: true,
        title: "Multi-Agent Research",
        desc: "Deep-diving into Ollama, DeepSeek R1, OpenSearch, and Agentic RAG workflows to eliminate manual repetitive work."
      }
    ],
    principles: [
      {
        marker: "✦",
        title: "FULL-STACK PROBLEM SOLVING",
        desc: "From relational & NoSQL database schemas (MongoDB, MySQL) to responsive frontend UIs (React.js, Modern CSS, GSAP) and scalable microservices."
      },
      {
        marker: "✦",
        title: "PRODUCTION AI & AGENTIC ORCHESTRATION",
        desc: "Designing deterministic RAG pipelines, autonomous research agents (CrewAI, LangChain), and Model Context Protocol (MCP) tool integrations."
      },
      {
        marker: "✦",
        title: "LOW-LATENCY REAL-TIME COMMUNICATION",
        desc: "Harnessing WebSockets and WebRTC for peer-to-peer voice streaming, instant signaling, and concurrent live order dispatching."
      },
      {
        marker: "✦",
        title: "CLEAN ARCHITECTURE & AUTOMATION",
        desc: "Prioritizing clean modular code, Docker containerization, postman testing, n8n automations, and AI-accelerated workflows with Claude Code & Antigravity."
      }
    ],
    quickFacts: {
      location: "Bhilai, Chhattisgarh, India",
      degree: "B.Tech Computer Science (2027)",
      cgpa: "7.8 / 10.0",
      phone: "+91-9334706652"
    }
  },
  skills: [
    {
      id: "ai-agents",
      title: "AI & Agentic Systems",
      chip: "CORE FOCUS",
      icon: "bot",
      isGold: true,
      summary: "Autonomous agents, context-aware RAG pipelines, and LLM integrations.",
      tags: ["CrewAI", "LangChain", "RAG Pipelines", "MCP (Model Context)", "Ollama", "DeepSeek R1", "SerpAPI", "OpenSearch", "Prompt Engineering"]
    },
    {
      id: "fullstack",
      title: "Full-Stack Web",
      chip: "MERN & BEYOND",
      icon: "layers",
      isGold: false,
      summary: "Modern reactive web frontends and high-performance server architectures.",
      tags: ["React.js", "Node.js", "Express.js", "FastAPI", "JavaScript (ES6+)", "Python", "HTML5 / CSS3", "TypeScript", "GSAP Animations"]
    },
    {
      id: "realtime",
      title: "Real-Time & APIs",
      chip: "LOW LATENCY",
      icon: "radio",
      isGold: false,
      summary: "Instant messaging, peer-to-peer audio streams, and robust API endpoints.",
      tags: ["WebSockets", "WebRTC (P2P Audio)", "Chrome Extension API", "RESTful APIs", "JWT Auth", "Open Journal Systems"]
    },
    {
      id: "databases-devops",
      title: "Databases & DevOps",
      chip: "STORAGE & OPS",
      icon: "database",
      isGold: false,
      summary: "Persistent data modeling, containerization, and automated workflows.",
      tags: ["MongoDB", "MySQL", "Docker", "Git / GitHub", "Postman", "Jupyter Notebook", "Linux / Bash"]
    },
    {
      id: "automation",
      title: "Automation & Agent IDEs",
      chip: "WORKFLOWS",
      icon: "workflow",
      isGold: false,
      summary: "Advanced developer tools multiplying engineering velocity.",
      tags: ["n8n Automation", "Claude Code (Subagents)", "Google Antigravity", "Cursor AI", "VS Code"]
    },
    {
      id: "vision-tools",
      title: "Computer Vision & AI",
      chip: "SPECIALIZED",
      icon: "scan-face",
      isGold: false,
      summary: "Object tracking, motion sensors, and OpenCV processing.",
      tags: ["OpenCV", "Motion Detection", "Face Recognition", "Django GST Billing", "IoT / Smart City"]
    }
  ],
  projects: [
    {
      id: "rag-platform",
      title: "Autonomous Agentic RAG Product Research Platform",
      tagline: "Multi-agent competitive research & patent intelligence system with sub-150ms semantic search.",
      year: "2026",
      badge: "★ FLAGSHIP AI PROJECT",
      badgeType: "featured",
      category: "ai-agents",
      isFeatured: true,
      stats: [
        { strong: "-85%", text: "Manual Research Time" },
        { strong: "<150ms", text: "Retrieval Across 5k+ Docs" },
        { strong: "+30%", text: "Patent Search Accuracy" }
      ],
      bullets: [
        "Built a multi-agent autonomous research platform using CrewAI and LangChain to eliminate manual patent research bottlenecks.",
        "Implemented dense vector semantic search with OpenSearch delivering sub-150ms retrieval latency across 5,000+ complex technical documents.",
        "Integrated local Ollama (DeepSeek R1) reasoning models with SerpAPI for real-time web synthesis and verification.",
        "Architected an end-to-end Retrieval-Augmented Generation (RAG) pipeline for autonomous document discovery, market intelligence, and structured reporting."
      ],
      tags: ["CrewAI", "LangChain", "Ollama", "DeepSeek R1", "SerpAPI", "OpenSearch", "RAG"],
      githubUrl: "https://github.com/aryacreations",
      hasDetails: true
    },
    {
      id: "vina-extension",
      title: "Vina Voice Chatting Extension",
      tagline: "Low-latency peer-to-peer in-game voice communication Chrome extension for multiplayer teams.",
      year: "2026",
      badge: "● 500+ DOWNLOADS · 200+ USERS",
      badgeType: "live",
      category: "realtime",
      isFeatured: true,
      stats: [
        { strong: "500+", text: "Chrome Store Downloads" },
        { strong: "2,000+", text: "Voice Minutes Logged" },
        { strong: "P2P WebRTC", text: "Zero Disruptions" }
      ],
      bullets: [
        "Built and deployed a real-time voice chat Chrome extension for multiplayer teams with 500+ downloads and 200+ active users.",
        "Engineered peer-to-peer voice streaming using WebRTC, achieving ultra-low latency audio across 2,000+ voice minutes.",
        "Created a robust WebSocket signaling server to handle peer discovery, ICE candidates, and seamless session reconnection.",
        "Leveraged Chrome Extension APIs (Manifest V3) for non-intrusive background audio overlay without lagging gameplay frames."
      ],
      tags: ["JavaScript", "WebRTC", "Chrome Extension API", "WebSockets", "Node.js"],
      githubUrl: "https://github.com/aryacreations/vina-voice-chatting-extension-",
      hasDetails: true
    },
    {
      id: "yaari-circle",
      title: "YaariCircle – Multi-Role Meal Delivery Platform",
      tagline: "High-volume food ordering ecosystem with live WebSocket kitchen tracking & geolocation routing.",
      year: "2026",
      badge: "⚡ 300+ ORDERS / DAY",
      badgeType: "production",
      category: "fullstack",
      isFeatured: true,
      stats: [
        { strong: "300+", text: "Orders / Day Processed" },
        { strong: "10+", text: "Concurrent Operations" },
        { strong: "MERN", text: "Full Production Stack" }
      ],
      bullets: [
        "Developed full-stack multi-role meal delivery platform in MERN, handling 300+ orders per day across local fulfillment hubs.",
        "Engineered complete Node.js, Express, and MongoDB backend with role-based JWT authentication (User, Kitchen, Rider, Admin).",
        "Implemented real-time bidirectional order updates using WebSockets for kitchen prep queues and driver handoffs.",
        "Integrated browser geolocation APIs to streamline delivery dispatch and compute accurate delivery routing estimates."
      ],
      tags: ["MongoDB", "Express.js", "React.js", "Node.js", "WebSockets", "JWT", "Geolocation"],
      githubUrl: "https://github.com/aryacreations",
      hasDetails: true
    },
    {
      id: "texserve-backend",
      title: "Texserve E-Commerce Scalable Backend",
      tagline: "Production e-commerce backend built with FastAPI, MongoDB, Docker, and clean layered architecture.",
      year: "2026",
      badge: "CLIENT BACKEND",
      badgeType: "standard",
      category: "python-tools",
      isFeatured: false,
      summary: "Engineered for Texserve Nexsus Pvt Ltd. Features secure JWT authorization, asynchronous MongoDB aggregation, cart persistence, order state machines, and Docker containerized deployment.",
      tags: ["FastAPI", "MongoDB", "Docker", "JWT", "Python"],
      githubUrl: "https://github.com/aryacreations/e-commerce-backend",
      hasDetails: false
    },
    {
      id: "aiia-ctms",
      title: "AIIA-CTMS: Clinical Trial Management System",
      tagline: "Comprehensive healthcare clinical trial management platform developed for Smart India Hackathon.",
      year: "2026",
      badge: "SIH 2026 NATIONAL PROJECT",
      badgeType: "sih",
      category: "fullstack",
      isFeatured: false,
      summary: "Enables clinical researchers and medical staff to manage clinical trial protocols, participant cohorts, adverse event logs, and compliance documentation under national standards.",
      tags: ["HTML5 / JS", "Clinical Protocols", "SIH 2026", "Healthcare Tech"],
      githubUrl: "https://github.com/aryacreations/AIIA-CTMS-SIH-2026",
      hasDetails: false
    },
    {
      id: "task-team-system",
      title: "Task & Team Management Advanced System",
      tagline: "Enterprise workflow management engine with sprint roadmaps and role hierarchies.",
      year: "2025",
      badge: "ENTERPRISE SYSTEM",
      badgeType: "standard",
      category: "fullstack",
      isFeatured: false,
      summary: "Built with TypeScript and Node.js. Features Kanban task boards, milestone tracking, team assignments, priority queues, and automated audit logs for collaborative team throughput.",
      tags: ["TypeScript", "Node.js", "Team Workflows", "Kanban"],
      githubUrl: "https://github.com/aryacreations/Task-and-Team-management-system-advanced-project",
      hasDetails: false
    },
    {
      id: "movieplex",
      title: "MoviePlex – Entertainment Streaming Platform",
      tagline: "Modern ad-free movie streaming interface with smart genre discovery & high-speed player.",
      year: "2025",
      badge: "STREAMING UI",
      badgeType: "standard",
      category: "fullstack",
      isFeatured: false,
      summary: "Responsive frontend with dark aesthetic, real-time TMDB API integration, instant video playback trailers, search debounce, and smooth content carousels.",
      tags: ["JavaScript", "REST APIs", "Media Streaming", "Responsive UI"],
      githubUrl: "https://github.com/aryacreations/movieplex",
      hasDetails: false
    },
    {
      id: "campus-connect",
      title: "Campus Connect Multitasking Web App",
      tagline: "Unified college portal for study materials, event schedules, and peer collaboration.",
      year: "2025",
      badge: "COMMUNITY PORTAL",
      badgeType: "standard",
      category: "fullstack",
      isFeatured: false,
      summary: "Designed for university student bodies to coordinate notes sharing, departmental updates, club activities, and academic schedules within a lightweight responsive interface.",
      tags: ["HTML5 / CSS", "JavaScript", "Student Community"],
      githubUrl: "https://github.com/aryacreations/campus-connect",
      hasDetails: false
    },
    {
      id: "gst-billing",
      title: "GST Billing Project in Python & Django",
      tagline: "Automated tax invoice calculation engine with CGST/SGST breakdowns and printable bills.",
      year: "2025",
      badge: "FINTECH & TAX",
      badgeType: "standard",
      category: "python-tools",
      isFeatured: false,
      summary: "Enterprise billing software allowing small businesses to generate compliant GST invoices, track product inventories, manage client accounts, and produce downloadable tax ledgers.",
      tags: ["Python", "Django", "SQL", "GST Tax Engine"],
      githubUrl: "https://github.com/aryacreations/GST-Billing-Project-in-Python-Django",
      hasDetails: false
    },
    {
      id: "cv-suite",
      title: "OpenCV Motion & Face Detection Suite",
      tagline: "Real-time video feed surveillance systems with contour movement alarms & Haar cascade classifiers.",
      year: "2026",
      badge: "COMPUTER VISION",
      badgeType: "standard",
      category: "ai-agents",
      isFeatured: false,
      summary: "Dual computer vision projects capturing real-time camera frames to identify intruders through delta-frame thresholds and detect multiple faces simultaneously with bounding boxes and timestamp logging.",
      tags: ["Python", "OpenCV", "Motion Tracking", "Face Recognition"],
      githubUrl: "https://github.com/aryacreations/motion-detector-project-opencv",
      hasDetails: false
    },
    {
      id: "bank-mgmt",
      title: "Bank Management System (Python OOP)",
      tagline: "Robust banking ledger application with CSV transaction audit trails & role validation.",
      year: "2025",
      badge: "FINANCIAL CORE",
      badgeType: "standard",
      category: "python-tools",
      isFeatured: false,
      summary: "Engineered with strict Python OOP concepts. Supports secure account creation, deposits, withdrawals, balance inquiry, admin authentication, and automated statement generation.",
      tags: ["Python OOP", "File Handling", "CSV Export", "Validation"],
      githubUrl: "https://github.com/aryacreations/Bank-Management-System",
      hasDetails: false
    },
    {
      id: "smart-garbage",
      title: "SmartGarbage – Municipal IoT Waste Routing",
      tagline: "Sensor-triggered waste management automation for clean smart city infrastructure.",
      year: "2025",
      badge: "SMART CITIES",
      badgeType: "standard",
      category: "python-tools",
      isFeatured: false,
      summary: "Simulates ultrasonic bin-level telemetry, triggers automated collection alerts when bins reach 80% threshold, and optimizes municipal truck routes to reduce fuel waste.",
      tags: ["IoT Concept", "Python", "Smart City", "Automation"],
      githubUrl: "https://github.com/aryacreations/SmartGarbage",
      hasDetails: false
    }
  ],
  experience: [
    {
      id: "texserve",
      role: "Freelance Backend Developer",
      company: "Texserve Nexsus Pvt Ltd",
      period: "DEC 2025 – JAN 2026 · REMOTE",
      badge: "FREELANCE BACKEND",
      isGold: true,
      points: [
        "Architected and deployed a scalable e-commerce micro-backend using FastAPI, MongoDB, and Docker.",
        "Engineered secure token-based JWT authentication, role guard middleware, and session validity.",
        "Designed core shopping cart data structures and transactional order processing pipelines with clean layered architecture."
      ],
      tags: ["FastAPI", "MongoDB", "Docker", "Clean Architecture"]
    },
    {
      id: "friends-foods",
      role: "Freelance Full Stack Developer",
      company: "Friends Foods and Company",
      period: "JAN 2026 – FEB 2026 · REMOTE",
      badge: "FREELANCE FULL STACK",
      isGold: false,
      points: [
        "Built a comprehensive meal delivery platform using React, Node.js, and MongoDB from ground zero.",
        "Implemented real-time live order dispatching and status tracking for kitchen operators and hungry customers.",
        "Constructed an administrative dashboard for inventory adjustments, order analytics, and user role permission management."
      ],
      tags: ["React.js", "Node.js", "MongoDB", "Real-Time UI"]
    },
    {
      id: "probecell",
      role: "Freelance OJS Developer",
      company: "Probecell Journal",
      period: "MAR 2026 · REMOTE",
      badge: "OJS DEVELOPER",
      isGold: false,
      points: [
        "Deployed and customized Open Journal Systems (OJS) on production servers using PHP and MySQL.",
        "Configured automated Digital Object Identifier (DOI) integration via Crossref for peer-reviewed academic papers.",
        "Setup PKP Preservation Network (PKP PN) long-term digital archiving and configured journal editorial workflows."
      ],
      tags: ["PHP", "MySQL", "OJS", "DOI / Crossref"]
    }
  ],
  leadership: {
    tag: "LEADERSHIP ROLE",
    title: "Team Leader · Full Stack Developer Club",
    org: "Rungta International Skills University · Ongoing",
    desc: "Lead a vibrant student developer community of 50+ members focused on modern web engineering. Coordinate hands-on project sprints, mentor junior programmers in JavaScript and Python, and organize technical workshops and code-reviews.",
    stat1Num: "50+",
    stat1Txt: "Students Mentored",
    stat2Num: "10+",
    stat2Txt: "Sprint Sessions"
  },
  certifications: [
    {
      id: "claude-code",
      name: "Claude Code in Action",
      issuer: "Anthropic",
      icon: "award",
      badge: "Anthropic · Subagents",
      desc: "Mastery in Claude Code CLI, agentic orchestration, subagents, and automated developer tooling."
    },
    {
      id: "langchain-intro",
      name: "Foundation: Introduction to LangChain – Python",
      issuer: "LangChain Official",
      icon: "terminal",
      badge: "LangChain · Python · RAG",
      desc: "Chaining models, memory structures, document loaders, vector stores, and custom LLM agent tools."
    },
    {
      id: "sql-cert",
      name: "SQL Certified",
      issuer: "Intellipaat",
      icon: "database",
      badge: "SQL · Data Modeling",
      desc: "Advanced relational database querying, joins, indexing, subqueries, and stored procedures."
    },
    {
      id: "mern-cert",
      name: "MERN Full Stack Development",
      issuer: "Coding Spoon Edutech Pvt. Ltd.",
      icon: "code-2",
      badge: "MERN Stack · Full Lifecycle",
      desc: "Full lifecycle MERN application development: MongoDB, Express.js, React.js, and Node.js."
    }
  ],
  education: {
    yearTag: "EXPECTED 2027 · FULL-TIME",
    degree: "B.Tech in Computer Science & Engineering",
    university: "Rungta International Skills University",
    location: "Bhilai, Chhattisgarh, India",
    cgpa: "7.8 / 10.0",
    coursework: [
      "Database Management Systems (DBMS)",
      "Operating Systems",
      "Computer Networks",
      "Python Programming",
      "Fundamentals of Artificial Intelligence",
      "Object-Oriented Programming (OOP)"
    ],
    quote: "Focusing on the practical application of algorithms, distributed data streams, and artificial intelligence to create tangible value."
  }
};

/**
 * Get current portfolio data (from localStorage if customized, else default)
 */
function getPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return deepMerge(window.DEFAULT_PORTFOLIO_DATA, parsed);
    }
  } catch (err) {
    console.warn("Failed to load portfolio data from localStorage, falling back to defaults.", err);
  }
  return JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA));
}

/**
 * Save updated portfolio data to localStorage, server disk API, and broadcast
 */
function savePortfolioData(data) {
  try {
    data._lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Broadcast across open browser tabs
    notifySync();

    // Persist to disk via backend API if server is running
    try {
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    } catch (e) {}

    return true;
  } catch (err) {
    console.error("Failed to save portfolio data to localStorage", err);
    return false;
  }
}

/**
 * Reset portfolio data back to defaults
 */
function resetPortfolioData() {
  localStorage.removeItem(STORAGE_KEY);
  notifySync();
}

/**
 * Broadcast sync message across tabs
 */
function notifySync() {
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const bc = new BroadcastChannel(SYNC_CHANNEL);
      bc.postMessage({ type: "PORTFOLIO_UPDATED", timestamp: Date.now() });
      bc.close();
    } catch (e) {}
  }
  window.dispatchEvent(new CustomEvent("portfolio:updated", { detail: { timestamp: Date.now() } }));
}

/**
 * Check if server has saved data and sync locally
 */
async function syncWithServerData() {
  try {
    const res = await fetch("/api/data");
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.profile) {
        const local = localStorage.getItem(STORAGE_KEY);
        const localData = local ? JSON.parse(local) : null;
        if (!localData || (serverData._lastUpdated && serverData._lastUpdated > (localData._lastUpdated || 0))) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          notifySync();
        }
      }
    }
  } catch (e) {}
}

/**
 * Helper to deep merge objects
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_PORTFOLIO_DATA: rootScope.DEFAULT_PORTFOLIO_DATA,
    getPortfolioData,
    savePortfolioData,
    resetPortfolioData
  };
}

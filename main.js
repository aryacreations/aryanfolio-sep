/**
 * ARYAN KUMAR PORTFOLIO — INTERACTIVE & DYNAMIC HYDRATION ENGINE
 * Features:
 * - Dynamic data hydration from data.js & localStorage
 * - Cross-tab live synchronization via BroadcastChannel & storage events
 * - Lenis Smooth Scrolling + GSAP ScrollTrigger Integration
 * - Neubrutalist Physical Micro-Interactions & Hover Lift
 * - Custom Retro Crosshair Cursor
 * - Project Filter System with Snappy Transitions
 * - Interactive Project Architecture Modal
 * - Click-to-Copy with Toast Notifications
 * - Interactive Terminal Emulator
 * - Mobile Drawer Navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. INITIALIZE LUCIDE ICONS
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. LENIS SMOOTH SCROLLING SETUP
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor links smooth navigation via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId && targetId !== "#" && document.querySelector(targetId)) {
          e.preventDefault();
          lenis.scrollTo(targetId, { offset: -70 });

          // Close mobile drawer if open
          closeMobileDrawer();
        }
      });
    });
  }

  // 3. CUSTOM RETRO CURSOR
  const cursor = document.getElementById("customCursor");
  const cursorDot = document.getElementById("customCursorDot");

  if (cursor && cursorDot && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Immediate dot placement
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth trailing ring loop
    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.22;
      cursorY += (mouseY - cursorY) * 0.22;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    function attachCursorHover() {
      const interactives = document.querySelectorAll("a, button, .project-card, .skill-card, .hard-shadow");
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
      });
    }
    attachCursorHover();
  }

  // 4. GSAP TIMELINES & SCROLL REVEALS (§13)
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

    heroTl
      .from(".nav", { y: -80, opacity: 0, duration: 0.6 })
      .from(".mosaic-accent .mosaic-tile", { scale: 0, stagger: 0.08, duration: 0.4 }, "-=0.2")
      .from(".hero-eyebrow", { y: 20, opacity: 0 }, "-=0.2")
      .from(".title-line-1", { y: 30, opacity: 0, duration: 0.7 }, "-=0.4")
      .from(".title-line-2", { y: 30, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(".hero-description", { y: 20, opacity: 0 }, "-=0.4")
      .from(".hero-actions", { y: 20, opacity: 0 }, "-=0.4")
      .from(".trust-bar", { y: 20, opacity: 0 }, "-=0.3")
      .from(
        ".hero-portrait-polaroid",
        {
          scale: 0.92,
          y: 40,
          opacity: 0,
          rotation: 5,
          duration: 1.0,
          ease: "back.out(1.4)",
        },
        "-=0.9"
      )
      .from(".floating-tech-card", { scale: 0.8, opacity: 0, duration: 0.5 }, "-=0.4")
      .from(".pixel-corner span", { scale: 0, stagger: 0.04, duration: 0.4 }, "-=0.6");

    // Scroll reveal for headings
    gsap.utils.toArray(".section-heading, .section-title-white").forEach((heading) => {
      gsap.from(heading, {
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  }

  // 5. DYNAMIC DATA HYDRATION & REAL-TIME SYNC ENGINE
  function hydratePortfolioFromData() {
    if (typeof getPortfolioData !== "function") return;
    const data = getPortfolioData();
    const p = data.profile || {};

    // A. HERO SECTION
    const line1 = document.querySelector(".title-line-1");
    if (line1 && p.name) line1.textContent = p.name;

    const line2 = document.querySelector(".title-line-2");
    if (line2 && p.taglineLine2) line2.textContent = p.taglineLine2;

    const eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow && p.eyebrow) eyebrow.textContent = p.eyebrow;

    const desc = document.querySelector(".hero-description");
    if (desc && p.bio) desc.textContent = p.bio;

    const avatar = document.getElementById("heroImage");
    if (avatar && p.avatar) avatar.src = p.avatar;

    const statusBadge = document.querySelector(".polaroid-badge-top span:last-child");
    if (statusBadge && p.statusBadge) statusBadge.textContent = p.statusBadge;

    const capName = document.querySelector(".caption-name");
    if (capName && p.name) capName.textContent = p.name;

    const capRole = document.querySelector(".caption-role");
    if (capRole && p.roleCaption) capRole.textContent = p.roleCaption;

    const eduBadge = document.querySelector(".badge-edu");
    if (eduBadge && p.educationBrief) eduBadge.textContent = p.educationBrief;

    // Resumes
    const cvBtns = document.querySelectorAll("#navResumeBtn, #heroCvBtn, .cta-actions-row a[download]");
    cvBtns.forEach((btn) => {
      if (p.resumeUrl) btn.setAttribute("href", p.resumeUrl);
    });

    // Metrics Bar
    const trustItems = document.querySelectorAll(".trust-bar .trust-item");
    if (data.metrics && trustItems.length >= 4) {
      data.metrics.forEach((m, idx) => {
        if (trustItems[idx]) {
          trustItems[idx].querySelector(".trust-number").textContent = m.number;
          trustItems[idx].querySelector(".trust-label").textContent = m.label;
        }
      });
    }

    // B. ABOUT SECTION
    const ab = data.about || {};
    const abHeading = document.querySelector("#about .section-heading");
    if (abHeading && ab.title) {
      abHeading.innerHTML = `ENGINEERING SOFTWARE THAT <span class="highlight-red">${escapeHtml(ab.title.replace("ENGINEERING SOFTWARE THAT", "").trim() || "SOLVES REAL PROBLEMS")}</span>`;
    }

    const abLead = document.querySelector("#about .body-lead");
    if (abLead && ab.lead) abLead.textContent = ab.lead;

    const abText = document.querySelector("#about .body-text");
    if (abText && ab.paragraph) abText.textContent = ab.paragraph;

    // Quick Facts
    const qf = ab.quickFacts || {};
    const qfacts = document.querySelectorAll(".quick-facts-box .qfact .qvalue");
    if (qfacts.length >= 4) {
      if (qf.location) qfacts[0].textContent = qf.location;
      if (qf.degree) qfacts[1].textContent = qf.degree;
      if (qf.cgpa) qfacts[2].textContent = qf.cgpa;
      if (qf.phone) qfacts[3].textContent = qf.phone;
    }

    // Principles
    const featureRows = document.querySelectorAll(".feature-panel .feature-row");
    if (ab.principles && featureRows.length > 0) {
      ab.principles.forEach((pr, i) => {
        if (featureRows[i]) {
          featureRows[i].querySelector(".feature-title").textContent = pr.title;
          featureRows[i].querySelector(".feature-desc").textContent = pr.desc;
        }
      });
    }

    // C. SKILLS & ARSENAL
    const skillsContainer = document.querySelector("#skills .skills-domain-grid");
    if (skillsContainer && data.skills && data.skills.length > 0) {
      skillsContainer.innerHTML = data.skills
        .map(
          (sk) => `
        <div class="skill-card ${sk.isGold ? "featured-gold-card" : ""} hard-shadow">
          <div class="card-chip ${sk.isGold ? "chip-gold" : ""}">${escapeHtml(sk.chip || "STACK")}</div>
          <div class="card-icon-header">
            <i data-lucide="${sk.icon || "code"}"></i>
            <h3>${escapeHtml(sk.title)}</h3>
          </div>
          <p class="card-summary">${escapeHtml(sk.summary || "")}</p>
          <div class="skill-tag-cloud">
            ${(sk.tags || []).map((t) => `<span class="skill-tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      `
        )
        .join("");
    }

    // D. PROJECTS GRID (DYNAMIC RENDER)
    const projectsGrid = document.getElementById("projectsGrid");
    if (projectsGrid && data.projects && data.projects.length > 0) {
      projectsGrid.innerHTML = data.projects
        .map((proj) => {
          const isFeatured = proj.isFeatured;
          const statsHtml = (proj.stats || [])
            .map((s) => `<div class="stat-pill"><strong>${escapeHtml(s.strong)}</strong> ${escapeHtml(s.text)}</div>`)
            .join("");

          const bulletsHtml = (proj.bullets || [])
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join("");

          const summaryHtml = proj.summary ? `<p class="project-summary-text">${escapeHtml(proj.summary)}</p>` : "";

          const tagsHtml = (proj.tags || [])
            .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
            .join("");

          const detailsBtnHtml = proj.hasDetails
            ? `<button class="btn btn-outline project-action-btn view-details-btn" data-project="${proj.id}">
                 <i data-lucide="maximize-2"></i> <span>Architecture Specs</span>
               </button>`
            : "";

          return `
          <article class="project-card ${isFeatured ? "featured-project-card hard-shadow-lg" : "hard-shadow"}" data-category="${escapeHtml(proj.category || "fullstack")}">
            <div class="project-card-header">
              <span class="card-badge ${isFeatured ? "badge-featured" : ""}">${escapeHtml(proj.badge || "PROJECT")}</span>
              <span class="project-year">${escapeHtml(proj.year || "2026")}</span>
            </div>
            <div class="project-card-body">
              <h3 class="project-title">${escapeHtml(proj.title)}</h3>
              <p class="project-tagline">${escapeHtml(proj.tagline || "")}</p>
              
              ${statsHtml ? `<div class="project-key-stats">${statsHtml}</div>` : ""}
              ${bulletsHtml ? `<ul class="project-bullet-list">${bulletsHtml}</ul>` : ""}
              ${summaryHtml}

              <div class="project-tech-tags">${tagsHtml}</div>
            </div>
            <div class="project-card-footer">
              <a href="${escapeHtml(proj.githubUrl || "https://github.com/aryacreations")}" target="_blank" rel="noopener noreferrer" class="btn btn-primary hard-shadow project-action-btn">
                <i data-lucide="github"></i> <span>Repository</span>
              </a>
              ${detailsBtnHtml}
            </div>
          </article>
        `;
        })
        .join("");

      // Update Filter counts
      updateFilterButtons(data.projects);

      // Re-bind modal buttons
      bindModalButtons();
    }

    // E. EXPERIENCE & LEADERSHIP
    const expContainer = document.querySelector("#experience .experience-cards-grid");
    if (expContainer && data.experience && data.experience.length > 0) {
      expContainer.innerHTML = data.experience
        .map(
          (exp) => `
        <div class="experience-card ${exp.isGold ? "featured-gold-card" : ""} hard-shadow">
          <div class="exp-badge">${escapeHtml(exp.badge || "ROLE")}</div>
          <div class="exp-period">${escapeHtml(exp.period || "")}</div>
          <h3 class="exp-role">${escapeHtml(exp.role)}</h3>
          <div class="exp-company">${escapeHtml(exp.company)}</div>
          <ul class="exp-points">
            ${(exp.points || []).map((pt) => `<li>${escapeHtml(pt)}</li>`).join("")}
          </ul>
          <div class="exp-tags">
            ${(exp.tags || []).map((t) => `<span class="exp-tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      `
        )
        .join("");
    }

    // Leadership
    const ld = data.leadership || {};
    const leadTitle = document.querySelector(".leadership-title");
    if (leadTitle && ld.title) leadTitle.textContent = ld.title;

    const leadOrg = document.querySelector(".leadership-org");
    if (leadOrg && ld.org) leadOrg.textContent = ld.org;

    const leadDesc = document.querySelector(".leadership-desc");
    if (leadDesc && ld.desc) leadDesc.textContent = ld.desc;

    const lstatBoxes = document.querySelectorAll(".leadership-stats .lstat-box");
    if (lstatBoxes.length >= 2) {
      if (ld.stat1Num) lstatBoxes[0].querySelector(".lstat-num").textContent = ld.stat1Num;
      if (ld.stat1Txt) lstatBoxes[0].querySelector(".lstat-txt").textContent = ld.stat1Txt;
      if (ld.stat2Num) lstatBoxes[1].querySelector(".lstat-num").textContent = ld.stat2Num;
      if (ld.stat2Txt) lstatBoxes[1].querySelector(".lstat-txt").textContent = ld.stat2Txt;
    }

    // F. CERTIFICATIONS & EDUCATION
    const certPanel = document.querySelector(".cert-panel");
    if (certPanel && data.certifications && data.certifications.length > 0) {
      certPanel.innerHTML = `
        <h3 class="panel-inner-title">// VERIFIED CERTIFICATIONS</h3>
        ${data.certifications
          .map(
            (c) => `
          <div class="cert-item">
            <div class="cert-icon-box">
              <i data-lucide="${c.icon || "award"}"></i>
            </div>
            <div class="cert-info">
              <h4 class="cert-name">${escapeHtml(c.name)}</h4>
              <div class="cert-issuer">${escapeHtml(c.issuer)}</div>
              <p class="cert-desc">${escapeHtml(c.desc || "")}</p>
              <span class="cert-badge">${escapeHtml(c.badge || "Verified")}</span>
            </div>
          </div>
        `
          )
          .join("")}
      `;
    }

    const ed = data.education || {};
    const eduDegree = document.querySelector(".edu-degree");
    if (eduDegree && ed.degree) eduDegree.textContent = ed.degree;

    const eduUni = document.querySelector(".edu-university");
    if (eduUni && ed.university) eduUni.textContent = ed.university;

    const eduCgpa = document.querySelector(".cgpa-val");
    if (eduCgpa && ed.cgpa) eduCgpa.textContent = ed.cgpa;

    const eduQuote = document.querySelector(".edu-quote-box p");
    if (eduQuote && ed.quote) eduQuote.textContent = `"${ed.quote}"`;

    // G. CONTACT
    if (p.email) {
      const emailEl = document.getElementById("emailVal");
      if (emailEl) {
        emailEl.textContent = p.email;
        emailEl.setAttribute("href", `mailto:${p.email}`);
      }
      const copyEmailBtn = document.querySelector('.copy-btn[data-copy*="@"]');
      if (copyEmailBtn) copyEmailBtn.setAttribute("data-copy", p.email);
    }

    if (p.phone) {
      const phoneEl = document.getElementById("phoneVal");
      if (phoneEl) {
        phoneEl.textContent = p.phone;
        phoneEl.setAttribute("href", `tel:${p.phone.replace(/[^0-9+]/g, "")}`);
      }
      const copyPhoneBtn = document.querySelector('.copy-btn[data-copy*="+"]');
      if (copyPhoneBtn) copyPhoneBtn.setAttribute("data-copy", p.phone);
    }

    // Re-create icons and refresh layout
    if (window.lucide) window.lucide.createIcons();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }

  // Update filter buttons labels with real project counts
  function updateFilterButtons(projects) {
    const filters = document.querySelectorAll(".filter-btn");
    const counts = {
      all: projects.length,
      "ai-agents": projects.filter((p) => p.category === "ai-agents").length,
      fullstack: projects.filter((p) => p.category === "fullstack").length,
      realtime: projects.filter((p) => p.category === "realtime").length,
      "python-tools": projects.filter((p) => p.category === "python-tools").length,
    };

    filters.forEach((btn) => {
      const f = btn.getAttribute("data-filter");
      const name = {
        all: "All Projects",
        "ai-agents": "AI & Agents",
        fullstack: "Full-Stack & MERN",
        realtime: "Real-Time & WebRTC",
        "python-tools": "Python & Backend",
      }[f];
      if (name && counts[f] !== undefined) {
        btn.textContent = `${name} (${counts[f]})`;
      }
    });
  }

  // Initial Hydration
  hydratePortfolioFromData();

  // Cross-Tab Real-Time Sync Listeners
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const syncChannel = new BroadcastChannel("portfolio_sync_channel");
      syncChannel.onmessage = (event) => {
        if (event.data && event.data.type === "PORTFOLIO_UPDATED") {
          hydratePortfolioFromData();
        }
      };
    } catch (e) {}
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "aryan_portfolio_data_v1") {
      hydratePortfolioFromData();
    }
  });

  window.addEventListener("portfolio:updated", () => {
    hydratePortfolioFromData();
  });

  // 6. PROJECT FILTER FUNCTIONALITY
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter");
      const projectCards = document.querySelectorAll(".project-card");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");

        if (filterVal === "all" || category === filterVal) {
          card.style.display = "flex";
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
          );
        } else {
          card.style.display = "none";
        }
      });

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });

  // 7. PROJECT ARCHITECTURE MODAL SYSTEM
  const projectModal = document.getElementById("projectModal");
  const modalBody = document.getElementById("modalBody");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalChip = document.getElementById("modalChip");

  const projectDetailsMap = {
    "rag-platform": {
      chip: "AUTONOMOUS RAG SYSTEM",
      title: "Autonomous Agentic RAG Product Research Platform",
      sub: "CrewAI · LangChain · Ollama (DeepSeek R1) · SerpAPI · OpenSearch",
      metrics: [
        { val: "85%", lbl: "MANUAL RESEARCH REDUCTION" },
        { val: "< 150ms", lbl: "RETRIEVAL LATENCY (5K+ DOCS)" },
        { val: "+30%", lbl: "PATENT CITATION ACCURACY" },
      ],
      description: `
        This architecture was designed to resolve severe engineering bottlenecks in patent landscaping, prior art search, and competitor product intelligence.
        Traditional keyword queries missed non-obvious prior art. By orchestrating multi-agent Crews with LangChain tools and local DeepSeek R1 models, 
        the system performs semantic retrieval, web-grounding via SerpAPI, and synthesizes structured technical briefs automatically.
      `,
      keyTakeaways: [
        "Orchestrated autonomous multi-agent division: Research Agent, Web Retrieval Agent, and Synthesizer Agent.",
        "Engineered OpenSearch vector store index with hierarchical chunking and hybrid BM25 + dense embedding scoring.",
        "Sub-150ms query latency achieved across 5,000+ dense technical specification papers and patents.",
        "Zero hallucination guardrails via citation-matched RAG verify steps.",
      ],
      githubUrl: "https://github.com/aryacreations",
    },
    "vina-extension": {
      chip: "WEBRTC REAL-TIME AUDIO",
      title: "Vina Voice Chatting Chrome Extension",
      sub: "WebRTC P2P Mesh · WebSocket Signaling · Chrome Extension Manifest V3",
      metrics: [
        { val: "500+", lbl: "STORE DOWNLOADS" },
        { val: "200+", lbl: "ACTIVE GAMERS & TEAMS" },
        { val: "2,000+", lbl: "VOICE MINUTES STREAMED" },
      ],
      description: `
        Vina was engineered to provide instant in-game and in-browser peer-to-peer voice communications without forcing gamers 
        or teammates to switch windows to external bulky desktop applications. 
        It integrates lightweight WebRTC audio streams with an offscreen document in Chrome Manifest V3 to keep crystal-clear audio running continuously.
      `,
      keyTakeaways: [
        "Constructed a high-concurrency Node.js WebSocket signaling server for session management and ICE negotiation.",
        "Engineered low-latency peer-to-peer audio pipelines using WebRTC PeerConnection and Opus audio codec compression.",
        "Bypassed Chrome MV3 service worker audio lifetime limitations using offscreen documents API.",
        "Integrated non-obtrusive floating tactical HUD with mute/deafen and room-code sharing.",
      ],
      githubUrl: "https://github.com/aryacreations/vina-voice-chatting-extension-",
    },
    "yaari-circle": {
      chip: "HIGH-CONCURRENCY MERN PLATFORM",
      title: "YaariCircle – Multi-Role Meal Delivery Platform",
      sub: "MongoDB · Express.js · React.js · Node.js · WebSockets · JWT · Geolocation",
      metrics: [
        { val: "300+", lbl: "ORDERS HANDLED DAILY" },
        { val: "10+", lbl: "CONCURRENT KITCHEN USERS" },
        { val: "100%", lbl: "REAL-TIME TRACKING UPTIME" },
      ],
      description: `
        YaariCircle serves multiple local food delivery hubs, bridging kitchen order ticket (KOT) workflows with 
        customers and delivery agents. The challenge was maintaining synchronization across distinct operational roles 
        without database polling delays.
      `,
      keyTakeaways: [
        "Real-time bidirectional order state propagation using custom WebSocket channels.",
        "Role-based access control (RBAC) protecting endpoints across Customer, Kitchen Chef, Delivery Partner, and Admin roles.",
        "HTML5 Geolocation coordinate mapping calculating delivery distance and dynamic travel intervals.",
        "MongoDB aggregate queries tracking real-time menu availability and financial ledger tallies.",
      ],
      githubUrl: "https://github.com/aryacreations",
    },
  };

  function openProjectModal(projectId) {
    const data = projectDetailsMap[projectId] || {
      chip: "TECHNICAL SPECIFICATION",
      title: "Project Architecture & Implementation",
      sub: "Engineered by Aryan Kumar",
      metrics: [
        { val: "100%", lbl: "PRODUCTION READINESS" },
        { val: "TESTED", lbl: "STABLE CODEBASE" },
        { val: "OPEN", lbl: "GITHUB SOURCE" },
      ],
      description: "Full architectural breakdown, modular service design, and deployment documentation available on GitHub.",
      keyTakeaways: ["Clean modular separation of concerns.", "Comprehensive error handling and input validation."],
      githubUrl: "https://github.com/aryacreations",
    };

    modalChip.textContent = data.chip;

    modalBody.innerHTML = `
      <h3 class="modal-project-title">${data.title}</h3>
      <div class="modal-project-sub">${data.sub}</div>

      <div class="modal-metric-grid">
        ${data.metrics
          .map(
            (m) => `
          <div class="modal-metric-card">
            <span class="modal-metric-val">${m.val}</span>
            <span class="modal-metric-lbl">${m.lbl}</span>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="modal-section-h">// SYSTEM ARCHITECTURE OVERVIEW</div>
      <p>${data.description}</p>

      <div class="modal-section-h">// KEY TECHNICAL HIGHLIGHTS</div>
      <ul style="list-style: none; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
        ${data.keyTakeaways
          .map(
            (item) => `
          <li style="font-size: 0.92rem; color: var(--color-ink); position: relative; padding-left: 18px;">
            <span style="position: absolute; left: 0; color: var(--color-accent-red); font-weight: bold;">▪</span>
            ${item}
          </li>
        `
          )
          .join("")}
      </ul>

      <div class="modal-action-bar">
        <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary hard-shadow" style="padding: 10px 20px; font-size: 0.85rem;">
          <i data-lucide="github"></i> Open Source Repository
        </a>
        <button class="btn btn-outline-dark hard-shadow modal-dismiss-btn" style="padding: 10px 20px; font-size: 0.85rem;">
          Close Details
        </button>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dismissBtn = modalBody.querySelector(".modal-dismiss-btn");
    if (dismissBtn) dismissBtn.addEventListener("click", closeProjectModal);

    projectModal.classList.add("active");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    projectModal.classList.remove("active");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindModalButtons() {
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const projId = btn.getAttribute("data-project");
        openProjectModal(projId);
      });
    });
  }
  bindModalButtons();

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeProjectModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && projectModal.classList.contains("active")) {
      closeProjectModal();
    }
  });

  // 8. CLICK-TO-COPY & TOAST FEEDBACK
  const toast = document.getElementById("toastNotice");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);

          gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
        });
      }
    });
  });

  // 9. INTERACTIVE RETRO TERMINAL
  const terminal = document.getElementById("terminalOutput");
  if (terminal) {
    const commands = [
      { cmd: "cat education.md", res: "B.Tech Computer Science @ RISU (Expected 2027) | CGPA 7.8" },
      { cmd: "ls certifications/", res: "Claude-Code-Action.cert  LangChain-Intro.cert  SQL-Intellipaat.cert  MERN-FullStack.cert" },
      { cmd: "python -c 'import agent; agent.hire()'", res: "Connecting to aryanrajput.dev@gmail.com... Ready to collaborate!" },
    ];

    let cmdIndex = 0;
    terminal.addEventListener("click", () => {
      if (cmdIndex < commands.length) {
        const item = commands[cmdIndex];
        const cmdEl = document.createElement("div");
        cmdEl.className = "t-line";
        cmdEl.innerHTML = `<span class="t-prompt">$</span> <span class="t-cmd">${item.cmd}</span>`;

        const resEl = document.createElement("div");
        resEl.className = "t-line t-response t-highlight";
        resEl.textContent = item.res;

        const cursorLine = terminal.querySelector(".terminal-input-line");
        terminal.insertBefore(cmdEl, cursorLine);
        terminal.insertBefore(resEl, cursorLine);

        cmdIndex++;
      }
    });
  }

  // 10. MOBILE MENU DRAWER
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  function openMobileDrawer() {
    mobileDrawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeMobileDrawer);

  document.querySelectorAll(".drawer-link").forEach((link) => {
    link.addEventListener("click", closeMobileDrawer);
  });
});

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

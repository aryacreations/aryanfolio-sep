/**
 * ARYAN PORTFOLIO ADMIN PANEL ENGINE (admin.js)
 * Features:
 * - Comprehensive CRUD across ALL sections:
 *   1. Profile & Hero (Bio, Badges, Avatar upload, Resume URL)
 *   2. Key Metrics (Add, Edit, Delete metrics)
 *   3. About & Story (Lead, Narrative, Quick facts, Add/Edit/Delete Principles)
 *   4. Technical Arsenal (Add, Edit Modal, Delete Skill categories, Tag management)
 *   5. Projects Manager (Add, Edit Modal, Delete, Flagship toggle, Architecture specs)
 *   6. Experience & Leadership (Add, Edit Modal, Delete roles, Leadership community banner)
 *   7. Education & Certifications (Add, Edit Modal, Delete certs, Degree details)
 *   8. Contact Channels (Email, Phone, LinkedIn, GitHub)
 *   9. JSON Export, Import & Factory Reset
 * - Live auto-save with debounce & disk persistence via /api/save
 * - Instant cross-tab sync via BroadcastChannel & storage events
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) window.lucide.createIcons();

  // Load current portfolio data state
  let currentData = getPortfolioData();

  // Synchronize with server disk persistence & MongoDB Atlas
  if (typeof syncWithServerData === "function") {
    syncWithServerData().then(() => {
      currentData = getPortfolioData();
      populateAllForms();
    });
  }

  // Check MongoDB connection status
  fetch("/api/db-status")
    .then((r) => r.json())
    .then((status) => {
      const badge = document.getElementById("mongoStatusBadge");
      if (badge && status.connected) {
        badge.innerHTML = '<span class="status-dot" style="background: #10b981;"></span><span>MONGODB ATLAS CONNECTED</span>';
        badge.style.borderColor = "#10b981";
        badge.style.color = "#34d399";
      } else if (badge) {
        badge.innerHTML = '<span class="status-dot" style="background: #f59e0b;"></span><span>MONGODB LOCAL MODE</span>';
      }
    })
    .catch(() => {});

  // DOM Elements - Tab Switching
  const tabBtns = document.querySelectorAll(".nav-tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(btn.getAttribute("data-tab"));
      if (targetPane) targetPane.classList.add("active");

      if (window.lucide) window.lucide.createIcons();
    });
  });

  // Crash-proof Toast Notification
  const toast = document.getElementById("adminToast");
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    const span = toast.querySelector("span") || toast;
    span.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function getVal(id, fallback = "") {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  }

  // Master Form Populator
  function populateAllForms() {
    // 1. Profile / Hero
    const p = currentData.profile || {};
    setVal("profileName", p.name || "");
    setVal("profileEyebrow", p.eyebrow || "");
    setVal("profileTaglineLine2", p.taglineLine2 || "");
    setVal("profileBio", p.bio || "");
    setVal("profileStatusBadge", p.statusBadge || "");
    setVal("profileRoleCaption", p.roleCaption || "");
    setVal("profileEduBrief", p.educationBrief || "");
    setVal("profileResumeUrl", p.resumeUrl || "assets/Aryan_resw.pdf");
    setVal("profileAvatarUrl", p.avatar || "https://res.cloudinary.com/su1rtayw/image/upload/v1791280125/gtercet5mc8m4ri7nzkt.jpg");

    const previewImg = document.getElementById("avatarPreviewImg");
    if (previewImg) previewImg.src = p.avatar || "https://res.cloudinary.com/su1rtayw/image/upload/v1791280125/gtercet5mc8m4ri7nzkt.jpg";

    // 2. Metrics Bar
    renderMetricsList();

    // 3. About & Principles
    const ab = currentData.about || {};
    setVal("aboutTitle", ab.title || "");
    setVal("aboutLead", ab.lead || "");
    setVal("aboutParagraph", ab.paragraph || "");

    const qf = ab.quickFacts || {};
    setVal("factLocation", qf.location || "");
    setVal("factDegree", qf.degree || "");
    setVal("factCgpa", qf.cgpa || "");
    setVal("factPhone", qf.phone || "");

    renderPrinciplesList();

    // 4. Skills & Technical Arsenal
    renderSkillsList();

    // 5. Projects
    renderProjectsList();

    // 6. Experience & Leadership
    renderExperienceList();
    const ld = currentData.leadership || {};
    setVal("leadTitle", ld.title || "");
    setVal("leadOrg", ld.org || "");
    setVal("leadDesc", ld.desc || "");
    setVal("leadStat1", ld.stat1Num ? `${ld.stat1Num} · ${ld.stat1Txt}` : "50+ · Students Mentored");
    setVal("leadStat2", ld.stat2Num ? `${ld.stat2Num} · ${ld.stat2Txt}` : "10+ · Sprint Sessions");

    // 7. Education & Certs
    renderCertsList();
    const ed = currentData.education || {};
    setVal("eduDegree", ed.degree || "");
    setVal("eduUni", ed.university || "");
    setVal("eduCgpa", ed.cgpa || "");
    setVal("eduYear", ed.yearTag || "");
    setVal("eduLoc", ed.location || "");
    setVal("eduCoursework", (ed.coursework || []).join(", "));
    setVal("eduQuote", ed.quote || "");

    // 8. Contact Channels
    setVal("contactEmail", p.email || "");
    setVal("contactPhone", p.phone || "");
    setVal("contactLinkedIn", p.linkedinUrl || "");
    setVal("contactGitHub", p.githubUrl || "");

    if (window.lucide) window.lucide.createIcons();
    attachLiveAutoSaveListeners();
  }

  // =========================================================================
  // 1. KEY METRICS MANAGER (ADD / EDIT / DELETE)
  // =========================================================================
  function renderMetricsList() {
    const container = document.getElementById("metricsListContainer");
    if (!container) return;
    const metrics = currentData.metrics || [];

    if (metrics.length === 0) {
      container.innerHTML = `<div class="admin-card"><p style="color: var(--admin-ink-muted);">No metrics added. Click "+ Add Metric" above to create one.</p></div>`;
      return;
    }

    container.innerHTML = metrics
      .map(
        (m, idx) => `
      <div class="item-row-card metric-row-card" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="display: flex; gap: 16px; flex: 1; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0; min-width: 140px; flex: 1;">
            <label style="font-size: 0.72rem;">Metric Value / Stat</label>
            <input type="text" class="m-num" data-idx="${idx}" value="${escapeHtml(m.number)}" placeholder="500+">
          </div>
          <div class="form-group" style="margin-bottom: 0; min-width: 220px; flex: 2;">
            <label style="font-size: 0.72rem;">Metric Description Label</label>
            <input type="text" class="m-lbl" data-idx="${idx}" value="${escapeHtml(m.label)}" placeholder="Extension Downloads">
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn-adm btn-adm-sm btn-adm-danger delete-metric-btn" data-idx="${idx}" title="Delete this metric">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    // Delete handler
    container.querySelectorAll(".delete-metric-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= metrics.length) return;
        const label = metrics[idx]?.label || metrics[idx]?.number || "Metric";
        metrics.splice(idx, 1);
        currentData.metrics = metrics;
        savePortfolioData(currentData);
        renderMetricsList();
        showToast(`Deleted metric "${label}" & synced to MongoDB!`);
      });
    });

    attachLiveAutoSaveListeners();
  }

  const addMetricBtn = document.getElementById("addNewMetricBtn");
  if (addMetricBtn) {
    addMetricBtn.addEventListener("click", () => {
      currentData.metrics = currentData.metrics || [];
      const newIndex = currentData.metrics.length;
      currentData.metrics.push({
        number: "100+",
        label: "New Impact Metric"
      });
      savePortfolioData(currentData);
      renderMetricsList();
      showToast("New metric added! Customize values in place.");
      setTimeout(() => {
        const rows = document.querySelectorAll(".metric-row-card");
        if (rows[newIndex]) {
          rows[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
          const inp = rows[newIndex].querySelector(".m-num");
          if (inp) {
            inp.focus();
            inp.select();
          }
        }
      }, 60);
    });
  }

  // =========================================================================
  // 2. PRINCIPLES MANAGER (ADD / EDIT / DELETE)
  // =========================================================================
  function renderPrinciplesList() {
    const container = document.getElementById("principlesContainer");
    if (!container) return;
    currentData.about = currentData.about || {};
    const principles = currentData.about.principles || [];

    if (principles.length === 0) {
      container.innerHTML = `<p style="color: var(--admin-ink-muted); padding: 12px;">No principles created yet. Click "+ Add Principle" above to add one.</p>`;
      return;
    }

    container.innerHTML = principles
      .map(
        (pr, idx) => `
      <div class="principle-card" style="background: var(--admin-card-inner); padding: 16px; border: 1.5px solid var(--admin-border); border-radius: 4px; margin-bottom: 14px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent-gold); font-weight: 700;">// PRINCIPLE #${idx + 1}</span>
          <button class="btn-adm btn-adm-sm btn-adm-danger delete-principle-btn" data-idx="${idx}" title="Delete principle">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
        <div class="form-grid-2">
          <div class="form-group" style="margin-bottom: 8px;">
            <label>Marker Icon</label>
            <input type="text" class="pr-marker" data-idx="${idx}" value="${escapeHtml(pr.marker || "✦")}">
          </div>
          <div class="form-group" style="margin-bottom: 8px;">
            <label>Principle Title</label>
            <input type="text" class="pr-title" data-idx="${idx}" value="${escapeHtml(pr.title)}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>Principle Description</label>
          <textarea class="pr-desc" rows="2" data-idx="${idx}">${escapeHtml(pr.desc)}</textarea>
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    // Delete handler
    container.querySelectorAll(".delete-principle-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= principles.length) return;
        const title = principles[idx]?.title || `Principle #${idx + 1}`;
        principles.splice(idx, 1);
        currentData.about.principles = principles;
        savePortfolioData(currentData);
        renderPrinciplesList();
        showToast(`Deleted principle "${title}" & synced to MongoDB!`);
      });
    });

    attachLiveAutoSaveListeners();
  }

  const addPrincipleBtn = document.getElementById("addNewPrincipleBtn");
  if (addPrincipleBtn) {
    addPrincipleBtn.addEventListener("click", () => {
      currentData.about = currentData.about || {};
      currentData.about.principles = currentData.about.principles || [];
      const newIndex = currentData.about.principles.length;
      currentData.about.principles.push({
        marker: "✦",
        title: "NEW ENGINEERING PRINCIPLE",
        desc: "High reliability architectural pattern combining fast response times with deterministic safety."
      });
      savePortfolioData(currentData);
      renderPrinciplesList();
      showToast("New principle added! Customize fields below.");
      setTimeout(() => {
        const cards = document.querySelectorAll(".principle-card");
        if (cards[newIndex]) {
          cards[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
          const titleInp = cards[newIndex].querySelector(".pr-title");
          if (titleInp) {
            titleInp.focus();
            titleInp.select();
          }
        }
      }, 60);
    });
  }

  // =========================================================================
  // 3. TECHNICAL ARSENAL & SKILLS (MODAL CRUD + INLINE EDIT)
  // =========================================================================
  function renderSkillsList() {
    const container = document.getElementById("skillsAdminContainer");
    if (!container) return;
    const skills = currentData.skills || [];

    if (skills.length === 0) {
      container.innerHTML = `<div class="admin-card"><p style="color: var(--admin-ink-muted);">No skill categories currently configured. Click "+ Add Skill Category" above.</p></div>`;
      return;
    }

    container.innerHTML = skills
      .map(
        (sk, idx) => `
      <div class="admin-card skill-admin-block" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--admin-border); padding-bottom: 10px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="${sk.icon || "code"}" style="color: var(--color-accent-gold);"></i>
            <h3 style="font-family: var(--font-display); font-size: 1.1rem; color: var(--admin-ink); margin: 0;">${escapeHtml(sk.title)}</h3>
            <span class="admin-chip" style="background: ${sk.isGold ? "var(--color-accent-gold)" : "rgba(255,255,255,0.1)"}; color: #111;">${escapeHtml(sk.chip || "STACK")}</span>
            <span class="admin-chip" style="background: #2EC4B6; color: #0F1714; font-weight: 800;">${sk.proficiency || 95}% · ${escapeHtml(sk.level || "EXPERT")}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-adm btn-adm-sm btn-adm-outline edit-skill-modal-btn" data-idx="${idx}">
              <i data-lucide="edit"></i> Edit in Modal
            </button>
            <button class="btn-adm btn-adm-sm btn-adm-danger delete-skill-btn" data-idx="${idx}">
              <i data-lucide="trash-2"></i> Delete Domain
            </button>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label>Domain Title</label>
            <input type="text" class="sk-title" data-idx="${idx}" value="${escapeHtml(sk.title)}">
          </div>
          <div class="form-group">
            <label>Card Chip / Badge</label>
            <input type="text" class="sk-chip" data-idx="${idx}" value="${escapeHtml(sk.chip || "")}">
          </div>
          <div class="form-group">
            <label>Featured Gold Card?</label>
            <select class="sk-gold" data-idx="${idx}">
              <option value="true" ${sk.isGold ? "selected" : ""}>Yes (Gold Highlight)</option>
              <option value="false" ${!sk.isGold ? "selected" : ""}>No (Standard Card)</option>
            </select>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label>Proficiency (0-100%)</label>
            <input type="number" class="sk-proficiency" data-idx="${idx}" value="${sk.proficiency || 95}" min="50" max="100">
          </div>
          <div class="form-group">
            <label>Level Badge</label>
            <input type="text" class="sk-level" data-idx="${idx}" value="${escapeHtml(sk.level || "EXPERT")}">
          </div>
          <div class="form-group">
            <label>Experience / Rating</label>
            <input type="text" class="sk-exp" data-idx="${idx}" value="${escapeHtml(sk.exp || "Production-Ready")}">
          </div>
        </div>

        <div class="form-group">
          <label>Summary Description</label>
          <input type="text" class="sk-summary" data-idx="${idx}" value="${escapeHtml(sk.summary || "")}">
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label>Skill Tags (Comma-Separated)</label>
          <input type="text" class="sk-tags" data-idx="${idx}" value="${escapeHtml((sk.tags || []).join(", "))}">
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    // Event Handlers
    container.querySelectorAll(".delete-skill-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= skills.length) return;
        const title = skills[idx]?.title || "Skill Category";
        skills.splice(idx, 1);
        currentData.skills = skills;
        savePortfolioData(currentData);
        renderSkillsList();
        showToast(`Deleted skill category "${title}" & synced to MongoDB!`);
      });
    });

    container.querySelectorAll(".edit-skill-modal-btn").forEach((b) => {
      b.addEventListener("click", () => {
        openSkillModal(parseInt(b.getAttribute("data-idx")));
      });
    });

    attachLiveAutoSaveListeners();
  }

  // Universal Modal Helpers
  function openModal(modalEl, focusInputId) {
    if (!modalEl) return;
    modalEl.classList.add("active", "open");
    modalEl.style.display = "flex";
    modalEl.style.visibility = "visible";
    modalEl.style.opacity = "1";
    modalEl.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
    if (focusInputId) {
      setTimeout(() => {
        const inp = document.getElementById(focusInputId);
        if (inp) {
          inp.focus();
          if (inp.select) inp.select();
        }
      }, 60);
    }
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("active", "open");
    modalEl.style.display = "none";
    modalEl.style.visibility = "hidden";
    modalEl.style.opacity = "0";
    modalEl.style.pointerEvents = "none";
    document.body.style.overflow = "";
  }

  // Skill Editor Modal
  const skillModal = document.getElementById("skillEditorModal");
  const skillModalBackdrop = document.getElementById("skillModalBackdrop");
  const closeSkillBtn = document.getElementById("closeSkillModalBtn");
  const cancelSkillBtn = document.getElementById("cancelSkillModalBtn");
  const saveSkillBtn = document.getElementById("saveSkillItemBtn");
  const addSkillBtn = document.getElementById("addNewSkillBtn");

  function openSkillModal(idx = -1) {
    if (!skillModal) return;
    document.getElementById("editSkillIndex").value = idx;
    const isNew = idx === -1;
    document.getElementById("skillModalHeading").textContent = isNew ? "Add New Skill Category" : "Edit Skill Category";

    if (isNew) {
      setVal("editSkillTitle", "");
      setVal("editSkillChip", "STACK");
      setVal("editSkillGold", "false");
      setVal("editSkillIcon", "code");
      setVal("editSkillProficiency", "95");
      setVal("editSkillLevel", "EXPERT");
      setVal("editSkillExp", "2+ Yrs · ★ 4.9/5.0");
      setVal("editSkillSummary", "");
      setVal("editSkillTags", "");
    } else {
      const sk = currentData.skills[idx];
      setVal("editSkillTitle", sk.title || "");
      setVal("editSkillChip", sk.chip || "");
      setVal("editSkillGold", sk.isGold ? "true" : "false");
      setVal("editSkillIcon", sk.icon || "code");
      setVal("editSkillProficiency", sk.proficiency || 95);
      setVal("editSkillLevel", sk.level || "EXPERT");
      setVal("editSkillExp", sk.exp || "Production-Ready");
      setVal("editSkillSummary", sk.summary || "");
      setVal("editSkillTags", (sk.tags || []).join(", "));
    }

    openModal(skillModal, "editSkillTitle");
  }

  function closeSkillModal() {
    closeModal(skillModal);
  }

  if (addSkillBtn) addSkillBtn.addEventListener("click", () => openSkillModal(-1));
  if (closeSkillBtn) closeSkillBtn.addEventListener("click", closeSkillModal);
  if (cancelSkillBtn) cancelSkillBtn.addEventListener("click", closeSkillModal);
  if (skillModalBackdrop) skillModalBackdrop.addEventListener("click", closeSkillModal);

  if (saveSkillBtn) {
    saveSkillBtn.addEventListener("click", () => {
      const idx = parseInt(document.getElementById("editSkillIndex").value);
      const title = getVal("editSkillTitle").trim();
      if (!title) {
        alert("Please enter a Domain Title");
        return;
      }

      const tagsArray = getVal("editSkillTags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const profVal = parseInt(getVal("editSkillProficiency"), 10) || 95;
      const skillObj = {
        id: idx === -1 ? `skill-${Date.now()}` : currentData.skills[idx].id || `skill-${idx}`,
        title: title,
        chip: getVal("editSkillChip").trim() || "STACK",
        isGold: getVal("editSkillGold") === "true",
        icon: getVal("editSkillIcon").trim() || "code",
        proficiency: profVal,
        level: getVal("editSkillLevel") || (profVal >= 95 ? "MASTER" : profVal >= 90 ? "EXPERT" : "ADVANCED"),
        exp: getVal("editSkillExp").trim() || "Production-Ready",
        rating: "4.9/5.0",
        summary: getVal("editSkillSummary").trim(),
        tags: tagsArray
      };

      currentData.skills = currentData.skills || [];
      if (idx === -1) {
        currentData.skills.push(skillObj);
      } else {
        currentData.skills[idx] = skillObj;
      }

      savePortfolioData(currentData);
      renderSkillsList();
      closeSkillModal();
      showToast("Skill domain saved and live updated!");
    });
  }

  // =========================================================================
  // 4. PROJECTS MANAGER (ADD / EDIT MODAL / DELETE)
  // =========================================================================
  function renderProjectsList() {
    const container = document.getElementById("projectsListContainer");
    if (!container) return;
    const projects = currentData.projects || [];

    if (projects.length === 0) {
      container.innerHTML = `<div class="admin-card"><p style="color: var(--admin-ink-muted);">No projects currently created. Click "+ Add New Project" to add one.</p></div>`;
      return;
    }

    container.innerHTML = projects
      .map(
        (proj, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(proj.title)}</span>
            ${proj.isFeatured ? '<span class="admin-chip" style="background: var(--color-accent-gold); color: #111;">FLAGSHIP</span>' : ""}
            <span class="admin-chip" style="background: rgba(255,255,255,0.1); color: var(--admin-ink);">${escapeHtml(proj.category || "General")}</span>
          </div>
          <div class="item-row-sub">
            <span>Year: ${escapeHtml(proj.year || "2026")}</span> · 
            <span>Tags: ${(proj.tags || []).slice(0, 4).join(", ")}${(proj.tags || []).length > 4 ? "..." : ""}</span>
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn-adm btn-adm-sm btn-adm-outline edit-project-btn" data-idx="${idx}">
            <i data-lucide="edit"></i> Edit
          </button>
          <button class="btn-adm btn-adm-sm btn-adm-danger delete-project-btn" data-idx="${idx}">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll(".edit-project-btn").forEach((b) => {
      b.addEventListener("click", () => openProjectModal(parseInt(b.getAttribute("data-idx"))));
    });

    container.querySelectorAll(".delete-project-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= projects.length) return;
        const title = projects[idx]?.title || "Project";
        projects.splice(idx, 1);
        currentData.projects = projects;
        savePortfolioData(currentData);
        renderProjectsList();
        showToast(`Deleted project "${title}" & synced to MongoDB!`);
      });
    });
  }

  // Project Editor Modal Elements
  const projectModal = document.getElementById("projectEditorModal");
  const projectModalBackdrop = document.getElementById("projectModalBackdrop");
  const closeProjBtn = document.getElementById("closeProjectModalBtn");
  const cancelProjBtn = document.getElementById("cancelProjectModalBtn");
  const saveProjBtn = document.getElementById("saveProjectItemBtn");
  const addProjBtn = document.getElementById("addNewProjectBtn");

  function openProjectModal(index = -1) {
    if (!projectModal) return;
    document.getElementById("editProjIndex").value = index;
    const isNew = index === -1;
    document.getElementById("projectModalHeading").textContent = isNew ? "Add New Project" : "Edit Project";

    if (isNew) {
      setVal("editProjTitle", "");
      setVal("editProjCategory", "ai-agents");
      setVal("editProjYear", "2026");
      setVal("editProjBadge", "★ FLAGSHIP AI PROJECT");
      setVal("editProjFeatured", "true");
      setVal("editProjTagline", "");
      setVal("editProjStats", "");
      setVal("editProjBullets", "");
      setVal("editProjTags", "");
      setVal("editProjGithub", "https://github.com/aryacreations");
      setVal("editProjHasDetails", "true");
    } else {
      const p = currentData.projects[index];
      setVal("editProjTitle", p.title || "");
      setVal("editProjCategory", p.category || "ai-agents");
      setVal("editProjYear", p.year || "2026");
      setVal("editProjBadge", p.badge || "");
      setVal("editProjFeatured", p.isFeatured ? "true" : "false");
      setVal("editProjTagline", p.tagline || "");

      const statsStr = (p.stats || []).map((s) => `${s.strong}: ${s.text}`).join(" | ");
      setVal("editProjStats", statsStr);
      setVal("editProjBullets", (p.bullets || []).join("\n"));
      setVal("editProjTags", (p.tags || []).join(", "));
      setVal("editProjGithub", p.githubUrl || "");
      setVal("editProjHasDetails", p.hasDetails ? "true" : "false");
    }

    openModal(projectModal, "editProjTitle");
  }

  function closeProjectModal() {
    closeModal(projectModal);
  }

  if (addProjBtn) addProjBtn.addEventListener("click", () => openProjectModal(-1));
  if (closeProjBtn) closeProjBtn.addEventListener("click", closeProjectModal);
  if (cancelProjBtn) cancelProjBtn.addEventListener("click", closeProjectModal);
  if (projectModalBackdrop) projectModalBackdrop.addEventListener("click", closeProjectModal);

  if (saveProjBtn) {
    saveProjBtn.addEventListener("click", () => {
      const idx = parseInt(document.getElementById("editProjIndex").value);
      const title = getVal("editProjTitle").trim();
      if (!title) {
        alert("Please enter a Project Title");
        return;
      }

      const statsRaw = getVal("editProjStats");
      const stats = statsRaw
        .split("|")
        .map((s) => {
          const parts = s.split(":");
          return {
            strong: (parts[0] || "").trim(),
            text: (parts[1] || "").trim()
          };
        })
        .filter((s) => s.strong || s.text);

      const bullets = getVal("editProjBullets")
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);

      const tags = getVal("editProjTags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const projectObj = {
        id: idx === -1 ? `proj-${Date.now()}` : currentData.projects[idx].id || `proj-${idx}`,
        title: title,
        category: getVal("editProjCategory"),
        year: getVal("editProjYear") || "2026",
        badge: getVal("editProjBadge") || "PROJECT",
        badgeType: getVal("editProjFeatured") === "true" ? "featured" : "default",
        isFeatured: getVal("editProjFeatured") === "true",
        tagline: getVal("editProjTagline"),
        stats: stats,
        bullets: bullets,
        tags: tags,
        githubUrl: getVal("editProjGithub") || "https://github.com/aryacreations",
        hasDetails: getVal("editProjHasDetails") === "true"
      };

      currentData.projects = currentData.projects || [];
      if (idx === -1) {
        currentData.projects.unshift(projectObj);
      } else {
        currentData.projects[idx] = projectObj;
      }

      savePortfolioData(currentData);
      renderProjectsList();
      closeProjectModal();
      showToast("Project saved & published!");
    });
  }

  // =========================================================================
  // 5. WORK EXPERIENCE MANAGER (MODAL CRUD)
  // =========================================================================
  function renderExperienceList() {
    const container = document.getElementById("experienceListContainer");
    if (!container) return;
    const expList = currentData.experience || [];

    if (expList.length === 0) {
      container.innerHTML = `<div class="admin-card"><p style="color: var(--admin-ink-muted);">No experience entries added. Click "+ Add Experience" above.</p></div>`;
      return;
    }

    container.innerHTML = expList
      .map(
        (exp, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(exp.role)}</span>
            <span class="admin-chip" style="background: var(--color-accent-blue); color: #111;">${escapeHtml(exp.company)}</span>
            ${exp.isGold ? '<span class="admin-chip" style="background: var(--color-accent-gold); color: #111;">FEATURED</span>' : ""}
          </div>
          <div class="item-row-sub">
            <span>${escapeHtml(exp.period || "")}</span> · 
            <span>Tags: ${(exp.tags || []).join(", ")}</span>
          </div>
        </div>
        <div class="item-row-actions">
          <button class="btn-adm btn-adm-sm btn-adm-outline edit-exp-btn" data-idx="${idx}">
            <i data-lucide="edit"></i> Edit
          </button>
          <button class="btn-adm btn-adm-sm btn-adm-danger delete-exp-btn" data-idx="${idx}">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll(".delete-exp-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= expList.length) return;
        const role = expList[idx]?.role || "Experience";
        expList.splice(idx, 1);
        currentData.experience = expList;
        savePortfolioData(currentData);
        renderExperienceList();
        showToast(`Deleted experience "${role}" & synced to MongoDB!`);
      });
    });

    container.querySelectorAll(".edit-exp-btn").forEach((b) => {
      b.addEventListener("click", () => {
        openExpModal(parseInt(b.getAttribute("data-idx")));
      });
    });
  }

  // Experience Modal
  const expModal = document.getElementById("expEditorModal");
  const expModalBackdrop = document.getElementById("expModalBackdrop");
  const closeExpBtn = document.getElementById("closeExpModalBtn");
  const cancelExpBtn = document.getElementById("cancelExpModalBtn");
  const saveExpBtn = document.getElementById("saveExpItemBtn");
  const addExpBtn = document.getElementById("addNewExpBtn");

  function openExpModal(idx = -1) {
    if (!expModal) return;
    document.getElementById("editExpIndex").value = idx;
    const isNew = idx === -1;
    document.getElementById("expModalHeading").textContent = isNew ? "Add Work Experience" : "Edit Work Experience";

    if (isNew) {
      setVal("editExpRole", "");
      setVal("editExpCompany", "");
      setVal("editExpPeriod", "Dec 2025 – Present | Remote");
      setVal("editExpBadge", "FREELANCE ROLE");
      setVal("editExpGold", "false");
      setVal("editExpPoints", "");
      setVal("editExpTags", "");
    } else {
      const exp = currentData.experience[idx];
      setVal("editExpRole", exp.role || "");
      setVal("editExpCompany", exp.company || "");
      setVal("editExpPeriod", exp.period || "");
      setVal("editExpBadge", exp.badge || "ROLE");
      setVal("editExpGold", exp.isGold ? "true" : "false");
      setVal("editExpPoints", (exp.points || []).join("\n"));
      setVal("editExpTags", (exp.tags || []).join(", "));
    }

    openModal(expModal, "editExpRole");
  }

  function closeExpModal() {
    closeModal(expModal);
  }

  if (addExpBtn) addExpBtn.addEventListener("click", () => openExpModal(-1));
  if (closeExpBtn) closeExpBtn.addEventListener("click", closeExpModal);
  if (cancelExpBtn) cancelExpBtn.addEventListener("click", closeExpModal);
  if (expModalBackdrop) expModalBackdrop.addEventListener("click", closeExpModal);

  if (saveExpBtn) {
    saveExpBtn.addEventListener("click", () => {
      const idx = parseInt(document.getElementById("editExpIndex").value);
      const role = getVal("editExpRole").trim();
      if (!role) {
        alert("Please enter a Role / Position Title");
        return;
      }

      const points = getVal("editExpPoints")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const tags = getVal("editExpTags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const expObj = {
        id: idx === -1 ? `exp-${Date.now()}` : currentData.experience[idx].id || `exp-${idx}`,
        role: role,
        company: getVal("editExpCompany").trim() || "Freelance",
        period: getVal("editExpPeriod").trim() || "2026",
        badge: getVal("editExpBadge").trim() || "ROLE",
        isGold: getVal("editExpGold") === "true",
        points: points,
        tags: tags
      };

      currentData.experience = currentData.experience || [];
      if (idx === -1) {
        currentData.experience.unshift(expObj);
      } else {
        currentData.experience[idx] = expObj;
      }

      savePortfolioData(currentData);
      renderExperienceList();
      closeExpModal();
      showToast("Experience item saved!");
    });
  }

  // =========================================================================
  // 6. CERTIFICATIONS MANAGER (MODAL CRUD)
  // =========================================================================
  function renderCertsList() {
    const container = document.getElementById("certsListContainer");
    if (!container) return;
    const certs = currentData.certifications || [];

    if (certs.length === 0) {
      container.innerHTML = `<p style="color: var(--admin-ink-muted); padding: 12px;">No certifications added yet. Click "+ Add Certification" above.</p>`;
      return;
    }

    container.innerHTML = certs
      .map(
        (c, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(c.name)}</span>
            <span class="admin-chip">${escapeHtml(c.issuer)}</span>
            <span class="admin-chip" style="background: rgba(255,255,255,0.1); color: var(--admin-ink);">${escapeHtml(c.badge || "Verified")}</span>
          </div>
          <div class="item-row-sub">${escapeHtml(c.desc || "")}</div>
        </div>
        <div class="item-row-actions">
          <button class="btn-adm btn-adm-sm btn-adm-outline edit-cert-btn" data-idx="${idx}">
            <i data-lucide="edit"></i> Edit
          </button>
          <button class="btn-adm btn-adm-sm btn-adm-danger delete-cert-btn" data-idx="${idx}">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
      </div>
    `
      )
      .join("");

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll(".delete-cert-btn").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(b.getAttribute("data-idx"));
        if (isNaN(idx) || idx < 0 || idx >= certs.length) return;
        const name = certs[idx]?.name || "Certification";
        certs.splice(idx, 1);
        currentData.certifications = certs;
        savePortfolioData(currentData);
        renderCertsList();
        showToast(`Deleted certification "${name}" & synced to MongoDB!`);
      });
    });

    container.querySelectorAll(".edit-cert-btn").forEach((b) => {
      b.addEventListener("click", () => {
        openCertModal(parseInt(b.getAttribute("data-idx")));
      });
    });
  }

  // Cert Modal
  const certModal = document.getElementById("certEditorModal");
  const certModalBackdrop = document.getElementById("certModalBackdrop");
  const closeCertBtn = document.getElementById("closeCertModalBtn");
  const cancelCertBtn = document.getElementById("cancelCertModalBtn");
  const saveCertBtn = document.getElementById("saveCertItemBtn");
  const addCertBtn = document.getElementById("addNewCertBtn");

  function openCertModal(idx = -1) {
    if (!certModal) return;
    document.getElementById("editCertIndex").value = idx;
    const isNew = idx === -1;
    document.getElementById("certModalHeading").textContent = isNew ? "Add Certification" : "Edit Certification";

    if (isNew) {
      setVal("editCertName", "");
      setVal("editCertIssuer", "");
      setVal("editCertBadge", "Verified");
      setVal("editCertIcon", "award");
      setVal("editCertDesc", "");
    } else {
      const c = currentData.certifications[idx];
      setVal("editCertName", c.name || "");
      setVal("editCertIssuer", c.issuer || "");
      setVal("editCertBadge", c.badge || "Verified");
      setVal("editCertIcon", c.icon || "award");
      setVal("editCertDesc", c.desc || "");
    }

    openModal(certModal, "editCertName");
  }

  function closeCertModal() {
    closeModal(certModal);
  }

  if (addCertBtn) addCertBtn.addEventListener("click", () => openCertModal(-1));
  if (closeCertBtn) closeCertBtn.addEventListener("click", closeCertModal);
  if (cancelCertBtn) cancelCertBtn.addEventListener("click", closeCertModal);
  if (certModalBackdrop) certModalBackdrop.addEventListener("click", closeCertModal);

  if (saveCertBtn) {
    saveCertBtn.addEventListener("click", () => {
      const idx = parseInt(document.getElementById("editCertIndex").value);
      const name = getVal("editCertName").trim();
      if (!name) {
        alert("Please enter a Certification Name");
        return;
      }

      const certObj = {
        id: idx === -1 ? `cert-${Date.now()}` : currentData.certifications[idx].id || `cert-${idx}`,
        name: name,
        issuer: getVal("editCertIssuer").trim() || "Verified Organization",
        badge: getVal("editCertBadge").trim() || "Verified",
        icon: getVal("editCertIcon").trim() || "award",
        desc: getVal("editCertDesc").trim()
      };

      currentData.certifications = currentData.certifications || [];
      if (idx === -1) {
        currentData.certifications.unshift(certObj);
      } else {
        currentData.certifications[idx] = certObj;
      }

      savePortfolioData(currentData);
      renderCertsList();
      closeCertModal();
      showToast("Certification saved!");
    });
  }

  // Global Escape key listener to close active modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSkillModal();
      closeProjectModal();
      closeExpModal();
      closeCertModal();
    }
  });

  // =========================================================================
  // 7. FORM DATA COLLECTION & PERSISTENCE
  // =========================================================================
  function collectAllData() {
    // Profile
    currentData.profile = currentData.profile || {};
    currentData.profile.name = getVal("profileName", currentData.profile.name);
    currentData.profile.eyebrow = getVal("profileEyebrow", currentData.profile.eyebrow);
    currentData.profile.taglineLine1 = currentData.profile.name;
    currentData.profile.taglineLine2 = getVal("profileTaglineLine2", currentData.profile.taglineLine2);
    currentData.profile.bio = getVal("profileBio", currentData.profile.bio);
    currentData.profile.statusBadge = getVal("profileStatusBadge", currentData.profile.statusBadge);
    currentData.profile.roleCaption = getVal("profileRoleCaption", currentData.profile.roleCaption);
    currentData.profile.educationBrief = getVal("profileEduBrief", currentData.profile.educationBrief);
    currentData.profile.resumeUrl = getVal("profileResumeUrl", currentData.profile.resumeUrl);
    currentData.profile.avatar = getVal("profileAvatarUrl", currentData.profile.avatar);

    currentData.profile.email = getVal("contactEmail", currentData.profile.email);
    currentData.profile.phone = getVal("contactPhone", currentData.profile.phone);
    currentData.profile.linkedinUrl = getVal("contactLinkedIn", currentData.profile.linkedinUrl);
    currentData.profile.githubUrl = getVal("contactGitHub", currentData.profile.githubUrl);

    // Metrics collection from DOM rows
    const mNums = document.querySelectorAll(".m-num");
    const mLbls = document.querySelectorAll(".m-lbl");
    if (mNums.length > 0) {
      currentData.metrics = [];
      mNums.forEach((numInput, i) => {
        currentData.metrics.push({
          number: numInput.value,
          label: mLbls[i]?.value || ""
        });
      });
    }

    // About Narrative & Facts
    currentData.about = currentData.about || {};
    currentData.about.title = getVal("aboutTitle", currentData.about.title);
    currentData.about.lead = getVal("aboutLead", currentData.about.lead);
    currentData.about.paragraph = getVal("aboutParagraph", currentData.about.paragraph);
    currentData.about.quickFacts = {
      location: getVal("factLocation", "Bhilai, Chhattisgarh, India"),
      degree: getVal("factDegree", "B.Tech Computer Science (2027)"),
      cgpa: getVal("factCgpa", "7.8 / 10.0"),
      phone: getVal("factPhone", "+91-9334706652")
    };

    // Principles collection
    const prMarkers = document.querySelectorAll(".pr-marker");
    const prTitles = document.querySelectorAll(".pr-title");
    const prDescs = document.querySelectorAll(".pr-desc");
    if (prTitles.length > 0) {
      currentData.about.principles = [];
      prTitles.forEach((t, i) => {
        currentData.about.principles.push({
          marker: prMarkers[i]?.value || "✦",
          title: t.value,
          desc: prDescs[i]?.value || ""
        });
      });
    }

    // Skills inline collection
    const skTitles = document.querySelectorAll(".sk-title");
    const skChips = document.querySelectorAll(".sk-chip");
    const skGolds = document.querySelectorAll(".sk-gold");
    const skProfs = document.querySelectorAll(".sk-proficiency");
    const skLevels = document.querySelectorAll(".sk-level");
    const skExps = document.querySelectorAll(".sk-exp");
    const skSummaries = document.querySelectorAll(".sk-summary");
    const skTags = document.querySelectorAll(".sk-tags");

    if (skTitles.length > 0) {
      currentData.skills = currentData.skills || [];
      skTitles.forEach((t, i) => {
        const tagArray = (skTags[i]?.value || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        if (currentData.skills[i]) {
          currentData.skills[i].title = t.value;
          currentData.skills[i].chip = skChips[i]?.value || "";
          currentData.skills[i].isGold = skGolds[i]?.value === "true";
          currentData.skills[i].proficiency = parseInt(skProfs[i]?.value, 10) || currentData.skills[i].proficiency || 95;
          currentData.skills[i].level = skLevels[i]?.value || currentData.skills[i].level || "EXPERT";
          currentData.skills[i].exp = skExps[i]?.value || currentData.skills[i].exp || "Production-Ready";
          currentData.skills[i].summary = skSummaries[i]?.value || "";
          currentData.skills[i].tags = tagArray;
        }
      });
    }

    // Leadership
    currentData.leadership = currentData.leadership || {};
    currentData.leadership.title = getVal("leadTitle", currentData.leadership.title);
    currentData.leadership.org = getVal("leadOrg", currentData.leadership.org);
    currentData.leadership.desc = getVal("leadDesc", currentData.leadership.desc);

    const lead1Raw = getVal("leadStat1", "");
    if (lead1Raw) {
      const parts = lead1Raw.includes("·") ? lead1Raw.split("·") : lead1Raw.split(" ");
      currentData.leadership.stat1Num = parts[0]?.trim() || "50+";
      currentData.leadership.stat1Txt = parts.slice(1).join(" ").trim() || "Students Mentored";
    }

    const lead2Raw = getVal("leadStat2", "");
    if (lead2Raw) {
      const parts = lead2Raw.includes("·") ? lead2Raw.split("·") : lead2Raw.split(" ");
      currentData.leadership.stat2Num = parts[0]?.trim() || "10+";
      currentData.leadership.stat2Txt = parts.slice(1).join(" ").trim() || "Sprint Sessions";
    }

    // Education
    currentData.education = currentData.education || {};
    currentData.education.degree = getVal("eduDegree", currentData.education.degree);
    currentData.education.university = getVal("eduUni", currentData.education.university);
    currentData.education.cgpa = getVal("eduCgpa", currentData.education.cgpa);
    currentData.education.yearTag = getVal("eduYear", currentData.education.yearTag);
    currentData.education.location = getVal("eduLoc", currentData.education.location);
    currentData.education.quote = getVal("eduQuote", currentData.education.quote);

    const cwRaw = getVal("eduCoursework", "");
    if (cwRaw) {
      currentData.education.coursework = cwRaw
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }

  // Save All Changes Button
  function handleSaveAll() {
    collectAllData();
    const success = savePortfolioData(currentData);
    if (success) {
      showToast("All changes saved & published live!");
    } else {
      alert("Error saving data to localStorage. Check browser storage limits.");
    }
  }

  // Auto-Save with debounce
  let autoSaveTimer = null;
  function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      collectAllData();
      savePortfolioData(currentData);
      const statusText = document.querySelector("#syncStatus span:last-child");
      if (statusText) {
        statusText.textContent = "AUTOSAVED & SYNCED";
        setTimeout(() => {
          statusText.textContent = "LIVE SYNC ACTIVE";
        }, 1400);
      }
    }, 400);
  }

  function attachLiveAutoSaveListeners() {
    document.querySelectorAll("input, textarea, select").forEach((input) => {
      input.removeEventListener("input", triggerAutoSave);
      input.removeEventListener("change", triggerAutoSave);
      input.addEventListener("input", triggerAutoSave);
      input.addEventListener("change", triggerAutoSave);
    });
  }

  const saveAllBtn = document.getElementById("saveAllBtn");
  if (saveAllBtn) saveAllBtn.addEventListener("click", handleSaveAll);
  const floatBtn = document.getElementById("floatingSaveBtn");
  if (floatBtn) floatBtn.addEventListener("click", handleSaveAll);
  document.querySelectorAll(".save-tab-btn").forEach((b) => b.addEventListener("click", handleSaveAll));

  // Avatar file upload handler -> Uploads directly to Cloudinary CDN
  const avatarInput = document.getElementById("avatarFileInput");
  const uploadStatus = document.getElementById("cloudinaryUploadStatus");

  if (avatarInput) {
    avatarInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (uploadStatus) {
        uploadStatus.innerHTML = '<span style="color: var(--color-accent-gold); font-weight: 600;">☁ Uploading to Cloudinary CDN...</span>';
      }
      showToast("Uploading photo to Cloudinary CDN (su1rtayw)...");

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;

        // Immediately update preview so user sees instant feedback
        const previewImg = document.getElementById("avatarPreviewImg");
        if (previewImg) previewImg.src = base64Url;

        try {
          const resp = await fetch("/api/upload-cloudinary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64Url })
          });
          const result = await resp.json();

          if (result.success && result.url) {
            const cdnUrl = result.url;
            document.getElementById("profileAvatarUrl").value = cdnUrl;
            if (previewImg) previewImg.src = cdnUrl;
            currentData.profile = currentData.profile || {};
            currentData.profile.avatar = cdnUrl;
            savePortfolioData(currentData);

            if (uploadStatus) {
              uploadStatus.innerHTML = '<span style="color: #22c55e; font-weight: 700;">✓ Hosted on Cloudinary CDN</span>';
              setTimeout(() => { if (uploadStatus) uploadStatus.textContent = ""; }, 5000);
            }
            showToast("Photo uploaded to Cloudinary CDN & saved live!");
          } else {
            throw new Error(result.error || "Upload failed");
          }
        } catch (err) {
          console.warn("Cloudinary upload failed, falling back to local storage:", err.message);
          document.getElementById("profileAvatarUrl").value = base64Url;
          currentData.profile = currentData.profile || {};
          currentData.profile.avatar = base64Url;
          savePortfolioData(currentData);
          if (uploadStatus) {
            uploadStatus.innerHTML = `<span style="color: var(--color-primary);">Stored locally (${err.message})</span>`;
          }
          showToast("Photo saved locally. Cloudinary note: " + err.message);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const avatarUrlInput = document.getElementById("profileAvatarUrl");
  if (avatarUrlInput) {
    avatarUrlInput.addEventListener("input", () => {
      const img = document.getElementById("avatarPreviewImg");
      if (img) img.src = avatarUrlInput.value || "https://res.cloudinary.com/su1rtayw/image/upload/v1791280125/gtercet5mc8m4ri7nzkt.jpg";
    });
  }

  // Backup & Restore
  function downloadJson(dataObj, filename = "aryan-portfolio-backup.json") {
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("JSON backup downloaded successfully!");
  }

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      collectAllData();
      downloadJson(currentData);
    });
  }

  const exportBackupBtn = document.getElementById("exportBackupBtn");
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener("click", () => {
      collectAllData();
      downloadJson(currentData);
    });
  }

  const backupFileInput = document.getElementById("importBackupInput");
  if (backupFileInput) {
    backupFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.profile && parsed.projects) {
            currentData = parsed;
            savePortfolioData(currentData);
            populateAllForms();
            showToast("JSON backup restored successfully!");
          } else {
            alert("Invalid portfolio JSON format. Missing required fields.");
          }
        } catch (err) {
          alert("Failed to parse JSON file: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // Factory Reset
  function handleReset() {
    if (confirm("Are you sure you want to reset all data back to the original resume data? All custom admin edits will be wiped.")) {
      resetPortfolioData();
      currentData = getPortfolioData();
      populateAllForms();
      showToast("Reset to initial resume defaults!");
    }
  }

  const resetBtn = document.getElementById("dangerResetBtn");
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  // Initial population
  populateAllForms();
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

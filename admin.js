/**
 * ARYAN PORTFOLIO ADMIN PANEL ENGINE (admin.js)
 * Full CRUD, real-time synchronization, Base64 image upload,
 * and JSON import/export for all portfolio sections.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) window.lucide.createIcons();

  // Load current portfolio data state
  let currentData = getPortfolioData();

  // DOM Elements - Tabs
  const tabBtns = document.querySelectorAll(".nav-tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Tab switching
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

  // Toast Notification
  const toast = document.getElementById("adminToast");
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector("span").textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // Populate all forms from currentData
  function populateAllForms() {
    // 1. Profile / Hero
    const p = currentData.profile || {};
    document.getElementById("profileName").value = p.name || "";
    document.getElementById("profileEyebrow").value = p.eyebrow || "";
    document.getElementById("profileTaglineLine2").value = p.taglineLine2 || "";
    document.getElementById("profileBio").value = p.bio || "";
    document.getElementById("profileStatusBadge").value = p.statusBadge || "";
    document.getElementById("profileRoleCaption").value = p.roleCaption || "";
    document.getElementById("profileEduBrief").value = p.educationBrief || "";
    document.getElementById("profileResumeUrl").value = p.resumeUrl || "";
    document.getElementById("profileAvatarUrl").value = p.avatar || "";
    document.getElementById("avatarPreviewImg").src = p.avatar || "assets/aryan.jpg";

    // 2. Metrics
    const m = currentData.metrics || [];
    if (m[0]) {
      document.getElementById("m0_num").value = m[0].number || "";
      document.getElementById("m0_lbl").value = m[0].label || "";
    }
    if (m[1]) {
      document.getElementById("m1_num").value = m[1].number || "";
      document.getElementById("m1_lbl").value = m[1].label || "";
    }
    if (m[2]) {
      document.getElementById("m2_num").value = m[2].number || "";
      document.getElementById("m2_lbl").value = m[2].label || "";
    }
    if (m[3]) {
      document.getElementById("m3_num").value = m[3].number || "";
      document.getElementById("m3_lbl").value = m[3].label || "";
    }

    // 3. About
    const ab = currentData.about || {};
    document.getElementById("aboutTitle").value = ab.title || "";
    document.getElementById("aboutLead").value = ab.lead || "";
    document.getElementById("aboutParagraph").value = ab.paragraph || "";

    const qf = ab.quickFacts || {};
    document.getElementById("factLocation").value = qf.location || "";
    document.getElementById("factDegree").value = qf.degree || "";
    document.getElementById("factCgpa").value = qf.cgpa || "";
    document.getElementById("factPhone").value = qf.phone || "";

    renderPrinciplesList();

    // 4. Skills
    renderSkillsList();

    // 5. Projects
    renderProjectsList();

    // 6. Experience & Leadership
    renderExperienceList();
    const ld = currentData.leadership || {};
    document.getElementById("leadTitle").value = ld.title || "";
    document.getElementById("leadOrg").value = ld.org || "";
    document.getElementById("leadDesc").value = ld.desc || "";
    document.getElementById("leadStat1").value = ld.stat1Num ? `${ld.stat1Num} · ${ld.stat1Txt}` : "";
    document.getElementById("leadStat2").value = ld.stat2Num ? `${ld.stat2Num} · ${ld.stat2Txt}` : "";

    // 7. Education & Certs
    renderCertsList();
    const ed = currentData.education || {};
    document.getElementById("eduDegree").value = ed.degree || "";
    document.getElementById("eduUni").value = ed.university || "";
    document.getElementById("eduCgpa").value = ed.cgpa || "";
    document.getElementById("eduYear").value = ed.yearTag || "";
    document.getElementById("eduLoc").value = ed.location || "";
    document.getElementById("eduCoursework").value = (ed.coursework || []).join(", ");
    document.getElementById("eduQuote").value = ed.quote || "";

    // 8. Contact
    document.getElementById("contactEmail").value = p.email || "";
    document.getElementById("contactPhone").value = p.phone || "";
    document.getElementById("contactLinkedIn").value = p.linkedinUrl || "";
    document.getElementById("contactGitHub").value = p.githubUrl || "";

    if (window.lucide) window.lucide.createIcons();
  }

  // Principles Renderer
  function renderPrinciplesList() {
    const container = document.getElementById("principlesContainer");
    if (!container) return;
    const principles = currentData.about?.principles || [];

    container.innerHTML = principles
      .map(
        (pr, idx) => `
      <div class="form-grid-2" style="background: var(--admin-card-inner); padding: 12px; border: 1.5px solid var(--admin-border); border-radius: 4px; margin-bottom: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label>Principle #${idx + 1} Title</label>
          <input type="text" class="pr-title" data-idx="${idx}" value="${escapeHtml(pr.title)}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label>Principle #${idx + 1} Description</label>
          <input type="text" class="pr-desc" data-idx="${idx}" value="${escapeHtml(pr.desc)}">
        </div>
      </div>
    `
      )
      .join("");
  }

  // Skills Renderer
  function renderSkillsList() {
    const container = document.getElementById("skillsAdminContainer");
    if (!container) return;
    const skills = currentData.skills || [];

    container.innerHTML = skills
      .map(
        (sk, idx) => `
      <div class="admin-card" style="margin-bottom: 20px;">
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
        <div class="form-group">
          <label>Summary Description</label>
          <input type="text" class="sk-summary" data-idx="${idx}" value="${escapeHtml(sk.summary || "")}">
        </div>
        <div class="form-group">
          <label>Skill Tags (Comma-Separated)</label>
          <input type="text" class="sk-tags" data-idx="${idx}" value="${escapeHtml((sk.tags || []).join(", "))}">
        </div>
      </div>
    `
      )
      .join("");
  }

  // Projects Renderer (CRUD)
  function renderProjectsList() {
    const container = document.getElementById("projectsListContainer");
    if (!container) return;
    const projects = currentData.projects || [];

    if (projects.length === 0) {
      container.innerHTML = `<p style="color: var(--admin-ink-muted);">No projects currently created. Click "+ Add New Project" to add one.</p>`;
      return;
    }

    container.innerHTML = projects
      .map(
        (proj, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(proj.title)}</span>
            ${proj.isFeatured ? '<span class="admin-chip" style="background: var(--color-accent-gold);">FEATURED</span>' : ""}
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

    // Attach listeners
    container.querySelectorAll(".edit-project-btn").forEach((b) => {
      b.addEventListener("click", () => openProjectModal(parseInt(b.getAttribute("data-idx"))));
    });

    container.querySelectorAll(".delete-project-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-idx"));
        if (confirm(`Are you sure you want to delete "${projects[idx].title}"?`)) {
          projects.splice(idx, 1);
          savePortfolioData(currentData);
          renderProjectsList();
          showToast("Project deleted & site synchronized!");
        }
      });
    });
  }

  // Experience Renderer (CRUD)
  function renderExperienceList() {
    const container = document.getElementById("experienceListContainer");
    if (!container) return;
    const expList = currentData.experience || [];

    container.innerHTML = expList
      .map(
        (exp, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(exp.role)}</span>
            <span class="admin-chip" style="background: var(--color-accent-blue); color: #111;">${escapeHtml(exp.company)}</span>
          </div>
          <div class="item-row-sub">${escapeHtml(exp.period || "")}</div>
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

    // Handlers
    container.querySelectorAll(".delete-exp-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-idx"));
        if (confirm(`Delete experience: ${expList[idx].role}?`)) {
          expList.splice(idx, 1);
          savePortfolioData(currentData);
          renderExperienceList();
          showToast("Experience item deleted!");
        }
      });
    });

    container.querySelectorAll(".edit-exp-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-idx"));
        editExperiencePrompt(idx);
      });
    });
  }

  // Certifications Renderer (CRUD)
  function renderCertsList() {
    const container = document.getElementById("certsListContainer");
    if (!container) return;
    const certs = currentData.certifications || [];

    container.innerHTML = certs
      .map(
        (c, idx) => `
      <div class="item-row-card">
        <div class="item-row-info">
          <div class="item-row-title">
            <span>${escapeHtml(c.name)}</span>
            <span class="admin-chip">${escapeHtml(c.issuer)}</span>
          </div>
          <div class="item-row-sub">${escapeHtml(c.desc || "")}</div>
        </div>
        <div class="item-row-actions">
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
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-idx"));
        if (confirm(`Delete certificate: ${certs[idx].name}?`)) {
          certs.splice(idx, 1);
          savePortfolioData(currentData);
          renderCertsList();
          showToast("Certification deleted!");
        }
      });
    });
  }

  // Collect All Form Data into currentData
  function collectAllData() {
    // Profile
    currentData.profile = currentData.profile || {};
    currentData.profile.name = document.getElementById("profileName").value;
    currentData.profile.eyebrow = document.getElementById("profileEyebrow").value;
    currentData.profile.taglineLine1 = document.getElementById("profileName").value;
    currentData.profile.taglineLine2 = document.getElementById("profileTaglineLine2").value;
    currentData.profile.bio = document.getElementById("profileBio").value;
    currentData.profile.statusBadge = document.getElementById("profileStatusBadge").value;
    currentData.profile.roleCaption = document.getElementById("profileRoleCaption").value;
    currentData.profile.educationBrief = document.getElementById("profileEduBrief").value;
    currentData.profile.resumeUrl = document.getElementById("profileResumeUrl").value;
    currentData.profile.avatar = document.getElementById("profileAvatarUrl").value;

    currentData.profile.email = document.getElementById("contactEmail").value;
    currentData.profile.phone = document.getElementById("contactPhone").value;
    currentData.profile.linkedinUrl = document.getElementById("contactLinkedIn").value;
    currentData.profile.githubUrl = document.getElementById("contactGitHub").value;

    // Metrics
    currentData.metrics = [
      { number: document.getElementById("m0_num").value, label: document.getElementById("m0_lbl").value },
      { number: document.getElementById("m1_num").value, label: document.getElementById("m1_lbl").value },
      { number: document.getElementById("m2_num").value, label: document.getElementById("m2_lbl").value },
      { number: document.getElementById("m3_num").value, label: document.getElementById("m3_lbl").value },
    ];

    // About
    currentData.about = currentData.about || {};
    currentData.about.title = document.getElementById("aboutTitle").value;
    currentData.about.lead = document.getElementById("aboutLead").value;
    currentData.about.paragraph = document.getElementById("aboutParagraph").value;
    currentData.about.quickFacts = {
      location: document.getElementById("factLocation").value,
      degree: document.getElementById("factDegree").value,
      cgpa: document.getElementById("factCgpa").value,
      phone: document.getElementById("factPhone").value,
    };

    // Principles
    const prTitles = document.querySelectorAll(".pr-title");
    const prDescs = document.querySelectorAll(".pr-desc");
    currentData.about.principles = [];
    prTitles.forEach((t, i) => {
      currentData.about.principles.push({
        marker: "✦",
        title: t.value,
        desc: prDescs[i]?.value || "",
      });
    });

    // Skills
    const skTitles = document.querySelectorAll(".sk-title");
    const skChips = document.querySelectorAll(".sk-chip");
    const skGolds = document.querySelectorAll(".sk-gold");
    const skSummaries = document.querySelectorAll(".sk-summary");
    const skTags = document.querySelectorAll(".sk-tags");

    currentData.skills = [];
    skTitles.forEach((t, i) => {
      const tagArray = skTags[i].value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      currentData.skills.push({
        id: `skill-${i}`,
        title: t.value,
        chip: skChips[i]?.value || "",
        isGold: skGolds[i]?.value === "true",
        summary: skSummaries[i]?.value || "",
        tags: tagArray,
      });
    });

    // Leadership
    currentData.leadership = currentData.leadership || {};
    currentData.leadership.title = document.getElementById("leadTitle").value;
    currentData.leadership.org = document.getElementById("leadOrg").value;
    currentData.leadership.desc = document.getElementById("leadDesc").value;
    const l1 = document.getElementById("leadStat1").value.split("·");
    const l2 = document.getElementById("leadStat2").value.split("·");
    currentData.leadership.stat1Num = l1[0]?.trim() || "50+";
    currentData.leadership.stat1Txt = l1[1]?.trim() || "Students Mentored";
    currentData.leadership.stat2Num = l2[0]?.trim() || "10+";
    currentData.leadership.stat2Txt = l2[1]?.trim() || "Sprint Sessions";

    // Education
    currentData.education = currentData.education || {};
    currentData.education.degree = document.getElementById("eduDegree").value;
    currentData.education.university = document.getElementById("eduUni").value;
    currentData.education.cgpa = document.getElementById("eduCgpa").value;
    currentData.education.yearTag = document.getElementById("eduYear").value;
    currentData.education.location = document.getElementById("eduLoc").value;
    currentData.education.quote = document.getElementById("eduQuote").value;
    currentData.education.coursework = document
      .getElementById("eduCoursework")
      .value.split(",")
      .map((x) => x.trim())
      .filter(Boolean);
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

  document.getElementById("saveAllBtn").addEventListener("click", handleSaveAll);
  document.getElementById("floatingSaveBtn").addEventListener("click", handleSaveAll);
  document.querySelectorAll(".save-tab-btn").forEach((b) => b.addEventListener("click", handleSaveAll));

  // Avatar file upload handler (converts to Base64 data URL)
  const avatarInput = document.getElementById("avatarFileInput");
  if (avatarInput) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          document.getElementById("profileAvatarUrl").value = base64Url;
          document.getElementById("avatarPreviewImg").src = base64Url;
          showToast("Photo updated! Click 'Save & Publish' to reflect on main site.");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // PROJECT MODAL CRUD
  const projectModal = document.getElementById("projectEditorModal");
  const projectModalBackdrop = document.getElementById("projectModalBackdrop");
  const closeProjBtn = document.getElementById("closeProjectModalBtn");
  const cancelProjBtn = document.getElementById("cancelProjectModalBtn");
  const saveProjBtn = document.getElementById("saveProjectItemBtn");

  function openProjectModal(index = -1) {
    document.getElementById("editProjIndex").value = index;
    const isNew = index === -1;
    document.getElementById("projectModalHeading").textContent = isNew ? "Add New Project" : "Edit Project";

    if (isNew) {
      document.getElementById("editProjTitle").value = "";
      document.getElementById("editProjCategory").value = "fullstack";
      document.getElementById("editProjYear").value = "2026";
      document.getElementById("editProjBadge").value = "NEW PROJECT";
      document.getElementById("editProjFeatured").value = "false";
      document.getElementById("editProjTagline").value = "";
      document.getElementById("editProjStats").value = "";
      document.getElementById("editProjBullets").value = "";
      document.getElementById("editProjTags").value = "";
      document.getElementById("editProjGithub").value = "https://github.com/aryacreations";
      document.getElementById("editProjHasDetails").value = "false";
    } else {
      const proj = currentData.projects[index];
      document.getElementById("editProjTitle").value = proj.title || "";
      document.getElementById("editProjCategory").value = proj.category || "fullstack";
      document.getElementById("editProjYear").value = proj.year || "2026";
      document.getElementById("editProjBadge").value = proj.badge || "";
      document.getElementById("editProjFeatured").value = proj.isFeatured ? "true" : "false";
      document.getElementById("editProjTagline").value = proj.tagline || "";
      
      const statStr = (proj.stats || [])
        .map((s) => `${s.strong}: ${s.text}`)
        .join(" | ");
      document.getElementById("editProjStats").value = statStr;

      document.getElementById("editProjBullets").value = (proj.bullets || []).join("\n");
      document.getElementById("editProjTags").value = (proj.tags || []).join(", ");
      document.getElementById("editProjGithub").value = proj.githubUrl || "";
      document.getElementById("editProjHasDetails").value = proj.hasDetails ? "true" : "false";
    }

    projectModal.classList.add("open");
  }

  function closeProjectModal() {
    projectModal.classList.remove("open");
  }

  document.getElementById("addNewProjectBtn").addEventListener("click", () => openProjectModal(-1));
  closeProjBtn.addEventListener("click", closeProjectModal);
  cancelProjBtn.addEventListener("click", closeProjectModal);
  projectModalBackdrop.addEventListener("click", closeProjectModal);

  saveProjBtn.addEventListener("click", () => {
    const idx = parseInt(document.getElementById("editProjIndex").value);
    const title = document.getElementById("editProjTitle").value.trim();
    if (!title) {
      alert("Please enter a project title.");
      return;
    }

    // Parse stats
    const statsRaw = document.getElementById("editProjStats").value;
    const stats = statsRaw
      .split("|")
      .map((s) => {
        const parts = s.split(":");
        return { strong: parts[0]?.trim() || "", text: parts[1]?.trim() || "" };
      })
      .filter((s) => s.strong && s.text);

    // Parse bullets
    const bullets = document
      .getElementById("editProjBullets")
      .value.split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    // Parse tags
    const tags = document
      .getElementById("editProjTags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const projectObj = {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: title,
      category: document.getElementById("editProjCategory").value,
      year: document.getElementById("editProjYear").value,
      badge: document.getElementById("editProjBadge").value,
      isFeatured: document.getElementById("editProjFeatured").value === "true",
      tagline: document.getElementById("editProjTagline").value,
      stats: stats,
      bullets: bullets,
      tags: tags,
      githubUrl: document.getElementById("editProjGithub").value,
      hasDetails: document.getElementById("editProjHasDetails").value === "true",
    };

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

  // ADD EXPERIENCE PROMPT
  document.getElementById("addNewExpBtn").addEventListener("click", () => {
    const role = prompt("Enter Role Title (e.g., Freelance Backend Developer):");
    if (!role) return;
    const company = prompt("Enter Company Name (e.g., Tech Corp):", "Client Company");
    const period = prompt("Enter Duration (e.g., JAN 2026 – FEB 2026 · REMOTE):", "2026 · REMOTE");
    
    currentData.experience.unshift({
      id: `exp-${Date.now()}`,
      role: role,
      company: company || "Freelance",
      period: period || "2026",
      badge: "FREELANCE ROLE",
      isGold: false,
      points: [
        "Architected scalable modules and delivered high quality production code.",
        "Integrated secure API endpoints and optimized database schemas."
      ],
      tags: ["Full Stack", "Backend", "APIs"]
    });

    savePortfolioData(currentData);
    renderExperienceList();
    showToast("New experience role added!");
  });

  function editExperiencePrompt(idx) {
    const exp = currentData.experience[idx];
    const newRole = prompt("Edit Role Title:", exp.role);
    if (!newRole) return;
    const newCompany = prompt("Edit Company:", exp.company);
    const newPeriod = prompt("Edit Period:", exp.period);

    exp.role = newRole;
    exp.company = newCompany || exp.company;
    exp.period = newPeriod || exp.period;

    savePortfolioData(currentData);
    renderExperienceList();
    showToast("Experience role updated!");
  }

  // ADD CERTIFICATION PROMPT
  document.getElementById("addNewCertBtn").addEventListener("click", () => {
    const name = prompt("Enter Certification Name:");
    if (!name) return;
    const issuer = prompt("Enter Issuing Organization (e.g., Anthropic, Coursera):", "Organization");
    const badge = prompt("Enter Badge Tag (e.g., LangChain · Python):", "Certified");

    currentData.certifications.unshift({
      id: `cert-${Date.now()}`,
      name: name,
      issuer: issuer || "Verified",
      badge: badge || "Credential",
      desc: "Demonstrated advanced technical proficiency in industry standards and hands-on evaluations."
    });

    savePortfolioData(currentData);
    renderCertsList();
    showToast("New certification added!");
  });

  // BACKUP & RESTORE
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

  document.getElementById("exportBtn").addEventListener("click", () => {
    collectAllData();
    downloadJson(currentData);
  });

  document.getElementById("exportBackupBtn").addEventListener("click", () => {
    collectAllData();
    downloadJson(currentData);
  });

  // Import JSON
  const importTrigger = document.getElementById("importJsonTrigger");
  const fileInput = document.getElementById("jsonFileInput");
  const backupFileInput = document.getElementById("importBackupInput");

  if (importTrigger && fileInput) {
    importTrigger.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFileImport);
  }

  if (backupFileInput) {
    backupFileInput.addEventListener("change", handleFileImport);
  }

  function handleFileImport(e) {
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
  }

  // Reset to Factory Defaults
  function handleReset() {
    if (confirm("Are you sure you want to reset all data back to the original resume data? All custom admin edits will be wiped.")) {
      resetPortfolioData();
      currentData = getPortfolioData();
      populateAllForms();
      showToast("Reset to initial resume defaults!");
    }
  }

  document.getElementById("resetDefaultBtn").addEventListener("click", handleReset);
  document.getElementById("dangerResetBtn").addEventListener("click", handleReset);

  // Initialize form values
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

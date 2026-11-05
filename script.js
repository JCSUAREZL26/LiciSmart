
/* =====================================================
   LICISMART
   Sistema de análisis y gestión de contratación estatal
   Versión demostrativa
===================================================== */

"use strict";

/* =====================================================
   1. CONFIGURACIÓN Y DATOS
===================================================== */

const STORAGE_KEY = "licismart_data_v3";
const SESSION_KEY = "licismart_session_v3";

const DEMO_EMAIL = "prueba@licismart.com";
const DEMO_PASSWORD = "123456";

function createInitialData() {
  return {
    opportunities: [
      {
        id: "LIC-001-2026",
        entity: "Alcaldía Municipal de Armenia",
        object: "Suministro e instalación de equipos de conectividad y redes",
        modality: "Selección abreviada",
        status: "Abierto",
        deadline: "2026-12-15",
        budget: "Por consultar en fuente oficial",
        source: "SECOP - Registro demostrativo",
        description: "Proceso ilustrativo para la adquisición e instalación de equipos de conectividad.",
        selected: false
      },
      {
        id: "LIC-002-2026",
        entity: "Gobernación del Quindío",
        object: "Mantenimiento de infraestructura tecnológica y telecomunicaciones",
        modality: "Licitación pública",
        status: "Abierto",
        deadline: "2026-12-20",
        budget: "Por consultar en fuente oficial",
        source: "SECOP - Registro demostrativo",
        description: "Proceso ilustrativo relacionado con mantenimiento de infraestructura tecnológica.",
        selected: false
      },
      {
        id: "LIC-003-2026",
        entity: "Empresa de Servicios Públicos",
        object: "Servicio de internet y conectividad para sedes institucionales",
        modality: "Mínima cuantía",
        status: "Abierto",
        deadline: "2026-12-10",
        budget: "Por consultar en fuente oficial",
        source: "SECOP - Registro demostrativo",
        description: "Proceso ilustrativo para la prestación de servicios de conectividad.",
        selected: false
      },
      {
        id: "LIC-004-2026",
        entity: "Instituto Municipal de Deportes",
        object: "Adquisición de equipos tecnológicos y elementos de comunicación",
        modality: "Concurso de méritos",
        status: "Cerrado",
        deadline: "2026-10-15",
        budget: "Por consultar en fuente oficial",
        source: "SECOP - Registro demostrativo",
        description: "Proceso ilustrativo para adquisición de equipos de comunicación.",
        selected: false
      },
      {
        id: "LIC-005-2026",
        entity: "Alcaldía de Calarcá",
        object: "Implementación de soluciones de redes y cableado estructurado",
        modality: "Selección abreviada",
        status: "Abierto",
        deadline: "2026-12-28",
        budget: "Por consultar en fuente oficial",
        source: "SECOP - Registro demostrativo",
        description: "Proceso ilustrativo para implementación de redes y cableado.",
        selected: false
      }
    ],
    documents: [],
    analyses: {},
    bidders: [],
    alerts: [
      {
        id: 1,
        title: "Revisión de requisitos",
        message: "Verifica los requisitos jurídicos, técnicos, financieros y administrativos.",
        date: "Seguimiento general",
        read: false
      },
      {
        id: 2,
        title: "Documentación pendiente",
        message: "Registra los documentos del proceso seleccionado para organizar su revisión.",
        date: "Gestión documental",
        read: false
      },
      {
        id: 3,
        title: "Consulta de fechas",
        message: "Verifica los cronogramas y fechas oficiales antes de participar.",
        date: "Seguimiento general",
        read: false
      }
    ],
    history: [],
    profile: {
      name: "",
      nit: "",
      email: "",
      phone: "",
      description: ""
    }
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialData();

    const parsed = JSON.parse(saved);
    const initial = createInitialData();

    return {
      ...initial,
      ...parsed,
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : initial.opportunities,
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      analyses: parsed.analyses || {},
      bidders: Array.isArray(parsed.bidders) ? parsed.bidders : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : initial.alerts,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      profile: { ...initial.profile, ...(parsed.profile || {}) }
    };
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    return createInitialData();
  }
}

let data = loadData();
let currentOpportunityId = null;
let toastTimeout = null;

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error al guardar:", error);
    showToast("No fue posible guardar los cambios.");
  }
}

/* =====================================================
   2. FUNCIONES GENERALES
===================================================== */

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function addHistory(action) {
  data.history.unshift({
    id: Date.now(),
    action,
    date: new Date().toLocaleString("es-CO")
  });

  data.history = data.history.slice(0, 100);
  saveData();
}

function formatDate(value) {
  if (!value) return "No registrada";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function getOpportunity(id) {
  return data.opportunities.find(item => item.id === id);
}

function getStatusClass(status) {
  if (status === "Abierto") return "status-open";
  if (status === "En seguimiento") return "status-follow";
  return "status-closed";
}

/* =====================================================
   3. INICIO DE SESIÓN
===================================================== */

function showLogin() {
  $("loginView").classList.remove("hidden");
  $("appView").classList.add("hidden");
}

function showApplication() {
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");

  $("currentDate").textContent = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  renderAll();
  navigateTo("dashboard");
}

$("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  $("loginMessage").textContent = "";

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    $("loginMessage").textContent = "Correo o contraseña incorrectos.";
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "active");
  addHistory("Inicio de sesión en LiciSmart.");
  showApplication();
  showToast("Bienvenido a LiciSmart.");
});

$("logoutButton").addEventListener("click", function() {
  addHistory("Cierre de sesión.");
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
  $("loginForm").reset();
  $("loginMessage").textContent = "";
});

/* =====================================================
   4. NAVEGACIÓN
===================================================== */

const viewTitles = {
  dashboard: "Panel principal",
  opportunities: "Oportunidades",
  detail: "Detalle de oportunidad",
  documents: "Gestión documental",
  analysis: "Análisis de requisitos",
  alerts: "Centro de alertas",
  bidders: "Gestión de oferentes",
  reports: "Reportes",
  history: "Historial de actividad",
  profile: "Perfil de empresa"
};

function navigateTo(view) {
  if (sessionStorage.getItem(SESSION_KEY) !== "active") {
    showLogin();
    return;
  }

  document.querySelectorAll(".content-view").forEach(section => {
    section.classList.add("hidden");
  });

  const target = $(view + "View");

  if (!target) {
    showToast("No se encontró el módulo solicitado.");
    return;
  }

  target.classList.remove("hidden");
  $("pageTitle").textContent = viewTitles[view] || "LiciSmart";

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === (view === "detail" ? "opportunities" : view)
    );
  });

  const renderers = {
    opportunities: renderOpportunities,
    detail: renderOpportunityDetail,
    documents: renderDocuments,
    analysis: renderAnalysis,
    alerts: renderAlerts,
    bidders: renderBidders,
    reports: renderReports,
    history: renderHistory,
    profile: renderProfile
  };

  if (renderers[view]) renderers[view]();
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.view);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.go);
  });
});

/* =====================================================
   5. OPORTUNIDADES
===================================================== */

function renderOpportunities() {
  const search = $("opportunitySearch").value.trim().toLowerCase();
  const modality = $("modalityFilter").value;
  const status = $("statusFilter").value;

  const filtered = data.opportunities.filter(item => {
    const content = [
      item.id,
      item.entity,
      item.object,
      item.modality,
      item.status
    ].join(" ").toLowerCase();

    return (!search || content.includes(search)) &&
      (!modality || item.modality === modality) &&
      (!status || item.status === status);
  });

  $("opportunitiesTable").innerHTML = filtered.length
    ? filtered.map(item => `
      <tr>
        <td>
          <strong>${escapeHTML(item.id)}</strong>
          <small>${escapeHTML(item.object)}</small>
        </td>
        <td>${escapeHTML(item.entity)}</td>
        <td>${escapeHTML(item.modality)}</td>
        <td>
          <span class="status-badge ${getStatusClass(item.status)}">
            ${escapeHTML(item.status)}
          </span>
        </td>
        <td>
          <button class="btn-text" data-action="detail"
                  data-id="${escapeHTML(item.id)}">Ver detalle</button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="5"><div class="empty-state">No se encontraron oportunidades.</div></td></tr>`;

  $("opportunityCount").textContent =
    `Se encontraron ${filtered.length} de ${data.opportunities.length} oportunidades registradas.`;
}

$("opportunitySearch").addEventListener("input", renderOpportunities);
$("modalityFilter").addEventListener("change", renderOpportunities);
$("statusFilter").addEventListener("change", renderOpportunities);

function renderOpportunityDetail() {
  const item = getOpportunity(currentOpportunityId);
  const container = $("opportunityDetail");

  if (!item) {
    container.innerHTML = `<div class="empty-state">No se encontró el proceso.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-header">
      <p>${escapeHTML(item.id)}</p>
      <h2>${escapeHTML(item.object)}</h2>
      <p>${escapeHTML(item.entity)}</p>
    </div>

    <div class="panel">
      <h3>Información del proceso</h3>

      <div class="detail-grid" style="margin-top:15px">
        <div class="detail-item"><small>Entidad</small><strong>${escapeHTML(item.entity)}</strong></div>
        <div class="detail-item"><small>Modalidad</small><strong>${escapeHTML(item.modality)}</strong></div>
        <div class="detail-item"><small>Estado</small><strong>${escapeHTML(item.status)}</strong></div>
        <div class="detail-item"><small>Fecha de cierre</small><strong>${escapeHTML(formatDate(item.deadline))}</strong></div>
        <div class="detail-item"><small>Presupuesto</small><strong>${escapeHTML(item.budget)}</strong></div>
        <div class="detail-item"><small>Fuente</small><strong>${escapeHTML(item.source)}</strong></div>
      </div>

      <h3 style="margin-top:20px">Descripción</h3>
      <p style="margin-top:8px">${escapeHTML(item.description)}</p>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn-primary" data-action="toggle-follow" data-id="${escapeHTML(item.id)}">
          ${item.selected ? "Quitar de seguimiento" : "Seleccionar para seguimiento"}
        </button>
        <button class="btn-primary" data-action="analyze" data-id="${escapeHTML(item.id)}">
          Analizar requisitos
        </button>
        <button class="btn-primary" data-action="documents" data-id="${escapeHTML(item.id)}">
          Gestionar documentos
        </button>
      </div>

      <p style="font-size:11px;color:#758398;margin-top:15px">
        Registro demostrativo. Verifica la información en la fuente oficial.
      </p>
    </div>
  `;
}

/* =====================================================
   6. DOCUMENTOS
===================================================== */

function populateProcessSelects() {
  const options = data.opportunities.map(item =>
    `<option value="${escapeHTML(item.id)}">${escapeHTML(item.id)} - ${escapeHTML(item.entity)}</option>`
  ).join("");

  ["documentProcess", "analysisProcess"].forEach(id => {
    const select = $(id);
    const previous = select.value;

    select.innerHTML = `<option value="">Selecciona un proceso</option>${options}`;

    if (data.opportunities.some(item => item.id === previous)) {
      select.value = previous;
    }
  });
}

function renderDocuments() {
  populateProcessSelects();

  const processId = $("documentProcess").value;
  const documents = data.documents.filter(doc =>
    !processId || doc.processId === processId
  );

  $("documentsList").innerHTML = documents.length
    ? documents.map(doc => `
      <div class="record-row">
        <div>
          <strong>${escapeHTML(doc.name)}</strong>
          <small>${escapeHTML(doc.processId)} · ${escapeHTML(doc.type)} · ${escapeHTML(doc.size)} MB</small>
          <small>Registrado: ${escapeHTML(doc.date)}</small>
        </div>
        <button class="btn-text" data-action="delete-document"
                data-id="${doc.id}">Eliminar</button>
      </div>
    `).join("")
    : `<div class="empty-state">No hay documentos registrados para este proceso.</div>`;
}

$("documentProcess").addEventListener("change", renderDocuments);

$("uploadButton").addEventListener("click", function() {
  const processId = $("documentProcess").value;
  const input = $("documentFiles");
  const files = Array.from(input.files || []);

  if (!processId) {
    showToast("Selecciona primero un proceso.");
    return;
  }

  if (!files.length) {
    showToast("Selecciona al menos un documento.");
    return;
  }

  const allowed = ["pdf", "doc", "docx"];
  const maxSize = 10 * 1024 * 1024;
  const valid = [];
  const errors = [];

  files.forEach(file => {
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(extension)) {
      errors.push(file.name + ": formato no permitido.");
    } else if (file.size === 0) {
      errors.push(file.name + ": archivo vacío.");
    } else if (file.size > maxSize) {
      errors.push(file.name + ": supera los 10 MB.");
    } else {
      valid.push(file);
    }
  });

  valid.forEach(file => {
    data.documents.push({
      id: Date.now() + Math.floor(Math.random() * 100000),
      processId,
      name: file.name,
      type: file.name.split(".").pop().toUpperCase(),
      size: (file.size / (1024 * 1024)).toFixed(2),
      date: new Date().toLocaleString("es-CO")
    });
  });

  if (valid.length) {
    addHistory(`Registro de ${valid.length} documento(s) para ${processId}.`);
    saveData();
    input.value = "";
    renderDocuments();
    renderDashboard();
  }

  if (errors.length) {
    showToast(errors.join(" "));
  } else {
    showToast("Documentos registrados correctamente.");
  }
});

/* =====================================================
   7. ANÁLISIS DE REQUISITOS
===================================================== */

function getRequirements() {
  return {
    "Jurídicos": [
      "Verificar certificado de existencia y representación legal.",
      "Revisar facultades del representante legal.",
      "Comprobar antecedentes y documentos jurídicos exigidos."
    ],
    "Técnicos": [
      "Verificar experiencia específica solicitada.",
      "Revisar fichas técnicas y especificaciones.",
      "Comprobar disponibilidad de personal y equipos."
    ],
    "Financieros": [
      "Revisar indicadores financieros requeridos.",
      "Verificar capacidad organizacional.",
      "Comprobar estados financieros y soportes."
    ],
    "Administrativos": [
      "Verificar formularios y anexos requeridos.",
      "Revisar cronograma y condiciones de presentación.",
      "Comprobar firmas y documentos administrativos."
    ]
  };
}

function getAnalysis(id) {
  if (!data.analyses[id]) data.analyses[id] = {};
  return data.analyses[id];
}

function getAnalysisProgress(id) {
  const analysis = getAnalysis(id);
  const requirements = getRequirements();

  let total = 0;
  let completed = 0;

  Object.entries(requirements).forEach(([category, items]) => {
    items.forEach((item, index) => {
      total++;
      if (analysis[category + "-" + index] === true) completed++;
    });
  });

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100)
  };
}

function updateProgress(percentage, completed, total) {
  $("progressText").textContent = percentage + "%";
  $("progressBar").style.width = percentage + "%";
  $("progressBar").setAttribute("aria-valuenow", percentage);
}

function refreshAnalysisProgress() {
  const processId = $("analysisProcess").value;

  if (!processId) {
    updateProgress(0, 0, 0);
    return;
  }

  const progress = getAnalysisProgress(processId);
  updateProgress(progress.percentage, progress.completed, progress.total);
}

function renderAnalysis() {
  populateProcessSelects();

  const select = $("analysisProcess");

  if (!select.value && data.opportunities.length) {
    select.value = data.opportunities[0].id;
  }

  const processId = select.value;
  const container = $("requirementsContainer");

  if (!processId) {
    container.innerHTML = `<div class="empty-state">Selecciona un proceso.</div>`;
    updateProgress(0, 0, 0);
    return;
  }

  const requirements = getRequirements();
  const analysis = getAnalysis(processId);

  container.innerHTML = Object.entries(requirements).map(([category, items]) => `
    <div class="requirement-group">
      <h3>${escapeHTML(category)}</h3>
      ${items.map((item, index) => {
        const key = category + "-" + index;
        const checked = analysis[key] === true ? "checked" : "";

        return `
          <label class="requirement-item">
            <input type="checkbox" data-requirement="${escapeHTML(key)}" ${checked}>
            <span>${escapeHTML(item)}</span>
          </label>
        `;
      }).join("")}
    </div>
  `).join("");

  refreshAnalysisProgress();
}

$("analysisProcess").addEventListener("change", renderAnalysis);

$("requirementsContainer").addEventListener("change", function(event) {
  const checkbox = event.target.closest("[data-requirement]");
  if (!checkbox) return;

  const processId = $("analysisProcess").value;
  if (!processId) return;

  const analysis = getAnalysis(processId);
  analysis[checkbox.dataset.requirement] = checkbox.checked;

  saveData();
  refreshAnalysisProgress();
});

$("saveAnalysisButton").addEventListener("click", function() {
  const processId = $("analysisProcess").value;

  if (!processId) {
    showToast("Selecciona un proceso.");
    return;
  }

  const progress = getAnalysisProgress(processId);
  saveData();

  addHistory(`Actualización del análisis de ${processId}: ${progress.percentage}% de cumplimiento.`);
  renderDashboard();
  showToast(`Análisis guardado: ${progress.percentage}%.`);
});

/* =====================================================
   8. ALERTAS
===================================================== */

function renderAlerts() {
  $("alertsList").innerHTML = data.alerts.length
    ? data.alerts.map(alert => `
      <div class="alert-item">
        <div class="alert-icon">!</div>
        <div style="flex:1">
          <strong>${escapeHTML(alert.title)}</strong>
          <p>${escapeHTML(alert.message)}</p>
          <small>${escapeHTML(alert.date)}</small>
        </div>
        <button class="btn-text" data-action="read-alert"
                data-id="${alert.id}">
          ${alert.read ? "Leída" : "Marcar como leída"}
        </button>
      </div>
    `).join("")
    : `<div class="empty-state">No hay alertas registradas.</div>`;
}

/* =====================================================
   9. OFERENTES
===================================================== */

$("bidderForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = $("bidderName").value.trim();
  const nit = $("bidderNit").value.trim();
  const email = $("bidderEmail").value.trim();
  const phone = $("bidderPhone").value.trim();

  if (!name || !nit || !email) {
    showToast("Completa los campos obligatorios.");
    return;
  }

  if (data.bidders.some(item => item.nit.toLowerCase() === nit.toLowerCase())) {
    showToast("Ya existe un oferente con ese NIT.");
    return;
  }

  data.bidders.push({
    id: Date.now(),
    name,
    nit,
    email,
    phone
  });

  addHistory(`Registro del oferente ${name}.`);
  saveData();
  this.reset();
  renderBidders();
  renderDashboard();
  showToast("Oferente registrado correctamente.");
});

function renderBidders() {
  $("biddersList").innerHTML = data.bidders.length
    ? data.bidders.map(item => `
      <div class="record-row">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>NIT: ${escapeHTML(item.nit)}</small>
          <small>${escapeHTML(item.email)} · ${escapeHTML(item.phone || "Sin teléfono")}</small>
        </div>
        <button class="btn-text" data-action="delete-bidder"
                data-id="${item.id}">Eliminar</button>
      </div>
    `).join("")
    : `<div class="empty-state">Todavía no hay oferentes registrados.</div>`;
}

/* =====================================================
   10. PERFIL DE EMPRESA
===================================================== */

function renderProfile() {
  $("companyName").value = data.profile.name || "";
  $("companyNit").value = data.profile.nit || "";
  $("companyEmail").value = data.profile.email || "";
  $("companyPhone").value = data.profile.phone || "";
  $("companyDescription").value = data.profile.description || "";
}

$("profileForm").addEventListener("submit", function(event) {
  event.preventDefault();

  data.profile = {
    name: $("companyName").value.trim(),
    nit: $("companyNit").value.trim(),
    email: $("companyEmail").value.trim(),
    phone: $("companyPhone").value.trim(),
    description: $("companyDescription").value.trim()
  };

  saveData();
  addHistory("Actualización del perfil de empresa.");
  showToast("Perfil de empresa guardado correctamente.");
});

/* =====================================================
   11. REPORTES
===================================================== */

function renderReports() {
  const progressList = data.opportunities.map(item => ({
    item,
    progress: getAnalysisProgress(item.id)
  }));

  $("reportProcesses").textContent = data.opportunities.length;
  $("reportDocuments").textContent = data.documents.length;
  $("reportBidders").textContent = data.bidders.length;
  $("reportAlerts").textContent = data.alerts.filter(item => !item.read).length;

  const selected = data.opportunities.filter(item => item.selected).length;
  const completed = progressList.filter(item => item.progress.percentage === 100).length;
  const started = progressList.filter(item => item.progress.completed > 0).length;

  $("reportSummary").innerHTML = `
    <div class="record-row"><span>Procesos seleccionados</span><strong>${selected}</strong></div>
    <div class="record-row"><span>Análisis completados al 100%</span><strong>${completed}</strong></div>
    <div class="record-row"><span>Procesos con análisis iniciado</span><strong>${started}</strong></div>
    <div class="record-row"><span>Documentos registrados</span><strong>${data.documents.length}</strong></div>
    <h3 style="margin-top:20px">Avance por proceso</h3>
    ${progressList.map(entry => `
      <div class="record-row">
        <div>
          <strong>${escapeHTML(entry.item.id)}</strong>
          <small>${escapeHTML(entry.item.entity)}</small>
        </div>
        <strong>${entry.progress.percentage}%</strong>
      </div>
    `).join("")}
  `;
}

$("printReportButton").addEventListener("click", function() {
  renderReports();
  addHistory("Generación de reporte mediante impresión del navegador.");
  window.print();
});

/* =====================================================
   12. HISTORIAL
===================================================== */

function renderHistory() {
  $("historyList").innerHTML = data.history.length
    ? data.history.map(item => `
      <div class="record-row">
        <div>
          <strong>${escapeHTML(item.action)}</strong>
          <small>${escapeHTML(item.date)}</small>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">Todavía no hay actividad registrada.</div>`;
}

/* =====================================================
   13. PANEL PRINCIPAL
===================================================== */

function renderDashboard() {
  $("statOpportunities").textContent = data.opportunities.length;
  $("statSelected").textContent = data.opportunities.filter(item => item.selected).length;
  $("statDocuments").textContent = data.documents.length;
  $("statAlerts").textContent = data.alerts.filter(item => !item.read).length;

  $("recentOpportunities").innerHTML = data.opportunities.slice(0, 4).map(item => `
    <div class="record-row">
      <div>
        <strong>${escapeHTML(item.entity)}</strong>
        <small>${escapeHTML(item.id)} · ${escapeHTML(item.object)}</small>
      </div>
      <button class="btn-text" data-action="detail"
              data-id="${escapeHTML(item.id)}">Consultar</button>
    </div>
  `).join("");

  const alerts = data.alerts.filter(item => !item.read).slice(0, 4);

  $("dashboardAlerts").innerHTML = alerts.length
    ? alerts.map(item => `
      <div class="alert-item">
        <div class="alert-icon">!</div>
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <p>${escapeHTML(item.message)}</p>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state">No tienes alertas pendientes.</div>`;
}

/* =====================================================
   14. ACCIONES GENERALES
===================================================== */

document.addEventListener("click", function(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (sessionStorage.getItem(SESSION_KEY) !== "active") {
    showLogin();
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "detail") {
    currentOpportunityId = id;
    navigateTo("detail");
  }

  if (action === "toggle-follow") {
    const item = getOpportunity(id);
    if (!item) return;

    item.selected = !item.selected;
    item.status = item.selected ? "En seguimiento" : "Abierto";

    saveData();
    addHistory(`${item.selected ? "Selección" : "Retiro"} del proceso ${id} para seguimiento.`);
    renderOpportunityDetail();
    renderDashboard();
    renderOpportunities();

    showToast(item.selected
      ? "Proceso agregado al seguimiento."
      : "Proceso retirado del seguimiento.");
  }

  if (action === "analyze") {
    populateProcessSelects();
    $("analysisProcess").value = id;
    renderAnalysis();
    navigateTo("analysis");
  }

  if (action === "documents") {
    populateProcessSelects();
    $("documentProcess").value = id;
    renderDocuments();
    navigateTo("documents");
  }

  if (action === "read-alert") {
    const alert = data.alerts.find(item => String(item.id) === String(id));
    if (!alert) return;

    alert.read = true;
    saveData();
    addHistory(`Lectura de alerta: ${alert.title}.`);
    renderAlerts();
    renderDashboard();
    renderReports();
    showToast("Alerta marcada como leída.");
  }

  if (action === "delete-document") {
    const index = data.documents.findIndex(item => String(item.id) === String(id));
    if (index < 0) return;

    if (confirm("¿Deseas eliminar este registro documental?")) {
      data.documents.splice(index, 1);
      saveData();
      addHistory("Eliminación de un registro documental.");
      renderDocuments();
      renderDashboard();
      renderReports();
      showToast("Registro eliminado.");
    }
  }

  if (action === "delete-bidder") {
    const index = data.bidders.findIndex(item => String(item.id) === String(id));
    if (index < 0) return;

    if (confirm("¿Deseas eliminar este oferente?")) {
      const name = data.bidders[index].name;
      data.bidders.splice(index, 1);
      saveData();
      addHistory(`Eliminación del oferente ${name}.`);
      renderBidders();
      renderDashboard();
      renderReports();
      showToast("Oferente eliminado.");
    }
  }
});

/* =====================================================
   15. ACTUALIZACIÓN GENERAL
===================================================== */

function renderAll() {
  populateProcessSelects();
  renderDashboard();
  renderOpportunities();
  renderDocuments();
  renderAnalysis();
  renderAlerts();
  renderBidders();
  renderReports();
  renderHistory();
  renderProfile();
}

/* =====================================================
   16. INICIALIZACIÓN
===================================================== */

document.addEventListener("DOMContentLoaded", function() {
  if (sessionStorage.getItem(SESSION_KEY) === "active") {
    showApplication();
  } else {
    showLogin();
  }
});

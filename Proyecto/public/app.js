const DEFAULT_API_URL = "http://localhost:3000"

const state = {
  apiBaseUrl: localStorage.getItem("apiBaseUrl") || DEFAULT_API_URL,
  currentSection: "dashboard",
  estudiantes: [],
  profesores: [],
  cursos: [],
  inscripciones: []
}

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => Array.from(document.querySelectorAll(selector))

const elements = {
  alert: $("#alert"),
  apiBaseUrl: $("#apiBaseUrl"),
  saveApiUrl: $("#saveApiUrl"),
  refreshCurrent: $("#refreshCurrent"),
  checkApi: $("#checkApi"),
  sectionTitle: $("#sectionTitle"),
  counts: {
    estudiantes: $("#countEstudiantes"),
    profesores: $("#countProfesores"),
    cursos: $("#countCursos"),
    inscripciones: $("#countInscripciones")
  },
  tables: {
    estudiantes: $("#tablaEstudiantes"),
    profesores: $("#tablaProfesores"),
    cursos: $("#tablaCursos"),
    inscripciones: $("#tablaInscripciones")
  }
}

elements.apiBaseUrl.value = state.apiBaseUrl

function showAlert(message, type = "success") {
  elements.alert.textContent = message
  elements.alert.className = `alert ${type}`
  elements.alert.hidden = false

  window.clearTimeout(showAlert.timeout)
  showAlert.timeout = window.setTimeout(() => {
    elements.alert.hidden = true
  }, 5200)
}

function normalizeApiUrl(url) {
  return url.trim().replace(/\/$/, "")
}

function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return "No se pudo conectar con el backend. Verifica que npm run dev esté activo. Si usas Live Server, puede ser bloqueo CORS porque el backend no fue modificado."
  }

  return error.message || "Ocurrió un error inesperado"
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${state.apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = data?.error || data?.mensaje || `Error HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

function formatDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  })
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderEmpty(tbody, colspan) {
  tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No hay registros para mostrar.</td></tr>`
}

function statusBadge(value) {
  const estado = String(value || "—").toLowerCase()
  let type = ""

  if (estado === "activo" || estado === "activa" || estado === "aprobada") type = "success"
  if (estado === "inactivo" || estado === "reprobada") type = "danger"
  if (estado === "pendiente") type = "warning"

  return `<span class="badge ${type}">${escapeHtml(value || "—")}</span>`
}

function getEstudianteNombre(id) {
  const item = state.estudiantes.find((estudiante) => Number(estudiante.id) === Number(id))
  return item ? `${item.nombre} (#${item.id})` : `ID ${id}`
}

function getCursoNombre(id) {
  const item = state.cursos.find((curso) => Number(curso.id) === Number(id))
  return item ? `${item.nombre} (#${item.id})` : `ID ${id}`
}

function getProfesorIdByName(nombre) {
  const profesor = state.profesores.find((item) => item.nombre === nombre)
  return profesor?.id || ""
}

function setButtonLoading(button, isLoading, text = "Guardando...") {
  if (!button) return
  if (isLoading) {
    button.dataset.originalText = button.textContent
    button.textContent = text
    button.disabled = true
  } else {
    button.textContent = button.dataset.originalText || button.textContent
    button.disabled = false
  }
}

async function loadDashboard() {
  await Promise.allSettled([
    loadEstudiantes(false),
    loadProfesores(false),
    loadCursos(false),
    loadInscripciones(false)
  ])

  updateCounts()
}

function updateCounts() {
  elements.counts.estudiantes.textContent = state.estudiantes.length
  elements.counts.profesores.textContent = state.profesores.length
  elements.counts.cursos.textContent = state.cursos.length
  elements.counts.inscripciones.textContent = state.inscripciones.length
}

async function loadEstudiantes(showMessage = true) {
  try {
    state.estudiantes = await apiFetch("/api/estudiantes")
    renderEstudiantes()
    fillEstudiantesSelect()
    updateCounts()
    if (showMessage) showAlert("Estudiantes actualizados")
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  }
}

async function loadProfesores(showMessage = true) {
  try {
    state.profesores = await apiFetch("/api/profesores")
    renderProfesores()
    fillProfesoresSelect()
    updateCounts()
    if (showMessage) showAlert("Profesores actualizados")
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  }
}

async function loadCursos(showMessage = true) {
  try {
    state.cursos = await apiFetch("/api/cursos")
    renderCursos()
    fillCursosSelect()
    updateCounts()
    if (showMessage) showAlert("Cursos actualizados")
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  }
}

async function loadInscripciones(showMessage = true) {
  try {
    state.inscripciones = await apiFetch("/api/inscripciones")
    renderInscripciones()
    updateCounts()
    if (showMessage) showAlert("Inscripciones actualizadas")
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  }
}

function renderEstudiantes() {
  const tbody = elements.tables.estudiantes

  if (!state.estudiantes.length) {
    renderEmpty(tbody, 7)
    return
  }

  tbody.innerHTML = state.estudiantes.map((estudiante) => `
    <tr>
      <td>${estudiante.id}</td>
      <td>${escapeHtml(estudiante.nombre)}</td>
      <td>${escapeHtml(estudiante.correo)}</td>
      <td>${escapeHtml(estudiante.carrera)}</td>
      <td>${escapeHtml(estudiante.semestre_actual)}</td>
      <td>${statusBadge(estudiante.estado)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-small" type="button" data-edit-estudiante="${estudiante.id}">Editar</button>
          <button class="btn btn-danger btn-small" type="button" data-delete-estudiante="${estudiante.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("")
}

function renderProfesores() {
  const tbody = elements.tables.profesores

  if (!state.profesores.length) {
    renderEmpty(tbody, 6)
    return
  }

  tbody.innerHTML = state.profesores.map((profesor) => `
    <tr>
      <td>${profesor.id}</td>
      <td>${escapeHtml(profesor.nombre)}</td>
      <td>${escapeHtml(profesor.correo)}</td>
      <td>${escapeHtml(profesor.departamento)}</td>
      <td>${formatDate(profesor.fecha_contratacion)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-small" type="button" data-edit-profesor="${profesor.id}">Editar</button>
          <button class="btn btn-danger btn-small" type="button" data-delete-profesor="${profesor.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("")
}

function renderCursos() {
  const tbody = elements.tables.cursos

  if (!state.cursos.length) {
    renderEmpty(tbody, 6)
    return
  }

  tbody.innerHTML = state.cursos.map((curso) => `
    <tr>
      <td>${curso.id}</td>
      <td>${escapeHtml(curso.nombre)}</td>
      <td>${escapeHtml(curso.cant_creditos)}</td>
      <td>${escapeHtml(curso.profesor || "Sin profesor")}</td>
      <td>${escapeHtml(curso.cupo_max)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-small" type="button" data-edit-curso="${curso.id}">Editar</button>
          <button class="btn btn-danger btn-small" type="button" data-delete-curso="${curso.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("")
}

function renderInscripciones() {
  const tbody = elements.tables.inscripciones

  if (!state.inscripciones.length) {
    renderEmpty(tbody, 6)
    return
  }

  tbody.innerHTML = state.inscripciones.map((inscripcion) => `
    <tr>
      <td>${inscripcion.id}</td>
      <td>${formatDate(inscripcion.fecha_ins)}</td>
      <td>${statusBadge(inscripcion.estado)}</td>
      <td>${escapeHtml(getEstudianteNombre(inscripcion.estudiante_id))}</td>
      <td>${escapeHtml(getCursoNombre(inscripcion.curso_id))}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-small" type="button" data-edit-inscripcion="${inscripcion.id}">Editar</button>
          <button class="btn btn-danger btn-small" type="button" data-delete-inscripcion="${inscripcion.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("")
}

function fillProfesoresSelect() {
  const select = $("#cursoProfesor")
  const currentValue = select.value

  select.innerHTML = `<option value="">Selecciona un profesor</option>` +
    state.profesores.map((profesor) => `
      <option value="${profesor.id}">${escapeHtml(profesor.nombre)} — ${escapeHtml(profesor.departamento)}</option>
    `).join("")

  select.value = currentValue
}

function fillEstudiantesSelect() {
  const select = $("#inscripcionEstudiante")
  const currentValue = select.value

  select.innerHTML = `<option value="">Selecciona un estudiante</option>` +
    state.estudiantes.map((estudiante) => `
      <option value="${estudiante.id}">${escapeHtml(estudiante.nombre)} — ${escapeHtml(estudiante.carrera)}</option>
    `).join("")

  select.value = currentValue
}

function fillCursosSelect() {
  const select = $("#inscripcionCurso")
  const currentValue = select.value

  select.innerHTML = `<option value="">Selecciona un curso</option>` +
    state.cursos.map((curso) => `
      <option value="${curso.id}">${escapeHtml(curso.nombre)}</option>
    `).join("")

  select.value = currentValue
}

function resetEstudianteForm() {
  $("#estudianteId").value = ""
  $("#formEstudiante").reset()
  $("#estudianteFormTitle").textContent = "Crear estudiante"
}

function resetProfesorForm() {
  $("#profesorId").value = ""
  $("#formProfesor").reset()
  $("#profesorFormTitle").textContent = "Crear profesor"
}

function resetCursoForm() {
  $("#cursoId").value = ""
  $("#formCurso").reset()
  $("#cursoFormTitle").textContent = "Crear curso"
}

function resetInscripcionForm() {
  $("#inscripcionId").value = ""
  $("#formInscripcion").reset()
  $("#inscripcionEstado").value = "activa"
  $("#inscripcionFormTitle").textContent = "Crear inscripción"
}

function editEstudiante(id) {
  const estudiante = state.estudiantes.find((item) => Number(item.id) === Number(id))
  if (!estudiante) return

  $("#estudianteId").value = estudiante.id
  $("#estudianteNombre").value = estudiante.nombre || ""
  $("#estudianteCorreo").value = estudiante.correo || ""
  $("#estudianteCarrera").value = estudiante.carrera || ""
  $("#estudianteSemestre").value = estudiante.semestre_actual || ""
  $("#estudianteFormTitle").textContent = `Editar estudiante #${estudiante.id}`
  switchSection("estudiantes")
}

function editProfesor(id) {
  const profesor = state.profesores.find((item) => Number(item.id) === Number(id))
  if (!profesor) return

  $("#profesorId").value = profesor.id
  $("#profesorNombre").value = profesor.nombre || ""
  $("#profesorCorreo").value = profesor.correo || ""
  $("#profesorDepartamento").value = profesor.departamento || ""
  $("#profesorFormTitle").textContent = `Editar profesor #${profesor.id}`
  switchSection("profesores")
}

function editCurso(id) {
  const curso = state.cursos.find((item) => Number(item.id) === Number(id))
  if (!curso) return

  $("#cursoId").value = curso.id
  $("#cursoNombre").value = curso.nombre || ""
  $("#cursoCreditos").value = curso.cant_creditos || ""
  $("#cursoProfesor").value = getProfesorIdByName(curso.profesor)
  $("#cursoCupo").value = curso.cupo_max || ""
  $("#cursoFormTitle").textContent = `Editar curso #${curso.id}`
  switchSection("cursos")
}

function editInscripcion(id) {
  const inscripcion = state.inscripciones.find((item) => Number(item.id) === Number(id))
  if (!inscripcion) return

  $("#inscripcionId").value = inscripcion.id
  $("#inscripcionEstudiante").value = inscripcion.estudiante_id || ""
  $("#inscripcionCurso").value = inscripcion.curso_id || ""
  $("#inscripcionEstado").value = inscripcion.estado || "activa"
  $("#inscripcionFormTitle").textContent = `Editar inscripción #${inscripcion.id}`
  switchSection("inscripciones")
}

async function handleEstudianteSubmit(event) {
  event.preventDefault()
  const button = event.submitter
  setButtonLoading(button, true)

  const id = $("#estudianteId").value
  const payload = {
    nombre: $("#estudianteNombre").value.trim(),
    correo: $("#estudianteCorreo").value.trim(),
    carrera: $("#estudianteCarrera").value.trim(),
    semestre_actual: Number($("#estudianteSemestre").value)
  }

  try {
    if (id) {
      await apiFetch(`/api/estudiantes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      showAlert("Estudiante actualizado correctamente")
    } else {
      await apiFetch("/api/estudiantes", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      showAlert("Estudiante creado correctamente")
    }

    resetEstudianteForm()
    await loadEstudiantes(false)
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  } finally {
    setButtonLoading(button, false)
  }
}

async function handleProfesorSubmit(event) {
  event.preventDefault()
  const button = event.submitter
  setButtonLoading(button, true)

  const id = $("#profesorId").value
  const payload = {
    nombre: $("#profesorNombre").value.trim(),
    correo: $("#profesorCorreo").value.trim(),
    departamento: $("#profesorDepartamento").value.trim()
  }

  try {
    if (id) {
      await apiFetch(`/api/profesores/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      showAlert("Profesor actualizado correctamente")
    } else {
      await apiFetch("/api/profesores", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      showAlert("Profesor creado correctamente")
    }

    resetProfesorForm()
    await loadProfesores(false)
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  } finally {
    setButtonLoading(button, false)
  }
}

async function handleCursoSubmit(event) {
  event.preventDefault()
  const button = event.submitter
  setButtonLoading(button, true)

  const id = $("#cursoId").value
  const payload = {
    nombre: $("#cursoNombre").value.trim(),
    cant_creditos: Number($("#cursoCreditos").value),
    profesor_id: Number($("#cursoProfesor").value),
    cupo_max: Number($("#cursoCupo").value)
  }

  try {
    if (id) {
      await apiFetch(`/api/cursos/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      showAlert("Curso actualizado correctamente")
    } else {
      await apiFetch("/api/cursos", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      showAlert("Curso creado correctamente")
    }

    resetCursoForm()
    await loadCursos(false)
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  } finally {
    setButtonLoading(button, false)
  }
}

async function handleInscripcionSubmit(event) {
  event.preventDefault()
  const button = event.submitter
  setButtonLoading(button, true)

  const id = $("#inscripcionId").value
  const payload = {
    estado: $("#inscripcionEstado").value,
    estudiante_id: Number($("#inscripcionEstudiante").value),
    curso_id: Number($("#inscripcionCurso").value)
  }

  try {
    if (id) {
      await apiFetch(`/api/inscripciones/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })
      showAlert("Inscripción actualizada correctamente")
    } else {
      await apiFetch("/api/inscripciones", {
        method: "POST",
        body: JSON.stringify(payload)
      })
      showAlert("Inscripción creada correctamente")
    }

    resetInscripcionForm()
    await loadInscripciones(false)
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  } finally {
    setButtonLoading(button, false)
  }
}

async function deleteItem(entity, id) {
  const labels = {
    estudiante: "estudiante",
    profesor: "profesor",
    curso: "curso",
    inscripcion: "inscripción"
  }

  const confirmed = window.confirm(`¿Seguro que deseas eliminar este ${labels[entity]}?`)
  if (!confirmed) return

  const paths = {
    estudiante: `/api/estudiantes/${id}`,
    profesor: `/api/profesores/${id}`,
    curso: `/api/cursos/${id}`,
    inscripcion: `/api/inscripciones/${id}`
  }

  try {
    await apiFetch(paths[entity], { method: "DELETE" })
    showAlert(`${labels[entity][0].toUpperCase()}${labels[entity].slice(1)} eliminado correctamente`)

    if (entity === "estudiante") await loadEstudiantes(false)
    if (entity === "profesor") await loadProfesores(false)
    if (entity === "curso") await loadCursos(false)
    if (entity === "inscripcion") await loadInscripciones(false)
  } catch (error) {
    showAlert(getErrorMessage(error), "error")
  }
}

function switchSection(section) {
  state.currentSection = section

  $$(".nav-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.section === section)
  })

  $$(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === section)
  })

  const titles = {
    dashboard: "Dashboard",
    estudiantes: "Estudiantes",
    profesores: "Profesores",
    cursos: "Cursos",
    inscripciones: "Inscripciones"
  }

  elements.sectionTitle.textContent = titles[section] || "Dashboard"

  if (section === "dashboard") loadDashboard()
  if (section === "estudiantes") loadEstudiantes(false)
  if (section === "profesores") loadProfesores(false)
  if (section === "cursos") {
    loadProfesores(false).finally(() => loadCursos(false))
  }
  if (section === "inscripciones") {
    Promise.allSettled([loadEstudiantes(false), loadCursos(false)]).finally(() => loadInscripciones(false))
  }
}

function refreshCurrentSection() {
  switchSection(state.currentSection)
  showAlert("Datos actualizados")
}

function bindEvents() {
  $$(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchSection(tab.dataset.section))
  })

  elements.saveApiUrl.addEventListener("click", () => {
    state.apiBaseUrl = normalizeApiUrl(elements.apiBaseUrl.value || DEFAULT_API_URL)
    elements.apiBaseUrl.value = state.apiBaseUrl
    localStorage.setItem("apiBaseUrl", state.apiBaseUrl)
    showAlert("URL del backend guardada")
    refreshCurrentSection()
  })

  elements.refreshCurrent.addEventListener("click", refreshCurrentSection)

  elements.checkApi.addEventListener("click", async () => {
    try {
      const data = await apiFetch("/test-db")
      showAlert(data?.mensaje || "Conexión exitosa")
      await loadDashboard()
    } catch (error) {
      showAlert(getErrorMessage(error), "error")
    }
  })

  $$("[data-reload]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.reload
      if (key === "estudiantes") loadEstudiantes()
      if (key === "profesores") loadProfesores()
      if (key === "cursos") loadCursos()
      if (key === "inscripciones") loadInscripciones()
    })
  })

  $$("[data-reset-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.resetForm
      if (key === "estudiante") resetEstudianteForm()
      if (key === "profesor") resetProfesorForm()
      if (key === "curso") resetCursoForm()
      if (key === "inscripcion") resetInscripcionForm()
    })
  })

  $("#formEstudiante").addEventListener("submit", handleEstudianteSubmit)
  $("#formProfesor").addEventListener("submit", handleProfesorSubmit)
  $("#formCurso").addEventListener("submit", handleCursoSubmit)
  $("#formInscripcion").addEventListener("submit", handleInscripcionSubmit)

  document.addEventListener("click", (event) => {
    const target = event.target

    if (target.matches("[data-edit-estudiante]")) editEstudiante(target.dataset.editEstudiante)
    if (target.matches("[data-edit-profesor]")) editProfesor(target.dataset.editProfesor)
    if (target.matches("[data-edit-curso]")) editCurso(target.dataset.editCurso)
    if (target.matches("[data-edit-inscripcion]")) editInscripcion(target.dataset.editInscripcion)

    if (target.matches("[data-delete-estudiante]")) deleteItem("estudiante", target.dataset.deleteEstudiante)
    if (target.matches("[data-delete-profesor]")) deleteItem("profesor", target.dataset.deleteProfesor)
    if (target.matches("[data-delete-curso]")) deleteItem("curso", target.dataset.deleteCurso)
    if (target.matches("[data-delete-inscripcion]")) deleteItem("inscripcion", target.dataset.deleteInscripcion)
  })
}

bindEvents()
loadDashboard()

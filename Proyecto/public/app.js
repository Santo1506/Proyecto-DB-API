const API_URL = "http://localhost:3000"

// Estado global
let estadoActual = "estudiantes"
let registroEnEdicion = null

// Elementos del DOM
const btnEstudiantes = document.getElementById("btnEstudiantes")
const btnProfesores = document.getElementById("btnProfesores")
const btnCursos = document.getElementById("btnCursos")
const btnInscripciones = document.getElementById("btnInscripciones")
const titulo = document.getElementById("titulo")
const tabla = document.getElementById("tabla")
const encabezadoTabla = document.getElementById("encabezadoTabla")
const formulario = document.getElementById("formulario")
const campos = document.getElementById("campos")
const buscarId = document.getElementById("buscarId")
const btnBuscar = document.getElementById("btnBuscar")
const mensaje = document.getElementById("mensaje")

// Botones de queries
const btnTop10 = document.getElementById("btnTop10")
const btnCursosPM = document.getElementById("btnCursosPM")
const btnCursosInscripciones = document.getElementById("btnCursosInscripciones")
const btnActivas = document.getElementById("btnActivas")
const btnProfesor3 = document.getElementById("btnProfesor3")
const btnCupo = document.getElementById("btnCupo")
const btnPromedio = document.getElementById("btnPromedio")
const btnPromedioSuperior = document.getElementById("btnPromedioSuperior")

// Event Listeners para navegación
btnEstudiantes.addEventListener("click", () => cargarEstudiantes())
btnProfesores.addEventListener("click", () => cargarProfesores())
btnCursos.addEventListener("click", () => cargarCursos())
btnInscripciones.addEventListener("click", () => cargarInscripciones())

// Event Listeners para queries
btnTop10.addEventListener("click", () => cargarTop10())
btnCursosPM.addEventListener("click", () => cargarCursosProgramacionMatematicas())
btnCursosInscripciones.addEventListener("click", () => cargarCursosPorInscripciones())
btnActivas.addEventListener("click", () => cargarInscripcionesActivas())
btnProfesor3.addEventListener("click", () => cargarProfesoresConTresCursos())
btnCupo.addEventListener("click", () => cargarCursosConCupo())
btnPromedio.addEventListener("click", () => cargarPromedioNotas())
btnPromedioSuperior.addEventListener("click", () => cargarPromedioSuperior())

// Buscar por ID
btnBuscar.addEventListener("click", () => buscarPorId())
buscarId.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscarPorId()
})

// Submit formulario
formulario.addEventListener("submit", (e) => {
  e.preventDefault()
  guardarRegistro()
})

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo = "success") {
  mensaje.textContent = texto
  mensaje.style.background = tipo === "success" ? "#198754" : "#dc3545"
  mensaje.style.display = "block"
  setTimeout(() => {
    mensaje.style.display = "none"
  }, 3000)
}

// ==================== ESTUDIANTES ====================

async function cargarEstudiantes() {
  estadoActual = "estudiantes"
  titulo.textContent = "👨‍🎓 Estudiantes"
  buscarId.placeholder = "Buscar por ID de estudiante"

  try {
    const response = await fetch(`${API_URL}/api/estudiantes`)
    const datos = await response.json()

    mostrarTabla(datos, [
      "id",
      "nombre",
      "correo",
      "carrera",
      "semestre_actual",
      "fecha_ingreso",
      "estado"
    ])
    generarFormularioEstudiante()
  } catch (error) {
    mostrarMensaje("Error al cargar estudiantes", "error")
    console.error(error)
  }
}

function generarFormularioEstudiante() {
  campos.innerHTML = `
    <input type="text" id="nombre" placeholder="Nombre" required>
    <input type="email" id="correo" placeholder="Correo" required>
    <input type="text" id="carrera" placeholder="Carrera" required>
    <input type="number" id="semestre_actual" placeholder="Semestre (1-10)" min="1" max="10" required>
  `
}

// ==================== PROFESORES ====================

async function cargarProfesores() {
  estadoActual = "profesores"
  titulo.textContent = "👨‍🏫 Profesores"
  buscarId.placeholder = "Buscar por ID de profesor"

  try {
    const response = await fetch(`${API_URL}/api/profesores`)
    const datos = await response.json()

    mostrarTabla(datos, [
      "id",
      "nombre",
      "correo",
      "departamento",
      "fecha_contratacion"
    ])
    generarFormularioProfesor()
  } catch (error) {
    mostrarMensaje("Error al cargar profesores", "error")
    console.error(error)
  }
}

function generarFormularioProfesor() {
  campos.innerHTML = `
    <input type="text" id="nombre" placeholder="Nombre" required>
    <input type="email" id="correo" placeholder="Correo" required>
    <input type="text" id="departamento" placeholder="Departamento" required>
  `
}

// ==================== CURSOS ====================

async function cargarCursos() {
  estadoActual = "cursos"
  titulo.textContent = "📚 Cursos"
  buscarId.placeholder = "Buscar por ID de curso"

  try {
    const response = await fetch(`${API_URL}/api/cursos`)
    const datos = await response.json()

    mostrarTabla(datos, [
      "id",
      "nombre",
      "cant_creditos",
      "cupo_max",
      "profesor_id",
      "fecha_inicio",
      "fecha_fin"
    ])
    generarFormularioCurso()
  } catch (error) {
    mostrarMensaje("Error al cargar cursos", "error")
    console.error(error)
  }
}

function generarFormularioCurso() {
  campos.innerHTML = `
    <input type="text" id="nombre" placeholder="Nombre del curso" required>
    <input type="number" id="cant_creditos" placeholder="Créditos" required>
    <input type="number" id="cupo_max" placeholder="Cupo máximo" required>
    <input type="number" id="profesor_id" placeholder="ID del profesor" required>
    <input type="date" id="fecha_inicio" required>
    <input type="date" id="fecha_fin" required>
  `
}

// ==================== INSCRIPCIONES ====================

async function cargarInscripciones() {
  estadoActual = "inscripciones"
  titulo.textContent = "📝 Inscripciones"
  buscarId.placeholder = "Buscar por ID de inscripción"

  try {
    const response = await fetch(`${API_URL}/api/inscripciones`)
    const datos = await response.json()

    mostrarTabla(datos, ["id", "estado", "estudiante_id", "curso_id"])
    generarFormularioInscripcion()
  } catch (error) {
    mostrarMensaje("Error al cargar inscripciones", "error")
    console.error(error)
  }
}

function generarFormularioInscripcion() {
  campos.innerHTML = `
    <select id="estado" required>
      <option value="">Seleccionar estado</option>
      <option value="activa">Activa</option>
      <option value="inactiva">Inactiva</option>
      <option value="reprobada">Reprobada</option>
    </select>
    <input type="number" id="estudiante_id" placeholder="ID del estudiante" required>
    <input type="number" id="curso_id" placeholder="ID del curso" required>
  `
}

// ==================== MOSTRAR TABLA ====================

function mostrarTabla(datos, columnas) {
  // Limpiar tabla
  tabla.innerHTML = ""
  encabezadoTabla.innerHTML = ""

  if (datos.length === 0) {
    tabla.innerHTML =
      '<tr><td colspan="10">No hay datos disponibles</td></tr>'
    return
  }

  // Crear encabezados
  const headerRow = document.createElement("tr")
  columnas.forEach((col) => {
    const th = document.createElement("th")
    th.textContent = col.charAt(0).toUpperCase() + col.slice(1)
    headerRow.appendChild(th)
  })
  // Agregar columna de acciones
  const thAcciones = document.createElement("th")
  thAcciones.textContent = "Acciones"
  headerRow.appendChild(thAcciones)
  encabezadoTabla.appendChild(headerRow)

  // Crear filas
  datos.forEach((fila) => {
    const tr = document.createElement("tr")
    columnas.forEach((col) => {
      const td = document.createElement("td")
      const valor = fila[col]
      td.textContent = valor || "N/A"
      tr.appendChild(td)
    })

    // Botones de acciones
    const tdAcciones = document.createElement("td")
    tdAcciones.innerHTML = `
      <button class="btnEditar" onclick="editarRegistro(${fila.id})">✏️ Editar</button>
      <button class="btnEliminar" onclick="eliminarRegistro(${fila.id})">🗑️ Eliminar</button>
    `
    tr.appendChild(tdAcciones)
    tabla.appendChild(tr)
  })
}

// ==================== BÚSQUEDA ====================

async function buscarPorId() {
  const id = buscarId.value.trim()

  if (!id) {
    mostrarMensaje("Ingresa un ID para buscar", "error")
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/${estadoActual}/${id}`)

    if (!response.ok) {
      mostrarMensaje("Registro no encontrado", "error")
      return
    }

    const dato = await response.json()

    // Determinar columnas según el estado
    let columnas = []
    if (estadoActual === "estudiantes") {
      columnas = [
        "id",
        "nombre",
        "correo",
        "carrera",
        "semestre_actual",
        "fecha_ingreso",
        "estado"
      ]
    } else if (estadoActual === "profesores") {
      columnas = ["id", "nombre", "correo", "departamento", "fecha_contratacion"]
    } else if (estadoActual === "cursos") {
      columnas = [
        "id",
        "nombre",
        "cant_creditos",
        "cupo_max",
        "profesor_id",
        "fecha_inicio",
        "fecha_fin"
      ]
    } else if (estadoActual === "inscripciones") {
      columnas = ["id", "estado", "estudiante_id", "curso_id"]
    }

    mostrarTabla([dato], columnas)
    buscarId.value = ""
  } catch (error) {
    mostrarMensaje("Error en la búsqueda", "error")
    console.error(error)
  }
}

// ==================== EDITAR ====================

async function editarRegistro(id) {
  try {
    const response = await fetch(`${API_URL}/api/${estadoActual}/${id}`)
    const dato = await response.json()

    registroEnEdicion = id

    if (estadoActual === "estudiantes") {
      document.getElementById("nombre").value = dato.nombre
      document.getElementById("correo").value = dato.correo
      document.getElementById("carrera").value = dato.carrera
      document.getElementById("semestre_actual").value = dato.semestre_actual
    } else if (estadoActual === "profesores") {
      document.getElementById("nombre").value = dato.nombre
      document.getElementById("correo").value = dato.correo
      document.getElementById("departamento").value = dato.departamento
    } else if (estadoActual === "cursos") {
      document.getElementById("nombre").value = dato.nombre
      document.getElementById("cant_creditos").value = dato.cant_creditos
      document.getElementById("cupo_max").value = dato.cupo_max
      document.getElementById("profesor_id").value = dato.profesor_id
      document.getElementById("fecha_inicio").value = dato.fecha_inicio
        .split("T")[0]
      document.getElementById("fecha_fin").value = dato.fecha_fin.split("T")[0]
    } else if (estadoActual === "inscripciones") {
      document.getElementById("estado").value = dato.estado
      document.getElementById("estudiante_id").value = dato.estudiante_id
      document.getElementById("curso_id").value = dato.curso_id
    }

    window.scrollTo(0, document.body.scrollHeight)
  } catch (error) {
    mostrarMensaje("Error al cargar el registro", "error")
    console.error(error)
  }
}

// ==================== GUARDAR ====================

async function guardarRegistro() {
  const datos = new FormData(formulario)
  const objeto = Object.fromEntries(datos)

  // Validaciones según el tipo
  if (estadoActual === "estudiantes") {
    if (!objeto.nombre || !objeto.correo || !objeto.carrera) {
      mostrarMensaje("Completa todos los campos obligatorios", "error")
      return
    }
    objeto.semestre_actual = Number(objeto.semestre_actual)
  }

  if (estadoActual === "profesores") {
    if (!objeto.nombre || !objeto.correo || !objeto.departamento) {
      mostrarMensaje("Completa todos los campos obligatorios", "error")
      return
    }
  }

  if (estadoActual === "cursos") {
    if (
      !objeto.nombre ||
      !objeto.cant_creditos ||
      !objeto.cupo_max ||
      !objeto.profesor_id
    ) {
      mostrarMensaje("Completa todos los campos obligatorios", "error")
      return
    }
    objeto.cant_creditos = Number(objeto.cant_creditos)
    objeto.cupo_max = Number(objeto.cupo_max)
    objeto.profesor_id = Number(objeto.profesor_id)
  }

  if (estadoActual === "inscripciones") {
    if (!objeto.estado || !objeto.estudiante_id || !objeto.curso_id) {
      mostrarMensaje("Completa todos los campos obligatorios", "error")
      return
    }
    objeto.estudiante_id = Number(objeto.estudiante_id)
    objeto.curso_id = Number(objeto.curso_id)
  }

  try {
    let response

    if (registroEnEdicion) {
      // Actualizar
      response = await fetch(
        `${API_URL}/api/${estadoActual}/${registroEnEdicion}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(objeto)
        }
      )
    } else {
      // Crear
      response = await fetch(`${API_URL}/api/${estadoActual}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objeto)
      })
    }

    if (!response.ok) {
      const error = await response.json()
      mostrarMensaje(error.error || error.mensaje || "Error al guardar", "error")
      return
    }

    mostrarMensaje(
      registroEnEdicion ? "Registro actualizado" : "Registro creado",
      "success"
    )
    registroEnEdicion = null
    formulario.reset()

    // Recargar lista
    if (estadoActual === "estudiantes") cargarEstudiantes()
    else if (estadoActual === "profesores") cargarProfesores()
    else if (estadoActual === "cursos") cargarCursos()
    else if (estadoActual === "inscripciones") cargarInscripciones()
  } catch (error) {
    mostrarMensaje("Error al guardar el registro", "error")
    console.error(error)
  }
}

// ==================== ELIMINAR ====================

async function eliminarRegistro(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/${estadoActual}/${id}`, {
      method: "DELETE"
    })

    if (!response.ok) {
      mostrarMensaje("Error al eliminar", "error")
      return
    }

    mostrarMensaje("Registro eliminado", "success")

    // Recargar lista
    if (estadoActual === "estudiantes") cargarEstudiantes()
    else if (estadoActual === "profesores") cargarProfesores()
    else if (estadoActual === "cursos") cargarCursos()
    else if (estadoActual === "inscripciones") cargarInscripciones()
  } catch (error) {
    mostrarMensaje("Error al eliminar el registro", "error")
    console.error(error)
  }
}

// ==================== QUERIES ESPECIALES ====================

async function cargarTop10() {
  titulo.textContent = "Top 10 Estudiantes por Semestre"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/estudiantes/top-10`)
    const datos = await response.json()

    mostrarTabla(datos, ["nombre", "carrera", "semestre_actual"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarCursosProgramacionMatematicas() {
  titulo.textContent = "Cursos de Programación / Matemáticas"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(
      `${API_URL}/api/cursos/programacion-matematicas`
    )
    const datos = await response.json()

    mostrarTabla(datos, [
      "id",
      "nombre",
      "cant_creditos",
      "cupo_max",
      "profesor_id"
    ])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarCursosPorInscripciones() {
  titulo.textContent = "Cursos por Inscripciones"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/cursos/inscripciones`)
    const datos = await response.json()

    mostrarTabla(datos, ["nombre", "total_inscripciones"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarInscripcionesActivas() {
  titulo.textContent = "Inscripciones Activas"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/inscripciones/activas`)
    const datos = await response.json()

    mostrarTabla(datos, ["estudiante", "curso"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarProfesoresConTresCursos() {
  titulo.textContent = "Profesores con 3 o más Cursos"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/profesores/tres-o-mas-cursos`)
    const datos = await response.json()

    mostrarTabla(datos, ["id", "nombre", "cantidad_cursos"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarCursosConCupo() {
  titulo.textContent = "Cursos con Cupo Disponible"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/cursos/cupo-disponible`)
    const datos = await response.json()

    mostrarTabla(datos, ["nombre", "inscritos", "cupo_max"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarPromedioNotas() {
  titulo.textContent = "Promedio de Notas por Estudiante"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(`${API_URL}/api/estudiantes/promedio-notas`)
    const datos = await response.json()

    mostrarTabla(datos, ["id", "nombre", "promedio", "nota_mas_alta", "nota_mas_baja"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

async function cargarPromedioSuperior() {
  titulo.textContent = "Estudiantes con Promedio Superior"
  campos.innerHTML = ""
  buscarId.value = ""

  try {
    const response = await fetch(
      `${API_URL}/api/estudiantes/promedio-superior`
    )
    const datos = await response.json()

    mostrarTabla(datos, ["id", "nombre", "promedio", "nota_mas_alta", "nota_mas_baja"])
  } catch (error) {
    mostrarMensaje("Error al cargar los datos", "error")
    console.error(error)
  }
}

// ==================== INICIALIZACIÓN ====================

cargarEstudiantes()
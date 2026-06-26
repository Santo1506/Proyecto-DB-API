// server.ts
import express from "express"
import pool from "./db.js"

const app = express()
const PORT = 3000

app.use(express.json())

app.get("/", (req:any, res:any) => {
  res.send("Servidor funcionando")
})

app.get("/test-db", async (req:any, res:any) => {
  try {
    const resultado = await pool.query("SELECT NOW()")

    res.json({
      mensaje: "Conexión exitosa a PostgreSQL",
      fecha: resultado.rows[0],
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: "Error conectando a la base de datos",
      error,
    })
  }
})
app.get("/tablas", async (req:any, res:any) => {
  try {
    const resultado = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    res.json(resultado.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      mensaje: "Error consultando las tablas",
      error,
    })
  }
})

// ESTUAIANTE

app.get("/columnas-estudiante", async (req:any, res:any) => {
  const resultado = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'estudiante'
    ORDER BY ordinal_position
  `)

  res.json(resultado.rows)
})

app.get("/api/estudiantes", async (req:any, res:any) => {
  const resultado = await pool.query(`
    SELECT id, nombre, correo, carrera, semestre_actual, fecha_ingreso, estado
    FROM estudiante
    ORDER BY id
  `)

  res.json(resultado.rows)
})

app.get("/api/estudiantes/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try{
    const resultado = await pool.query(`
      SELECT id, nombre, correo, carrera, semestre_actual, fecha_ingreso, estado
      FROM estudiante
      WHERE id=$1    
    `,[idNumero])

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Estudiante no encontrado"
      })
      return
    }

    res.json(resultado.rows[0])

  } catch (error){
    console.error(error)
    res.status(500).json({
      mensaje: "Error consultando estudiante",
      error,
    })
  }
})

app.post("/api/estudiantes", async (req:any, res:any) => {
  const {
    nombre,
    correo,
    carrera,
    semestre_actual
  } = req.body as {
    nombre: string
    correo: string
    carrera: string
    semestre_actual: number
  }

  if (
    !nombre?.trim() ||
    !correo?.trim() ||
    !carrera?.trim()
  ) {
    res.status(400).json({
      error: "Nombre, correo y carrera son obligatorios"
    })
    return
  }

  if (semestre_actual < 1 || semestre_actual > 10) {
    res.status(400).json({
      error: "El semestre debe estar entre 1 y 10"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO estudiante
       (
         nombre,
         correo,
         carrera,
         semestre_actual
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4
       )
       RETURNING *`,
      [
        nombre.trim(),
        correo.trim(),
        carrera.trim(),
        semestre_actual
      ]
    )

    res.status(201).json(rows[0])

  } catch (error) {
    console.error("Error al crear estudiante:", error)

    res.status(500).json({
      error: "Error al crear el estudiante"
    })
  }
})

app.put("/api/estudiantes/:id", async (req, res) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      error: "El id debe ser un número"
    })
    return
  }

  const {
    nombre,
    correo,
    carrera,
    semestre_actual
  } = req.body

  if (
    !nombre?.trim() ||
    !correo?.trim() ||
    !carrera?.trim()
  ) {
    res.status(400).json({
      error: "Nombre, correo y carrera son obligatorios"
    })
    return
  }

  if (semestre_actual < 1 || semestre_actual > 10) {
    res.status(400).json({
      error: "El semestre debe estar entre 1 y 10"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE estudiante
       SET
         nombre = $1,
         correo = $2,
         carrera = $3,
         semestre_actual = $4
       WHERE id = $5
       RETURNING *`,
      [
        nombre.trim(),
        correo.trim(),
        carrera.trim(),
        semestre_actual,
        idNumero
      ]
    )

    if (rows.length === 0) {
      res.status(404).json({
        error: "Estudiante no encontrado"
      })
      return
    }

    res.status(200).json(rows[0])

  } catch (error) {
    console.error("Error al actualizar estudiante:", error)

    res.status(500).json({
      error: "Error al actualizar el estudiante"
    })
  }
})



//Profesores


app.get("/api/profesores", async (req:any, res:any) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, correo, departamento, fecha_contratacion
      FROM profesor
      ORDER BY id
    `)

    res.json(resultado.rows)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: "Error consultando profesores",
      error,
    })
  }
})

app.get("/api/profesores/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(`
      SELECT id, nombre, correo, departamento, fecha_contratacion
      FROM profesor
      WHERE id = $1
    `, [idNumero])

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Profesor no encontrado"
      })
      return
    }

    res.json(resultado.rows[0])

  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: "Error consultando profesor",
      error,
    })
  }
})

app.post("/api/profesores", async (req:any, res:any) => {
  const {
    nombre,
    correo,
    departamento,
  } = req.body as {
    nombre: string
    correo: string
    departamento: string
  }

  if (
    !nombre?.trim() ||
    !correo?.trim() ||
    !departamento?.trim()
  ) {
    res.status(400).json({
      error: "Nombre, correo y departamento son obligatorios"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO profesor
       (
         nombre,
         correo,
         departamento
       )
       VALUES
       (
         $1,
         $2,
         $3
       )
       RETURNING *`,
      [
        nombre.trim(),
        correo.trim(),
        departamento.trim()
      ]
    )

    res.status(201).json(rows[0])

  } catch (error) {
    console.error("Error al crear profesor:", error)

    res.status(500).json({
      error: "Error al crear el profesor"
    })
  }
})


app.put("/api/profesores/:id", async (req, res) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      error: "El id debe ser un número"
    })
    return
  }

  const {
    nombre,
    correo,
    departamento
  } = req.body

  if (
    !nombre?.trim() ||
    !correo?.trim() ||
    !departamento?.trim()
  ) {
    res.status(400).json({
      error: "Nombre, correo y departamento son obligatorios"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE profesor
       SET
         nombre = $1,
         correo = $2,
         departamento = $3
       WHERE id = $4
       RETURNING *`,
      [
        nombre.trim(),
        correo.trim(),
        departamento.trim(),
        idNumero
      ]
    )

    if (rows.length === 0) {
      res.status(404).json({
        error: "Profesor no encontrado"
      })
      return
    }

    res.status(200).json(rows[0])

  } catch (error) {
    console.error("Error al actualizar profesor:", error)

    res.status(500).json({
      error: "Error al actualizar el profesor"
    })
  }
})



// CUrsos

app.get("/api/cursos", async (req:any, res:any) => {
  try {
    const resultado = await pool.query(`
      SELECT curso.id, curso.nombre, cant_creditos, profe.nombre as profesor , cupo_max
      FROM curso
      LEFT JOIN profesor profe On curso.profesor_id = profe.id
      ORDER BY curso.id
    `)

    res.json(resultado.rows)

  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: "Error consultando cursos",
      error,
    })
  }
})


app.get("/api/cursos/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(`
      SELECT curso.id, curso.nombre, cant_creditos, profe.nombre as profesor , cupo_max
      FROM curso
      LEFT JOIN profesor profe On curso.profesor_id = profe.id
      WHERE curso.id = $1
    `, [idNumero])

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Curso no encontrado"
      })
      return
    }

    res.json(resultado.rows[0])

  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: "Error consultando curso",
      error,
    })
  }
})

app.post("/api/cursos", async (req:any, res:any) => {
  const {
    nombre,
    cant_creditos,
    profesor_id,
    cupo_max,
  } = req.body as {
    nombre: string
    cant_creditos: number
    profesor_id: number
    cupo_max: number
  }

  if (
    !nombre?.trim()
  ) {
    res.status(400).json({
      error: "Nombre es obligatorio"
    })
    return
  }

  if (cant_creditos < 1) {
    res.status(400).json({
      error: "La cantidad de creditos debe ser mayor a 0"
    })
    return
  }

  if (cupo_max < 1) {
    res.status(400).json({
      error: "EL cupo maximo debe ser mayor a 0"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO curso
       (
         nombre,
         cant_creditos,
         profesor_id,
         cupo_max
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4
       )
       RETURNING *`,
      [
        nombre.trim(),
        cant_creditos,
        profesor_id,
        cupo_max,       
      ]
    )

    res.status(201).json(rows[0])

  } catch (error) {
    console.error("Error al crear curso:", error)

    res.status(500).json({
      error: "Error al crear el curso"
    })
  }
})

app.put("/api/cursos/:id", async (req, res) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      error: "El id debe ser un número"
    })
    return
  }

  const {
    nombre,
    cant_creditos,
    profesor_id,
    cupo_max
  } = req.body

  if (!nombre?.trim()) {
    res.status(400).json({
      error: "El nombre es obligatorio"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE curso
       SET
         nombre = $1,
         cant_creditos = $2,
         profesor_id = $3,
         cupo_max = $4
       WHERE id = $5
       RETURNING *`,
      [
        nombre.trim(),
        cant_creditos,
        profesor_id,
        cupo_max,
        idNumero
      ]
    )

    if (rows.length === 0) {
      res.status(404).json({
        error: "Curso no encontrado"
      })
      return
    }

    res.status(200).json(rows[0])

  } catch (error) {
    console.error("Error al actualizar curso:", error)

    res.status(500).json({
      error: "Error al actualizar el curso"
    })
  }
})


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
// server.ts
import express from "express"
import pool from "./db.js"

const app = express()
const PORT = 3000

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Servidor funcionando")
})

app.get("/test-db", async (req, res) => {
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
app.get("/tablas", async (req, res) => {
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

app.get("/columnas-estudiante", async (req, res) => {
  const resultado = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'estudiante'
    ORDER BY ordinal_position
  `)

  res.json(resultado.rows)
})

app.get("/api/estudiantes", async (req, res) => {
  const resultado = await pool.query(`
    SELECT id, nombre, correo, carrera, semestre_actual, fecha_ingreso, estado
    FROM estudiante
    ORDER BY id
  `)

  res.json(resultado.rows)
})

app.get("/api/estudiantes/:id", async (req, res) => {
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

app.get("/api/profesores", async (req, res) => {
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


app.get("/api/profesores/:id", async (req, res) => {
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


app.post("/api/estudiantes", async (req, res) => {
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


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
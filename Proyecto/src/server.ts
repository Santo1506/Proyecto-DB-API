// server.ts
import express from "express"
import cors from "cors"
import pool from "./db.js"

const app = express()
const PORT = 3000

app.use(cors())
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

app.delete("/api/estudiantes/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(
      `
      DELETE FROM estudiante
      WHERE id = $1
      RETURNING *
      `,
      [idNumero]
    )

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Estudiante no encontrado"
      })
      return
    }

    res.json({
      mensaje: "Estudiante eliminado correctamente",
      estudiante: resultado.rows[0]
    })

  } catch (error) {
    console.error("Error eliminando estudiante:", error)

    res.status(500).json({
      mensaje: "Error eliminando estudiante",
      error
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

app.delete("/api/profesores/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(
      `
      DELETE FROM profesor
      WHERE id = $1
      RETURNING *
      `,
      [idNumero]
    )

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Profesor no encontrado"
      })
      return
    }

    res.json({
      mensaje: "Profesor eliminado correctamente",
      estudiante: resultado.rows[0]
    })

  } catch (error) {
    console.error("Error eliminando profesor:", error)

    res.status(500).json({
      mensaje: "Error eliminando profesor",
      error
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

app.delete("/api/cursos/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(
      `
      DELETE FROM cursos
      WHERE id = $1
      RETURNING *
      `,
      [idNumero]
    )

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Curso no encontrado"
      })
      return
    }

    res.json({
      mensaje: "Curso eliminado correctamente",
      estudiante: resultado.rows[0]
    })

  } catch (error) {
    console.error("Error eliminando curso:", error)

    res.status(500).json({
      mensaje: "Error eliminando curso",
      error
    })
  }
})
// INSCRIPCIONES

app.get("/api/inscripciones", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, fecha_ins, estado, estudiante_id, curso_id
      FROM inscripcion
      ORDER BY id
    `)

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar inscripciones:", error)

    res.status(500).json({
      error: "Error al obtener las inscripciones"
    })
  }
})

app.post("/api/inscripciones", async (req, res) => {
  const {
    estado,
    estudiante_id,
    curso_id
  } = req.body

  if (!estado || !estudiante_id || !curso_id) {
    res.status(400).json({
      error: "Todos los campos son obligatorios"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO inscripcion
      (estado, estudiante_id, curso_id)
      VALUES
      ($1, $2, $3)
      RETURNING *`,
      [estado, estudiante_id, curso_id]
    )
    res.status(201).json(rows[0])

  } catch (error) {
    console.error("Error al crear inscripción:", error)

    res.status(500).json({
      error: "Error al crear la inscripción"
    })
  }
})


app.put("/api/inscripciones/:id", async (req, res) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      error: "El id debe ser un número"
    })
    return
  }

  const {
    estado,
    estudiante_id,
    curso_id
  } = req.body

  if (!estado || !estudiante_id || !curso_id) {
    res.status(400).json({
      error: "Todos los campos son obligatorios"
    })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE inscripcion
       SET
         estado = $1,
         estudiante_id = $2,
         curso_id = $3
       WHERE id = $4
       RETURNING *`,
      [
        estado,
        estudiante_id,
        curso_id,
        idNumero
      ]
    )

    if (rows.length === 0) {
      res.status(404).json({
        error: "Inscripción no encontrada"
      })
      return
    }

    res.status(200).json(rows[0])

  } catch (error) {
    console.error("Error al actualizar inscripción:", error)

    res.status(500).json({
      error: "Error al actualizar la inscripción"
    })
  }
})

app.delete("/api/inscripciones/:id", async (req:any, res:any) => {
  const idNumero = Number(req.params.id)

  if (Number.isNaN(idNumero)) {
    res.status(400).json({
      mensaje: "El id debe ser un número"
    })
    return
  }

  try {
    const resultado = await pool.query(
      `
      DELETE FROM inscripcion
      WHERE id = $1
      RETURNING *
      `,
      [idNumero]
    )

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: "Inscripcion no encontrada"
      })
      return
    }

    res.json({
      mensaje: "Inscripcion eliminada correctamente",
      estudiante: resultado.rows[0]
    })

  } catch (error) {
    console.error("Error eliminando inscripcion:", error)

    res.status(500).json({
      mensaje: "Error eliminando inscripcion",
      error
    })
  }
})

// QUERIES

app.get("/api/estudiantes/top-10", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT nombre, carrera, semestre_actual
      FROM estudiante
      ORDER BY semestre_actual DESC
      LIMIT 10`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al listar los estudiantes:", error)

    res.status(500).json({
      error: "Error al obtener los estudiantes"
    })
  }
})

app.get("/api/cursos/programacion-matematicas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM curso
       WHERE
         (nombre LIKE '%rogramacion%'
         OR nombre LIKE '%atematicas%')
       AND cant_creditos BETWEEN 3 AND 5`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar los cursos:", error)

    res.status(500).json({
      error: "Error al obtener los cursos"
    })
  }
})


app.get("/api/cursos/inscripciones", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        b.nombre,
        COUNT(*) AS total_inscripciones
      FROM inscripcion a
      INNER JOIN curso b
        ON a.curso_id = b.id
      GROUP BY b.nombre
      ORDER BY COUNT(*) DESC`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al obtener las inscripciones por curso:", error)

    res.status(500).json({
      error: "Error al obtener las inscripciones por curso"
    })
  }
})

app.get("/api/inscripciones/activas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        b.nombre AS estudiante,
        c.nombre AS curso
      FROM inscripcion a
      INNER JOIN estudiante b
        ON a.estudiante_id = b.id
      INNER JOIN curso c
        ON a.curso_id = c.id
      WHERE a.estado = 'activa'`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar las inscripciones activas:", error)

    res.status(500).json({
      error: "Error al obtener las inscripciones activas"
    })
  }
})

app.get("/api/estudiantes/inscripciones", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        a.nombre AS estudiante,
        c.nombre AS curso,
        b.estado
      FROM estudiante a
      LEFT JOIN inscripcion b
        ON a.id = b.estudiante_id
      LEFT JOIN curso c
        ON c.id = b.curso_id`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar las inscripciones de los estudiantes:", error)

    res.status(500).json({
      error: "Error al obtener las inscripciones de los estudiantes"
    })
  }
})

app.get("/api/profesores/tres-o-mas-cursos", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        a.id,
        a.nombre,
        COUNT(*) AS cantidad_cursos
      FROM profesor a
      INNER JOIN curso c
        ON c.profesor_id = a.id
      GROUP BY a.id, a.nombre
      HAVING COUNT(*) >= 3`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar profesores:", error)

    res.status(500).json({
      error: "Error al obtener los profesores"
    })
  }
})

app.get("/api/cursos/cupo-disponible", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        curso.nombre,
        COUNT(*) AS inscritos,
        curso.cupo_max
      FROM inscripcion
      INNER JOIN curso
        ON curso.id = inscripcion.curso_id
      GROUP BY
        curso.id,
        curso.nombre,
        curso.cupo_max
      HAVING COUNT(*) < curso.cupo_max`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar cursos con cupo disponible:", error)

    res.status(500).json({
      error: "Error al obtener los cursos"
    })
  }
})

app.get("/api/estudiantes/promedio-notas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        a.id,
        a.nombre,
        ROUND(AVG(c.valor_nota), 2) AS promedio,
        MAX(c.valor_nota) AS nota_mas_alta,
        MIN(c.valor_nota) AS nota_mas_baja
      FROM estudiante a
      INNER JOIN inscripcion b
        ON a.id = b.estudiante_id
      INNER JOIN nota c
        ON c.inscripcion_id = b.id
      GROUP BY
        a.id,
        a.nombre`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar las notas de los estudiantes:", error)

    res.status(500).json({
      error: "Error al obtener las notas de los estudiantes"
    })
  }
})

app.get("/api/estudiantes/promedio-superior", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        a.id,
        a.nombre,
        ROUND(AVG(c.valor_nota), 2) AS promedio,
        MAX(c.valor_nota) AS nota_mas_alta,
        MIN(c.valor_nota) AS nota_mas_baja
      FROM estudiante a
      INNER JOIN inscripcion b
        ON a.id = b.estudiante_id
      INNER JOIN nota c
        ON c.inscripcion_id = b.id
      GROUP BY
        a.id,
        a.nombre
      HAVING AVG(c.valor_nota) >
        (
          SELECT AVG(valor_nota)
          FROM nota
        )`
    )

    res.json(rows)

  } catch (error) {
    console.error("Error al consultar los estudiantes:", error)

    res.status(500).json({
      error: "Error al obtener los estudiantes"
    })
  }
})

app.put("/api/inscripciones/reprobar", async (_req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE inscripcion_clonebk
       SET estado = 'reprobada'
       WHERE 60 > (
         SELECT AVG(c.valor_nota)
         FROM nota c
         INNER JOIN inscripcion b
           ON c.inscripcion_id = b.id
         WHERE b.id = inscripcion_clonebk.id
         GROUP BY b.id
       )`
    )

    res.status(200).json({
      mensaje: "Inscripciones actualizadas correctamente",
      registros_actualizados: rowCount
    })

  } catch (error) {
    console.error("Error al actualizar las inscripciones:", error)

    res.status(500).json({
      error: "Error al actualizar las inscripciones"
    })
  }
})



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
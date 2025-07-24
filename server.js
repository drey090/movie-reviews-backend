// server.js
import 'dotenv/config'
import express         from 'express'
import cors            from 'cors'
import { MongoClient } from 'mongodb'
import MoviesDAO       from './dao/movies.dao.js'
import moviesRouter    from './api/movies.route.js'

const app = express()
app.use(cors(), express.json())

async function start() {
  // 1) connect the client
  const client = new MongoClient(process.env.MOVIEREVIEWS_DB_URI)
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    // 2) inject into DAO
    await MoviesDAO.injectDB(client)
    console.log('✅ MoviesDAO initialized')

    // 3) now mount your routes
    app.use('/api/v1/movies', moviesRouter)

    // 4) catch‑all 404 (after all routes)
    app.use((req, res) => res.status(404).json({ error: 'not found' }))

    // 5) start the HTTP server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    )
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e)
    process.exit(1)
  }
}

start()

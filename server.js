// server.js
import 'dotenv/config'
import express         from 'express'
import cors            from 'cors'
import { MongoClient } from 'mongodb'
import MoviesDAO       from './dao/movies.dao.js'
import moviesRouter    from './api/movies.route.js'

const app = express()

// ←↓↓ UPDATE THIS PART ↓↓←
app.use(cors({
  origin: [
    'http://localhost:3000',                       // React dev (CRA)
    'http://localhost:5173',                       // Vite dev
    'http://localhost:5174',  
    'https://movie-reviews-frontend-kappa.vercel.app', // Your production URL
    /\.vercel\.app$/                               // Any Vercel preview URL
  ],
  credentials: true
}))
app.use(express.json())
// ↑↑ UPDATE ABOVE ↑↑

// everything else stays the same
async function start() {
  const client = new MongoClient(process.env.MOVIEREVIEWS_DB_URI)
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    await MoviesDAO.injectDB(client)
    console.log('✅ MoviesDAO initialized')

    app.use('/api/v1/movies', moviesRouter)
    app.use((req, res) => res.status(404).json({ error: 'not found' }))

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

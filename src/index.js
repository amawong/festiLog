const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const eventsRoutes = require('./routes/events')
const setsRoutes = require('./routes/sets')
const artistsRoutes = require('./routes/artists')
const statsRoutes = require('./routes/stats')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/events', setsRoutes)
app.use('/api/sets', setsRoutes)
app.use('/api/artists', artistsRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => res.json({ status: 'FestiLog API running' }))

app.listen(PORT, () => console.log(`Server on port ${PORT}`))
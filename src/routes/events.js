const router = require('express').Router()
const prisma = require('../lib/prisma')               // database connection
const authMiddleware = require('../middleware/auth')  // security

// POST /api/events - log a new event
router.post('/', authMiddleware, async(req, res) => {
    const userId = req.userId
    // what data is the user sending? concert/festival, date, rating, notes, genre?
    const { name, venue, city, date, genre, notes } = req.body
    // middleware runs before route handler and attaches userId to the request
    // validation for necessary fields
    if (!name || !city || !date) {
        return res.status(400).json({ error: 'All fields required' })  //400: bad request; client error
    }
    try {
            const parsedDate =  new Date(date)
            if (isNaN(parsedDate)) {
                return res.status(400).json({ error: 'Invalid date format'})
            }
            
            const event = await prisma.event.create({
                data: { user: { connect: { id: req.userId } }, name, city, date: parsedDate, venue, genre, notes }
            })
            res.status(201).json({ event })  // res.json() defaults to 200 automatically
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }

    }
)

// GET /api/events - gets all events in db
    router.get('/', authMiddleware, async(req, res) => {
        const userId = req.userId
        try {
            const event = await prisma.event.findMany({ where: { userId } })
            res.status(201).json({ event })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })

// GET /api/events/:id - gets single events by id
    router.get('/:id', authMiddleware, async(req, res) => {   // tell Express to expect an ID in the URL
        const { id } = req.params  // URL params live in req.params not req.body
        try {
            const event = await prisma.event.findUnique({ where: { id } })
            if (!event) {
                return res.status(404).json({ error: 'Not Found' })
            }
            if (event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            } 
            res.json({ event })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }

    })

// PUT /api/events/:id - edit an event
    router.put('/:id', authMiddleware, async(req, res) => {
        const { name, venue, city, date, genre, notes } = req.body
        const { id } = req.params           // destructuring is cleaner when pulling multiple vals; dot notation is valid too: const id = req.params.id
        try {
            const data = {name, venue, city, genre, notes}
            if (date) {
                const parsedDate = new Date(date)
                if (isNaN(parsedDate)) {
                    return res.status(400).json({ error: 'Invalid date format'})
                }
                data.date = parsedDate
            }
            
            const event = await prisma.event.findUnique({ where: { id }})
            if (!event) {
                return res.status(404).json({ error: 'Not found' })
            }
            if (event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            const updatedEvent = await prisma.event.update({ 
                where: { id },
                data 
            })
            res.json({ updatedEvent })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })

// DELETE /api/events/:id - delete a single event
    router.delete('/:id', authMiddleware, async(req, res) => {
        const { id } = req.params
        try {
            const event = await prisma.event.findUnique({ where: { id } })
            if (!event) {
                return res.status(404).json({ error: 'Not found' })
            }
            if (event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            await prisma.event.delete({ where: { id } })
            res.json({ message: 'Event deleted' })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })



module.exports = router
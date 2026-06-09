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
                return res.status(400).json({ error: 'Invalid date fromat'})
            }
            
            const event = await prisma.event.create({
                data: { user: { connect: { id: req.userId } }, name, city, date: parsedDate, venue, genre, notes }
            })
            res.status(201).json({ event })  // res.json() defaults to 200 automatically
        } catch (e) {
            console.log(e)
            res.status(500).json({ error: 'Server error' })
        }

    }
)


module.exports = router
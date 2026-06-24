const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')
const authMiddleware = require('../middleware/auth')


// POST /api/events/:id/sets - log a new set in an event
    router.post('/:eventId/sets', authMiddleware, async(req, res) => {
        const { eventId } = req.params      // get the ID of the event the set is attached to
        const { artist, rating, startTime, notes } = req.body
       
        if (!artist || !rating) {          // validate all required fields
            return res.status(400).json({ error: 'All fields required' })
        }
        const parsedRating = parseInt(rating)   // parse rating since it's inputted as a string

        try {
            const event = await prisma.event.findUnique({ where: {id: eventId } })  // find event
            if (!event) {
                return res.status(404).json({ error: 'Not found' })
            }
            if (event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            }

            const artistRecord = await prisma.artist.upsert({   // upsert creates if not found and updates if found; params: where, create, and update
                where: { name: artist },                        // upsert only works on unique fields
                create: { name: artist },
                update: {} 
            })

            const set = await prisma.set.create({               // create set
                data: { 
                    event: { connect: { id: eventId } },
                    artist: { connect: { id: artistRecord.id } },
                    rating: parsedRating, 
                    startTime: startTime ? new Date(startTime) : null, 
                    notes
                }
            })
            res.status(201).json({ set })
        } catch (e) {
            res.status(500).json({ error: 'Server Error' })
        }
    })

// PUT /api/sets/:id - edit a set
    router.put('/:id', authMiddleware, async(req, res) => {
        const { id } = req.params
        const { rating, startTime, notes } = req.body

        try {
            const set = await prisma.set.findUnique({ 
                where: { id },
                include: { event: true } 
            })

            if (!set) {
                return res.status(404).json({ error: 'Not found' })
            }

            if (set.event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            }

            const data = { notes } 
            if (rating) {
                const parsedRating = parseInt(rating)
                data.rating = parsedRating
            }
            
            if (startTime) {
                const parsedST = new Date(startTime)
                data.startTime = parsedST
            }
            

            const updatedSet = await prisma.set.update({
                where: { id },
                data
            })
            res.status(200).json({ updatedSet })

        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })

// DELETE /api/sets/:id
    router.delete('/:id', authMiddleware, async(req, res) => {
        const { id } = req.params
        try {
            const set = await prisma.set.findUnique({ 
                where: { id },
                include: { event: true }
            })
            if (!set) {
                return res.status(404).json({ error: 'Not found'})
            }
            if (set.event.userId !== req.userId) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            await prisma.set.delete({ where: { id }})
            res.json({ message: 'Set deleted' })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })

module.exports = router
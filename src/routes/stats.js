const router = require('express').Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

// GET /api/stats - totals (events count, artists count, sets count, average rating)
    router.get('/', authMiddleware, async(req, res) => {
        try {
            const eventsCount = await prisma.event.count({
                where: { userId: req.userId }
            })
            const artistsCount = await prisma.artist.count({
                where: { 
                    sets: { some: { event: {userId: req.userId } } } }
                })
            const setsCount = await prisma.set.count({
                where: { event: {userId: req.userId } } 
            })
            const ratingData = await prisma.set.aggregate({
                where: { event: { userId: req.userId } },
                _avg: { rating: true }
            })
            res.status(200).json({ eventsCount, artistsCount, setsCount, avgRating: ratingData._avg.rating })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })


// GET /api/stats/timeline - events grouped by month for a chart
    router.get('/timeline', authMiddleware, async(req, res) => {
        try {
            const events = await prisma.event.findMany({
                where: { userId: req.userId },
                select: { date: true },
                orderBy: { date: 'asc'}
            })
            const timeline = events.reduce((acc, event) => {
                const month = event.date.toISOString().slice(0, 7)
                acc[month] = (acc[month] || 0) + 1
                return acc
            }, {})
            res.status(200).json({ timeline })
        } catch (e) {
            res.status(500).json({ error: 'Server error' })
        }
    })

module.exports = router
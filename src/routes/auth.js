// register and login logic lives here
const router = require('express').Router() // Express's way of grouping routes
const bcrypt = require('bcryptjs')         // hashes passwords so they're not stored in plain text
const jwt = require('jsonwebtoken')        // signs and verifies tokens
const prisma = require('../lib/prisma')    // database client from lib/prisma.js

// POST: register
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields required' })  //400: bad request; client error
    }
    try {
        const hash = await bcrypt.hash(password, 10)    // awwait waits for the hashing to finish before mvoing to next line; 10 rounds of hashing
        const user = await prisma.user.create({         // inserts a new row into users table
            data: { email, username, password: hash }
        })
        const token = jwt.sign(      // create a signed token containing { userID: user.id }
            { userId: user.id },
            process.env.JWT_SECRET,  // this is the secret key used to sign it; only my server knows this
            { expiresIn: '7d' }      
        )
        res.status(201).json({ token, user: { id: user.id, email, username } }) // 201: created
    } catch (e) {
        if (e.code === 'P2002') {    // P2002 is prisma's error code for a unique constraint violation
            return res.status(409).json({ error: 'Email or username taken'}) // 409: conflict
        }
        res.status(500).json({ error: 'Server error' })
    }

})

// POST: login
router.post('/login', async(req, res) => {
    const { email, password } = req.body                             // pull email and pass from req.body
    
    try {
        const user = await prisma.user.findUnique({ where: { email } })  // find the user by email; findUnique() needs a where clause
        if (!user) {    //if no user found, return 401 code
            return res.status(401).json({ error: 'Invalid Credentials'})
        }

        const valid = await bcrypt.compare(password, user.password)      // check password; need 'await' to get an actual result back instead of just promise obj
        if (!valid) {
            return res.status(401).json({ error: 'Invalid Credentials' }) // if wrong, return 401 code
        }                                                            // otherwise, return a token

        const token = jwt.sign(
            { userID: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        res.status(200).json({ token, user: { id: user.id, email: user.email, username: user.username }})  // res.json() defaults to 200 automatically
    } catch (e) {
        res.status(500).json({ error: 'Server error' })
    }
}
)

module.exports = router
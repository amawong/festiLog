// imports the PrismaClient from the Prisma package
const { PrismaClient } = require('@prisma/client')

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma     // the global object survives nodemon restarts
}

module.exports = prisma
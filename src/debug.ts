import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client'

const app = new Hono()

const prisma = new PrismaClient()

app.get('/show_user', async (c) => {
return c.json({})
})

app.get('/show_session_ids', async(c) => {
return c.json({})
})

export default app
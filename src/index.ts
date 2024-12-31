import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { createClient } from '@supabase/supabase-js'
import { formatISO, nextDay } from "date-fns";
import { HTTPException } from 'hono/http-exception'
import { loginAuthrizationInfomation, signupAuthrizationInfomation } from './schama/auth.schama';
import { boolean, date, ZodError } from 'zod';
import { password } from 'bun';
import AuthRoute from "./auth";
import DebugRoute from "./debug"
import { verifyUser } from "./auth"
import { PrismaClient } from '@prisma/client'

const app = new Hono()

app.route("/auth", AuthRoute)
app.route("/debug", DebugRoute)

const prisma = new PrismaClient()

let posts : Array<{user_id: string, date: string, body: string}> = []

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/service/post', async (c) => {
  const {
    session_id,
    body
  } = await c.req.json()

  try {
    const user_id = await verifyUser(session_id)

    const postHandler = await prisma.post.create({
      data: {
        createdAt: formatISO(new Date()),
        userId: user_id,
        body: body,
      }
    })

  } catch (e) {
    if (e instanceof HTTPException) {
      throw e
    }
    
    throw new HTTPException(500, {
      message: 'Not connection'
    })
  }

  return c.text("success", 200)
})


app.get('/service/getTimeline', async (c) => {

  try
  {  
  
  const totalPosts = await prisma.post.count();
  const takeCount = Math.min(totalPosts, 200);
  const postGetHandler = await prisma.post.findMany({
    orderBy: {
      id: "desc"
    },
    take: takeCount
  })

  const forJsonPosts = postGetHandler.map((post) => { // JSON can't handle BIGINT
    return {
      id: String(post.id),
      createdAt: post.createdAt,
      userId: post.userId,
      body: post.body
    }
  })

  return c.json(forJsonPosts)

  }
  catch(e) {
    console.log(e)
  }

})


app.onError((error, c) => {
  if  (error instanceof HTTPException) {
    return c.json({
      message: error.message
    }, error.status)
  }
  return c.json({
    message: 'Internal Server Error'
  }, 500)
})

export default app
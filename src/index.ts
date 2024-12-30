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
import { ZodError } from 'zod';
import { password } from 'bun';
import AuthRoute from "./auth";
import { PrismaClient } from '@prisma/client'

const app = new Hono()

app.route("/auth",AuthRoute)

const prisma = new PrismaClient()

let users : {
  [user_id: string]: {password: string, salt: string}
} = {
  "admin": {password: "CT5MXoRhKrEmekATmm5h8vjjbhUwaTH+ugc8gANn6rY", salt: "aP6GF++Z/VbytX6pT3QSynlRyBNwkJ19F0VfXImVOYM"} //password:password
}

let session_ids : {[uuid: string]: string} = {
  "922d2784-e860-4d5f-b42b-6b03b502cbb5": "admin"
}

let posts : Array<{user_id: string, date: string, body: string}> = []

const loginUser = (user_id: string, password: string): boolean => {
  return password === users[user_id]["password"]
}

const verifyUser = (session_id: string) => {
  const user_id = session_ids[session_id]

  if (user_id) {
    return user_id
  } else {
    throw new HTTPException(401, {
      message: "Not found user in session_ids"
    })
  }
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/service/post', async (c) => {
  const {
    session_id,
    body
  } = await c.req.json()

  try {
    const user_id = verifyUser(session_id)
    posts.push({
      user_id : user_id,
      date: formatISO(new Date()),
      body: body
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
  return c.json(posts.slice(0, 200))
})


app.get('/system/show_user', async (c) => {
  return c.json(users)
})

app.get('/system/show_session_ids', async(c) => {
  return c.json(session_ids)
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
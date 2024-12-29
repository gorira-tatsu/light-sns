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
import { formatISO } from "date-fns";

const app = new Hono()

let users : {[user_id: string]: string} = {
  "admin": "password"
}
let session_ids : {[uuid: string]: string} = {
  "922d2784-e860-4d5f-b42b-6b03b502cbb5": "admin"
}

let posts : Array<{user_id: string, date: string, body: string}> = []

const loginUser = (user_id: string, password: string): boolean => {
  return password === users[user_id]
}

const verifyUser = (session_id: string) => {
  try {
    const user_id = session_ids[session_id]
    return user_id
  } catch (e) {
   throw new Error("Not found user in session_ids")
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
    console.error(e)
    return c.text("Not found user in session_ids" ,400)
  }

  return c.text("success", 200)
})

app.get('/service/getTimeline', async (c) => {
  return c.json(posts.slice(0, 200))
})

app.post('/auth/login', async (c) => {
  const {user_id, password} = await c.req.json();
  
  if (loginUser(user_id, password)) {
    const uuid = crypto.randomUUID();
    setCookie(c, 'session_id', uuid)
    session_ids[uuid] = user_id
    return c.text("success", 200)
  }
  else {
    return c.text("unsolved", 400)
  }
})

app.post('/auth/signup', async (c) => {
  const {user_id, password} = await c.req.json();

  console.log("test")

  if (!users[user_id]) {
    users[user_id] = password
    console.log("success")
    return c.text("success", 200)
  }
  else {
    return c.text("already user_id", 400)
  }
})

app.get('/system/show_user', async (c) => {
  return c.json(users)
})

app.get('/system/show_session_ids', async(c) => {
  return c.json(session_ids)
})

export default { 
  port: 3000, 
  fetch: app.fetch, 
} 

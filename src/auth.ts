import { Hono } from 'hono'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { createClient } from '@supabase/supabase-js'
import { format, formatISO, nextDay } from "date-fns";
import { HTTPException } from 'hono/http-exception'
import { loginAuthrizationInfomation, signupAuthrizationInfomation } from './schama/auth.schama';
import { ZodError } from 'zod';
import { password } from 'bun';
import { Prisma, PrismaClient } from '@prisma/client'
import { use } from 'hono/jsx';

const app = new Hono()

const prisma = new PrismaClient()

export const verifyUser = async (session_id: string) => {

  const user_idHandler = await prisma.sessionIDs.findUnique({
    where: {
      UUID: session_id
    },
    select: {
      userId: true,
      UUID: true
    }
  })

  if (user_idHandler) {
    return user_idHandler["userId"]
  } else {
    throw new HTTPException(401, {
      message: "Not found user in session_ids"
    })
  }
}

app.post('/login', async (c) => {
    try{
        const { user_id, password } = loginAuthrizationInfomation.parse(await c.req.json())

        const getAimedUserAuthInfo = await prisma.userAuth.findUnique({
            where: {
                userId: user_id
            },
            select: {
              userId: true,
              password: true,
              salt: true,
            }
        })

        const aimedUserPassword = getAimedUserAuthInfo?.["password"]
        const aimedUserSalt = getAimedUserAuthInfo?.["salt"]
        const aimedUserHash = `$argon2id$v=19$m=65536,t=2,p=1$${aimedUserSalt}$${aimedUserPassword}`

        if (await Bun.password.verify(password, aimedUserHash)) {
          const uuid = crypto.randomUUID();

          setCookie(c, 'session_id', uuid)

          const sessionIdHandler = await prisma.sessionIDs.create({
            data: {
              createdAt: formatISO(new Date()),
              userId: user_id,
              UUID: uuid
            }
          })

          return c.text("login success", 200)
        }
        else {
        throw new HTTPException(401)
      }
    }catch(e){
      if (e instanceof ZodError){
        throw new HTTPException(400,{
          message:e.message
        })
      }
  
      if (e instanceof HTTPException){
        throw e
      }
  
      throw new HTTPException(500, {
        message: 'Internal Server Error'
      })
    }
  })
  
app.post('/signup', async (c) => {
try {
    const {user_id, user_name, password} = signupAuthrizationInfomation.parse(await c.req.json());

    const alreadyUser = await prisma.userAuth.findUnique({
        where: { userId: user_id },
        select: {
          userId: true
        }
    })

    if (!alreadyUser) {

    const generatedHash = await Bun.password.hash(password)
    const salt = generatedHash.split('$')[4]
    const hashedPassword = generatedHash.split('$')[5]

    const userAuthHandler = await prisma.userAuth.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: user_id,
            password: hashedPassword,
            salt: salt,
        }
    })

    const userHandler = await prisma.user.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: user_id,
            userName: user_name,
        }
    })

    return c.text("success", 200)
    }
    else {
    throw new HTTPException(400, {
        message: "already user_id",
    })
    }
} catch (e) {

    console.debug(e)

    if (e instanceof ZodError){
    throw new HTTPException(400,{
        message:e.message
    })
    }

    if (e instanceof HTTPException){
    throw e
    }

    throw new HTTPException(500, {
    message: 'Internal Server Error'
    })
}
})

export default app
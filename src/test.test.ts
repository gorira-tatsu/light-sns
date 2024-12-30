import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { expect, test, describe } from 'bun:test'
import app from './index'
import {} from './index'

// Route tests

describe('GET /', () => {
  test('Check the Service', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })
})

describe('POST /service/post', () => {
  test('should succeed with valid session_id', async () => {
    const res = await app.request(`/service/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "session_id": "922d2784-e860-4d5f-b42b-6b03b502cbb5",
        "body": "foobar"
      })
    })
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('success')
  })

  test('should said error with miss session_id', async () => {
    const res = await app.request(`/service/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "session_id": "foobar",
        "body": "foobar"
      })
    })
    expect(res.status).toBe(401)
    expect((await res.json()).message).toBe("Not found user in session_ids")
  })
})

describe('POST /auth/login', () => {
  test('should succeed with equal authrization info', async () => {
    const res = await sendRequest(
      '/auth/login', 
      JSON.stringify({
           "user_id": "admin",
           "password": "password"
      })
    )
    
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("login success")
  })

  test('should say error with invalid authrization info', async () => {
    const res = await sendRequest(
      '/auth/login',
      JSON.stringify(
        {
          "user_id": "admin",
          "password": "passw0rd" // o -> 0
        }
      )
    )

    expect(res.status).toBe(401)
  })

  test('should say error with missing user_id', async () => {
    const res = await sendRequest(
      '/auth/login',
      JSON.stringify({
        "password": "password"
      })
    )

    expect(res.status).toBe(400)
  })

  test('should say error with missing password', async () => {
    const res = await sendRequest(
      '/auth/login',
      JSON.stringify({
        "user_id": "admin"
      })
    )

    expect(res.status).toBe(400)
  })
})

describe('POST /auth/signup', () => {
  test('should succeed with new user_id', async () => {
    const res = await sendRequest(
      '/auth/signup',
      JSON.stringify({
        "user_id": "new_user",
        "password": "new_password"
      })
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe("success")
  })

  test('should say error with existing user_id', async () => {
    const res = await sendRequest(
      '/auth/signup',
      JSON.stringify({
        "user_id": "admin",
        "password": "password"
      })
    )

    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe("already user_id")
  })

  test('should say error with missing user_id', async () => {
    const res = await sendRequest(
      '/auth/signup',
      JSON.stringify({
        "password": "password"
      })
    )

    expect(res.status).toBe(400)
  })

  test('should say error with missing password', async () => {
    const res = await sendRequest(
      '/auth/signup',
      JSON.stringify({
        "user_id": "new_user"
      })
    )

    expect(res.status).toBe(400)
  })
})


async function sendRequest(
  url:string,
  body:string,
  method:string = "POST",
){
  const res = await app.request(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body
  })

  return res
}
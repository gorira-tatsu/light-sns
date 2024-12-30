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

describe('Auth', () => {
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

    expect(res.status).toBe(400)
    expect(await res.text()).toBe("unsolved")
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
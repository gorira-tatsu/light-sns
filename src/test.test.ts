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
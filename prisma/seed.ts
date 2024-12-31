import { Prisma, PrismaClient } from '@prisma/client'
import { password } from 'bun'
import { formatISO } from 'date-fns'

const prisma = new PrismaClient()
async function main() {

    const testUserModel = {
        userId: "test",
        userName: "test",
        description: "test",
        iconurl: "https://example.com",
        password: "T1NaSYIn/bu8YcCvXSRjNdR/RT0BapSikzuwILSS/TI",
        salt: "pjDdZKo8dLjKTprrFp1GDtvyw3uvXJoXhMwd1Aq+a3g",
        UUID: "4ff3388f-8b0d-4b38-9dae-7dfcc546c5b0",
    }

    const createUserHandler = await prisma.user.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            userName: testUserModel.userName,
            description: testUserModel.description,
            iconUrl: testUserModel.iconurl
        }
    })

    const createUserAuthHandler = await prisma.userAuth.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            password: testUserModel.password,
            salt: testUserModel.salt
        }
    })

    const createSessionIDsHandler = await prisma.sessionIDs.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            UUID: testUserModel.UUID
        }
    })

    const createPostHandler = await prisma.post.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            body: "test"
        }
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
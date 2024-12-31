bun prisma migrate reset --force > /dev/null 2>&1
bun test
bun prisma migrate reset --force > /dev/null 2>&1
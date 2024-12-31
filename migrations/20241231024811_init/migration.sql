/*
  Warnings:

  - A unique constraint covering the columns `[UUID]` on the table `SessionIDs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SessionIDs_UUID_key" ON "SessionIDs"("UUID");

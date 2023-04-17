/*
  Warnings:

  - You are about to drop the column `private` on the `UserRoomRelation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserRoomRelation" (
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "roomId"),
    CONSTRAINT "UserRoomRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRoomRelation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserRoomRelation" ("roomId", "userId") SELECT "roomId", "userId" FROM "UserRoomRelation";
DROP TABLE "UserRoomRelation";
ALTER TABLE "new_UserRoomRelation" RENAME TO "UserRoomRelation";
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Room',
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/avatars/room-default.png',
    "private" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Room" ("avatarUrl", "id", "name") SELECT "avatarUrl", "id", "name" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

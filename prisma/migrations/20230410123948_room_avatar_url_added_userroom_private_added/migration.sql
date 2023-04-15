-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Room',
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/avatars/room-default.png'
);
INSERT INTO "new_Room" ("id", "name") SELECT "id", "name" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE TABLE "new_UserRoomRelation" (
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("userId", "roomId"),
    CONSTRAINT "UserRoomRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRoomRelation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserRoomRelation" ("roomId", "userId") SELECT "roomId", "userId" FROM "UserRoomRelation";
DROP TABLE "UserRoomRelation";
ALTER TABLE "new_UserRoomRelation" RENAME TO "UserRoomRelation";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "pseudonym" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/avatars/user-default.png'
);
INSERT INTO "new_User" ("avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "username") SELECT "avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

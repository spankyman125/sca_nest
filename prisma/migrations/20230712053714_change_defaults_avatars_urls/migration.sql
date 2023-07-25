-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "pseudonym" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/users/avatars/default.png',
    "refreshToken" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "refreshToken", "username") SELECT "avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "refreshToken", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Room',
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/rooms/avatars/default.png',
    "private" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Room" ("avatarUrl", "id", "name", "private") SELECT "avatarUrl", "id", "name", "private" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

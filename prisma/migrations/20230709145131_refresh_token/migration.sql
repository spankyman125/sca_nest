-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "pseudonym" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT NOT NULL DEFAULT 'static/images/avatars/user-default.png',
    "refreshToken" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "username") SELECT "avatarUrl", "id", "isOnline", "passwordHash", "pseudonym", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

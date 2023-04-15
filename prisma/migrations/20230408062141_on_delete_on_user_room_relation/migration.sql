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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

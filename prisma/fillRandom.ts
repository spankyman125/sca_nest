// import { PrismaClient } from '@prisma/client';
import { Chance } from 'chance';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const chance = new Chance();

const MESSAGES_NUMBER = 10000;
const ROOMS_NUMBER = 10;
const USERS_NUMBER = 100;
const USERS_ROOMS_NUMBER = 250;
const FRIENDS_NUMBER = 100;
const ATTACHMENTS_NUMBER = 5000;

const userGenerator = (function* () {
  const usernamesGenerated: Set<string> = new Set<string>();
  while (true) {
    let username = chance.twitter();
    while (usernamesGenerated.has(username)) {
      username = chance.twitter();
    }
    usernamesGenerated.add(username);
    yield {
      username: username,
      passwordHash: bcrypt.hashSync('123', 10),
      pseudonym: chance.first(),
      isOnline: chance.bool(),
      avatarUrl: `static/images/users/avatars/${chance.integer({
        min: 0,
        max: 100,
      })}.png`,
      refreshToken: 'invalid',
    };
  }
})();

const roomGenerator = (function* () {
  while (true)
    yield {
      name: chance.company(),
      avatarUrl: `static/images/rooms/avatars/${chance.integer({
        min: 0,
        max: 100,
      })}.png`,
      private: false,
    };
})();

// const attachmentGenerator = (function* () {
//   while (true)
//     yield {
//       messageId: chance.integer({
//         min: 0,
//         max: MESSAGES_NUMBER - 1,
//       }),
//       url: `static/images/rooms/avatars/${chance.integer({
//         min: 0,
//         max: 100,
//       })}.png`,
//     };
// })();

const messageGenerator = (function* () {
  while (true)
    yield {
      content: chance.sentence(),
      createdAt: chance.date({ max: new Date() }),
      roomId: chance.integer({
        min: 0,
        max: ROOMS_NUMBER - 1,
      }),
      userId: chance.integer({
        min: 0,
        max: USERS_NUMBER - 1,
      }),
    };
})();

const userRoomGenerator = (function* () {
  while (true)
    yield {
      userId: chance.integer({
        min: 0,
        max: USERS_NUMBER - 1,
      }),
      roomId: chance.integer({
        min: 0,
        max: ROOMS_NUMBER - 1,
      }),
    };
})();

const friendsGenerator = (function* () {
  while (true)
    yield {
      userId: chance.integer({
        min: 0,
        max: USERS_NUMBER / 2,
      }),
      friendId: chance.integer({
        min: USERS_NUMBER / 2,
        max: USERS_NUMBER - 1,
      }),
    };
})();

async function start() {
  let i = 0;
  // while (i !== USERS_NUMBER) {
  //   try {
  //     await prisma.user.create({ data: userGenerator.next().value });
  //     i++;
  //     // console.log(`User with index=${i} added`);
  //   } catch (e) {
  //     // console.log(`User with index=${i} not added`);
  //   }
  // }

  // i = 0;
  // while (i !== ROOMS_NUMBER) {
  //   try {
  //     await prisma.room.create({ data: roomGenerator.next().value });
  //     i++;
  //     // console.log(`Room with index=${i} added`);
  //   } catch (e) {
  //     // console.log(`Room with index=${i} not added`);
  //   }
  // }

  // i = 0;
  // while (i !== MESSAGES_NUMBER) {
  //   try {
  //     await prisma.message.create({
  //       data: {
  //         content: chance.sentence(),
  //         createdAt: chance.date({ max: new Date() }),
  //         roomId: chance.integer({
  //           min: 0,
  //           max: ROOMS_NUMBER - 1,
  //         }),
  //         userId: chance.integer({
  //           min: 0,
  //           max: USERS_NUMBER - 1,
  //         }),
  //       },
  //     });
  //     i++;
  //     // console.log(`Message with index=${i} added`);
  //   } catch (e) {
  //     // console.log(`Message with index=${i} not added`);
  //   }
  // }

  i = 0;
  while (i !== USERS_ROOMS_NUMBER) {
    try {
      await prisma.userRoomRelation.create({
        data: userRoomGenerator.next().value,
      });
      i++;
      // console.log(`User in room with index=${i} added`);
    } catch (e) {
      // console.log(`User in room with index=${i} not added`);
    }
  }

  i = 0;
  while (i !== FRIENDS_NUMBER) {
    try {
      await prisma.friendsRelation.create({
        data: friendsGenerator.next().value,
      });
      i++;
      // console.log(`Friend with index=${i} added`);
    } catch (e) {
      // console.log(`Friend with index=${i} not added`);
    }
  }

  i = 0;
  while (i !== ATTACHMENTS_NUMBER) {
    try {
      await prisma.attachment.create({
        data: {
          messageId: chance.integer({
            min: 0,
            max: MESSAGES_NUMBER - 1,
          }),
          url: `static/images/rooms/avatars/${chance.integer({
            min: 0,
            max: 100,
          })}.png`,
        },
      });
      i++;
      // console.log(`Friend with index=${i} added`);
    } catch (e) {
      // console.log(`Friend with index=${i} not added`);
    }
  }
}
start();

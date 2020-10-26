const admin = require("firebase-admin");
const yargs = require("yargs");
admin.initializeApp();
const auth = admin.auth();

async function fetchUsers() {
  // get all the users
  let users = [];
  let pageToken = undefined;
  do {
    /* eslint-disable no-await-in-loop */
    const listUsersResult = await auth.listUsers(1000, pageToken);
    pageToken = listUsersResult.pageToken;
    if (listUsersResult.users) {
      users = users.concat(listUsersResult.users);
    }
  } while (pageToken);
  return users;
}

yargs
  .command(
    "user",
    "get information about a user",
    (yargs) => {
      yargs
        .option("id", {
          description: "UID of the user to inspect",
          type: "string"
        })
        .demandOption(["id"]);
    },
    async (argv) => {
      const user = await auth.getUser(argv.id);
      console.log(JSON.stringify(user));
    }
  )
  .command(
    "list",
    "get all users",
    (yargs) => {},
    async (argv) => {
      const users = await fetchUsers();
      console.log(JSON.stringify(users));
    }
  )
  .command(
    "token",
    "get custom token",
    (yargs) => {
      yargs
        .option("id", {
          description: "UID of the user to generate a custom token for",
          type: "string"
        })
        .demandOption(["id"]);
    },
    async (argv) => {
      const token = await auth.createCustomToken(argv.id);
      console.log(token);
    }
  )
  .demandCommand()
  .help()
  .alias("help", "h").argv;

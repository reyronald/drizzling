import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { usersTable } from "./db/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle<{ users: typeof usersTable }>(process.env.DATABASE_URL!, {
  schema: { users: usersTable },
  mode: "default",
  logger: true,
  // logger: {
  //   logQuery: (query, params) => {
  //     let formattedQuery = query;
  //     params.forEach((param, index) => {
  //       formattedQuery = formattedQuery.replace(`?`, JSON.stringify(param));
  //     });
  //     console.log(formattedQuery);
  //   },
  // },
});

async function main() {
  await db.delete(usersTable);

  const userToCreate: typeof usersTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };

  await db.insert(usersTable).values(userToCreate);

  const user = (await db.query.users.findFirst())!;

  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ age: 40 })
      .where(eq(usersTable.id, user.id));

    await tx
      .update(usersTable)
      .set({ age: 50 })
      .where(eq(usersTable.id, user.id));
  });

  const user2 = (await db.query.users.findFirst())!;

  console.log({ user2 });
}

console.log();
main();
console.log();

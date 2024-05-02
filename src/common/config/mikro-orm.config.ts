import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MikroOrmModuleSyncOptions } from "@mikro-orm/nestjs";

export default {
  dbName: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  // port: process.env.DATABASE_PORT,
  entities: ["dist/src/db/models/*.js", "dist/db/models/*.js"],
  entitiesTs: ["src/db/models/*.ts"],
  type: "postgresql",
  debug: true,
  highlighter: new SqlHighlighter(),
  wrap: false,
  migrations: {
    // this is to fix the error when running migration: DriverException: set session_replication_role = 'replica'; - permission denied to set parameter "session_replication_role"
    // see: https://github.com/mikro-orm/mikro-orm/issues/1842
    disableForeignKeys: false,
    // path: 'migrations',
    pathTs: "migrations"
  }
} as MikroOrmModuleSyncOptions;

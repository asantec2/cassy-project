import {PGlite} from "@electric-sql/pglite";
import ddl from "../../create-tables.sql?raw";

let src = import.meta.env.VITE_DATABASE_URL;

const pgLiteDb = await PGlite.create(src);

if (src === "memory://") {
    await pgLiteDb.exec(ddl);
}

export default function db() {
    return pgLiteDb;
}
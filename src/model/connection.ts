import {PGlite} from "@electric-sql/pglite";

const pgLiteDb = await PGlite.create('idb://cassy-project');
export default function db(){
    return  pgLiteDb;
}
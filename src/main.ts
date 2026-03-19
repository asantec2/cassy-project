import CartController from "./Controller/CartController.ts";
import ddl from '../create-tables.sql?raw'
import db from './model/connection.ts'

db().exec(ddl);
new CartController();


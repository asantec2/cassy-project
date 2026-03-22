import ddl from '../create-tables.sql?raw'
import db from './model/connection.ts'
import CashierController from "./Controller/CashierController.ts";

db().exec(ddl);
new CashierController();


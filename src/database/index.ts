import mongoose from "mongoose"
import { db } from "../config.js"

const dbURI = String(db.db_uri);

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))

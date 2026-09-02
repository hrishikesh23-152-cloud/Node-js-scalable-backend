import mongoose, { mongo } from "mongoose"
import { db } from "../config.js"
import logger from "../core/logger.js";

const dbURI = String(db.db_uri);

const options = {
  autoIndex:true,
  minPoolSize:db.minPoolSize,
  maxPoolSize:db.maxPoolSize,
  connectTimeoutMS:10000,
  socketTimeoutMS:45000
}
// logger.info(dbURI)

function setRunValidators(){
  return {
    runValidators:true
  }
}

mongoose.set("strictPopulate",true);

mongoose
.plugin((schema:any)=>{
  schema.pre("findOneAndUpdate",setRunValidators)
  schema.pre("updateMany",setRunValidators)
  schema.pre("updateOne",setRunValidators)
  schema.pre("update",setRunValidators)
})
.connect(dbURI,options)
.then(() => logger.info("Mongodb connected"))
.catch((err) => {
  logger.info("Mongodb connection error")
  logger.error(err)
}
)

mongoose.connection.on("connected",()=>{
  logger.debug("Mongodb connected")
})
mongoose.connection.on("error",()=>{
  logger.error("Mongodb connection error")
})

mongoose.connection.on("disconnected",()=>{
  logger.info("Mongodb connection disconneceted")
})
process.on("SIGINT",()=>{
  mongoose.connection.close().finally(()=>{
    logger.info(
      "MongoDB connection disconnected through terminal"
    )
    process.exit(0);
  })
})

export const connection = mongoose.connection
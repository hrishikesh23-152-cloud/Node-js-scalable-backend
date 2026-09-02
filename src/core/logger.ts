import pkg from 'winston'
import {createLogger,transports,format} from "winston";
import path from 'path';
import fs from 'node:fs';
import {environment} from '../config.js';
import DailyRotateFile from "winston-daily-rotate-file";



let dir = path.resolve('logs');

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
const loglevel = environment === 'development' ? "debug" : "warn";
const dailyRotateFile = new DailyRotateFile({
    level:loglevel,
    filename:`${dir}/%DATE%-results.log`,
    zippedArchive:true,
    handleExceptions:true,
    maxSize:'20m',
    maxFiles:'14d',
    format:format.combine(
        format.errors({stack:true}),
        format.timestamp(),
        format.json()
    )
})



export default createLogger({
    transports:[
        new transports.Console({
            level:loglevel,
            format:format.combine(
                format.errors({stack:true}),
                format.colorize(),
                format.prettyPrint()
            )
        }),
        dailyRotateFile
    ],
    exceptionHandlers:[dailyRotateFile],
    exitOnError:false
})


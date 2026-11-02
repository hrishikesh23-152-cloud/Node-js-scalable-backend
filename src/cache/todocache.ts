import { getTodoKey } from "./keys.js";
import Todo from "../models/todoModel.js";
import { getJson, setJson } from "./query.js";
import type { TodoDoc } from "../models/todoModel.js";
import { todo } from "node:test";
import { cacheConfig } from "../config.js";
import cache from './index.js'

async function saveUserTodos(userId:string,todos:TodoDoc[]){
    const key = getTodoKey(userId);
    return setJson(key,{data:todos},new Date(Date.now() + Number(cacheConfig.cache_ttl)))
}

async function fetchUserTodos(userId:string){
    const key = getTodoKey(userId);
    return getJson<TodoDoc[]>(key);
}
async function invalidTodos(userId:string){
     const key = getTodoKey(userId);
     await cache.del(key);
}
export default {
    saveUserTodos,
    fetchUserTodos,
    invalidTodos
}
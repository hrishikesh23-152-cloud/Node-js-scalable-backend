import { cacheConfig } from "../config.js";
import type { UserDoc } from "../models/userModel.js";
import cache from "./index.js";
import { getJson, setJson } from "./query.js";
import { getUserListKey, staticKey } from "./keys.js";

type UserListCache = {
    users: UserDoc[];
    total: number;
};

async function getUserListVersion(){
    return (await cache.get(staticKey.USER_LIST_VERSION)) ?? "0";
}

async function fetchUsers(page:number,limit:number,version:string){
    return getJson<UserListCache>(getUserListKey(page,limit,version));
}

async function saveUsers(page:number,limit:number,version:string,value:UserListCache){
    const key = getUserListKey(page,limit,version);
    return setJson(key,value,new Date(Date.now() + Number(cacheConfig.cache_ttl)));
}

async function invalidateUsers(){
    await cache.incr(staticKey.USER_LIST_VERSION);
}

export default {
    getUserListVersion,
    fetchUsers,
    saveUsers,
    invalidateUsers
};

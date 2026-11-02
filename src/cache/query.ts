import cache from './index.js'

export async function setJson(
    key:string,
    value:Record<string,unknown>,
    expiresAt:Date | null
){
    const json = JSON.stringify(value);
    if(expiresAt){
        const ttlMiles = expiresAt.getTime() - Date.now();
        return cache.set(key,json,{PX:ttlMiles})
    }
    else{
        return cache.set(key,json);
    }
}

export async function getJson<T>(key:string){
    const type = await cache.type(key);
    if(type !== 'string'){
        return null
    }
    const json = await cache.get(key);
    if(json){
        return JSON.parse(json) as T
    }
    return null;
}
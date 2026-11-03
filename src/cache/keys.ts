export enum staticKey {
    USER_TODOS = 'USER_TODOS',
    USER_LIST_VERSION = 'USER_LIST_VERSION'
}

function getDynamicKey(key:staticKey,userId:string){
    return `${key}:${userId}`
}

export function getTodoKey(userID:string){
    return getDynamicKey(staticKey.USER_TODOS,userID);
}

export function getUserListKey(page:number,limit:number,version:string){
    return `${staticKey.USER_LIST_VERSION}:${version}:page:${page}:limit:${limit}`;
}
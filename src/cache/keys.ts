export enum staticKey {
    USER_TODOS = 'USER_TODOS'
}

function getDynamicKey(key:staticKey,userId:string){
    return `${key}:${userId}`
}

export function getTodoKey(userID:string){
    return getDynamicKey(staticKey.USER_TODOS,userID);
}
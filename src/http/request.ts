
export interface RequestOptions {
    timeout?: number;
    headers?: Record<string, string>;
}
function post(url:string | string[],body?:any,options?:RequestOptions){
    if(Array.isArray(url)){
        url = url.map(str=>str.replace(/^\//,'').replace(/\/$/,'')).join('/');
    }
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}

export default {
    post
}

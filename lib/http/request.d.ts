export interface RequestOptions {
    timeout?: number;
    headers?: Record<string, string>;
}
declare function post(url: string | string[], body?: any, options?: RequestOptions): Promise<Response>;
declare const _default: {
    post: typeof post;
};
export default _default;

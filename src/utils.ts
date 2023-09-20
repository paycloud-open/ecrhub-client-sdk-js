export function getProtocol(url: string): string {
    const protocol = url.split(':')[0];
    return protocol.toUpperCase();
}

export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
}

export const parseJSONSafety = (json: any, defaultValue?: any) => {
    if (typeof json === 'string') {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.warn(e);
            return defaultValue;
        }
    }
    if (json == null) return defaultValue;
    return json;
};

export function toBoolean(val: any): boolean {
    if (typeof val === 'boolean') return val;
    switch (val) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 0:
        case '0':
            return false;
        case 1:
        case '1':
            return true;
        default:
            return !!val;
    }
}


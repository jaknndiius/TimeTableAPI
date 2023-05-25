declare global {
    interface Object {
        let(func: (thisArg: any) => void): any;
    }
}
export declare const load: () => void;

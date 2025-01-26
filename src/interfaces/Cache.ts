

export default interface Cache { // TODO: use this only for users
    get: (key: string) => Promise<{ error: boolean; data?: any }>;
    set: (email: string,data: any) => Promise<boolean>;
}
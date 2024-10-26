

export default interface Cache {
    get: (key: string) => Promise<{ error: boolean; data?: any }>;
    set: (email: string,data: any) => Promise<boolean>;
}

export default interface Repository {
    getUserWithEmail?: (email: string) => Promise<{ error: boolean; data?: any }>;
    insert: (data: any) => Promise<{}>
}

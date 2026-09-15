export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone_number?: string;
    profile_photo_url?: string;
    profile_photo_path?: string;
    roles?: any[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

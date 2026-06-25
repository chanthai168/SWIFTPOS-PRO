export type UserRole = 'MANAGER' | 'CASHIER';

export interface User {
    id: number;
    auth0_id: string;
    role: UserRole;
    profile_picture_url: string | null;
    name: string;
    email: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ShopRequestDTO{
    sub:string,
    name:string,
}

export interface CreateUserDto {
    auth0Id?: string;
    name: string;
    email?: string;
    role?: UserRole;
    profile_picture_url?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    profile_picture_url?: string;
}

export interface TokenPayload {
        id: number;
        auth0_id: string;
        role: string;
        email: string;
        name: string;
        profile_picture_url: string;
        shop_id?:number;
}

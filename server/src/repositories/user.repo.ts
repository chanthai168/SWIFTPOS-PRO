import pool from "../config/poolConnection.js";
import type { RowDataPacket,ResultSetHeader } from "mysql2";
import type { CreateUserDto,User,UpdateUserDto } from "../types/UserType.js";
import type { TokenPayload } from "../types/Apptype.js";

export class UserRepo{
    static async getTokenPayloadByAuth0Id(auth0Id:string): Promise<TokenPayload>{
        // const query = 'SELECT id, auth0_id,role, email, name, profile_picture_url FROM users WHERE auth0_id = ?';
        const userQuery = `
        SELECT u.id,u.auth0_id,u.role, u.email, u.name, profile_picture_url,
                s.id as shop_id
        FROM users u
        LEFT JOIN shops s ON s.user_id = u.id
        WHERE u.auth0_id = ?
        `
        const [rows] = await pool.query<RowDataPacket[]>(userQuery, [auth0Id]);
        return (rows[0] as TokenPayload) || null;
    }

    static async findByAuth0Id(auth0Id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE auth0_id = ?';
        const [rows] = await pool.query<RowDataPacket[]>(query, [auth0Id]);
        return (rows[0] as User) || null;
    }

    static async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return (rows[0] as User) || null;
    }

    static async create(userData: CreateUserDto): Promise<User> {
        const { auth0Id, role, email, name, profile_picture_url } = userData;
        
        const query = `
            INSERT INTO users (auth0_id, role, profile_picture_url, name, email)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query<ResultSetHeader>(query, [
            auth0Id, 
            role, 
            profile_picture_url,
            name, 
            email, 
        ]);
        

        const createdUser = await this.findById(result.insertId);
        if (!createdUser) throw new Error('Failed to create user');
        
        return createdUser;
    }

    static async getMe(auth0Id:string){

        const userQuery = `
        SELECT u.id,u.role, u.email, u.name, profile_picture_url,
                s.id as shop_id, s.name as shop_name
        FROM users u
        LEFT JOIN shops s ON s.user_id = u.id
        WHERE u.auth0_id = ?
        `

        const [rows] = await pool.query<RowDataPacket[]>(userQuery, [auth0Id]);
        return rows[0] || null;
    }

    static async updateUser(user:UpdateUserDto,auth0Id:string):Promise<User>{
        const userUpdateQuery = `
            UPDATE users 
            SET email=?, name=?, role=?, profile_picture_url=?
            WHERE auth0_id = ?;
        `
        
        const [result] = await pool.query<ResultSetHeader>(userUpdateQuery, [
            user.email, 
            user.name, 
            user.role, 
            user.profile_picture_url, 
            auth0Id
        ]);

        const updated = await this.findByAuth0Id(auth0Id);
        if (!updated) throw new Error('Failed to updated user');
        
        return updated;
    }

    static async createShop(name:string,userId:number,sub:string){
        const query = `
        INSERT INTO shops(user_id,name)
        VALUES(?,?)
        `
        console.log(query);
        console.log(userId);
        console.log(name);
        await pool.query(query,[userId,name]);

        return await this.getMe(sub);
    }
    static async findShopByUserId(userId:number){
        const query = `
        SELECT * FROM shops 
        where user_id = ? 
        `
        const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
        return rows[0] || null;
    }
}
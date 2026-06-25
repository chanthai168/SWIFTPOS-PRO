import { UnauthorizedError,BadInputError } from "../utils/appError.js";
import type { CreateUserDto,User } from "../types/UserType.js";
import { UserRepo } from "../repositories/user.repo.js";

export default async function register(user:any,auth0Id:any):Promise<User>{

    const { role,email, name, profile_picture_url } = user; 
    
    if(!auth0Id){
        throw new UnauthorizedError('Login Required');
    }

    if(!role || !email || !name || !profile_picture_url){
        throw new BadInputError('Field required');
    }

    const existingUser = await UserRepo.findByAuth0Id(auth0Id);

    if(existingUser !== null){
        const updatedUser = UserRepo.updateUser({role,email,name,profile_picture_url},auth0Id);
        return updatedUser;
    }

    const createdUser = UserRepo.create({auth0Id,role,email,name,profile_picture_url});
    return createdUser;

}
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient();

export class UserModel {
    static async findByEmail(email){
        return await prisma.user.findUnique({
            where: {email}
        });
    }

    //by Id
    static async findById(id){
        return await prisma.user.findUnique({
            where: {id}
        });
    }

    //valid password
    static async validatePasssword(plainPassword, hashedPassword){
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    //create user
    static async create(userData){
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        return await prisma.user.create({
            data:{
                name: userData.email,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'CUSTOMER'
            }
        });
    }
}
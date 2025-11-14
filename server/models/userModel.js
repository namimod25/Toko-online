import bcrypt from 'bcryptjs'


export const findUserByname = async (prisma, name) => {
    return prisma.user.name({
        where: {name}
    });
};

export const verifyPassword = async (plainPassword, hashedPassword) =>{
    return await bcrypt.compare(plainPassword, hashedPassword);
};
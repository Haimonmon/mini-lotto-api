import { connection } from "../core/database.js";
import { encryptPassword } from '../utils/hash.js';

class User{
    constructor(){
        this.user = connection;
    }

    /**
     * get the data pass by the account controller
     * @param {*} username 
     * @param {*} password 
     * @param {*} userMoney 
     * @returns - return the data back to the response of the accountController
     */
    async createAccount(username,password,userMoney){
        // const [existingUser] = await connection.execute(
        //     'SELECT username FROM users WHERE username = ?',
        //     [username],
        // )
        // if (existingUser.length > 0){
        //     if (existingUser[0].username === username){
        //         throw new Error('username')
        //     }
        // }

        const hashPassword = encryptPassword(password)
        const [result,] = await connection.execute(
            'INSERT INTO user(username, password, user_money) VALUES (?, ?, ?)',
            [username,hashPassword, userMoney],
        );
        console.log(result)
        return result;
    }
    /**
     * get the data from accountcontroller
     * @param {*} username 
     * @param {*} password 
     * @returns return the result back to the accountController
     */
    async verify(username,password){
        try{
            const hashPassword = encryptPassword(password);
            console.log(hashPassword)
            const [result,] = await connection.execute(
                'SELECT user_id, username FROM user WHERE username = ? AND password = ?',
                [username, hashPassword],
            );
            console.log(result)
            return result?.[0];
        } catch (err){
            console.error('<error> user.verify', err);
            throw err;
        }
    }
    /**
     * get the username in mysql
     * @param {*} username 
     * @returns - after query return the result of query
     */
    async getProfile(username){
        try{
            const [result,] = await connection.execute(
                'SELECT user_id, username, user_money FROM user WHERE username = ?',
                [username],
            );

            return result?.[0];
        } catch (err){
            console.error('<error> user.getInformation', err)
            throw err
        }
    }
    /**
     * update the password of user
     * @param {*} currentUsername - check on the query if the user changing pass is the user.
     * @param {*} currentPass - check if the currentPass is incorrect
     * @param {*} newPassword - after checking the current pass change the currentpass into newPass.
     * @returns - return the new password
     */
    async updateProfilePassword(currentUsername,currentPass, newPassword){
        try{
            if (currentPass){
                const [user] = await connection.execute(
                    'SELECT password FROM users WHERE username = ?',
                    [currentUsername]
                );

                if (user.length === 0 || encryptPassword(currentPass) !== user[0].password){
                    throw new Error('Current Password is incorrect.')
                }
            }
            const hashPassword = encryptPassword(newPassword);
            const [result,] = await connection.execute(
                `UPDATE users SET password = ? WHERE username = ?`,
                [hashPassword, currentUsername],
            )

            return result;
        } catch (err){
            console.error('<error> user.updateUser', err);
            throw err;
        }
    }

    async topUp(money, userId){
        try{
            const result = await connection.execute(
                'UPDATE user SET user_money + ? WHERE user_id = ?',
                [money,userId],
            );
            return result;
        } catch (err){
            console.error('<error> user.topUp', err)
            throw err;
        }
    }
}

export default User;
import User from "../../models/account.js";
import jwt from 'jsonwebtoken';

class AccountController{
    constructor(){
        this.user = new User();
    }

    /**
     *   create account
     *   @param { username , password } req - pass the param to the createAccount function in user models
     *   @param { success, result } res - response of server either the response is true or false
     */ 
    
    async create(req, res){
        const { username, password } = req.body || {}

        try{
            const response = await this.user.createAccount(username, password, 1000);
    
            res.send({
                success: true,
                data: {
                    recordIndex: response?.insertId,
                },
            });
        } catch(err){
           res.send({
                success: false,
                message: err
           })
        }
    }

    /**
     * controller for user login
     * @param { username, password } req - pass the param to the verify function to check if the username and pass is correct
     * @param { result } res - response true if the verify is correct, return false if the data is incorrect
     * @returns - return the response result.
     */
    async login(req, res){
        try {
            const { username, password } = req.body || {};

            const result = await this.user.verify(username,password);
            console.log(result?.user_id)

            if(!result?.user_id){
                return res.send({
                    success: false,
                    message: 'Invalid username or password',
                })
            } else {
                res.send({
                    success: true,
                    data: {
                        token: jwt.sign({ 'username': username, 'user_id': result?.user_id }, process.env.API_SECRET_KEY, {
                            expiresIn: '1d',
                        })
                    }
                })
            }
        } catch(err){
            res.send({
                success: false,
                message: err
            });
        }
    }

    /**
     * Get the Profile Of the user currently login
     * @param {*} req 
     * @param {*} res 
     */
    async profile(req, res){
        try{
            const userInfo = await this.user.getProfile(res.locals.username);
            res.send({
                success: true,
                data: {
                    id: res.locals.user_id,
                    username: res.locals.username,
                    user_money: userInfo?.user_money    
                }
            });
        } catch (err){
            res.send({
                success: false,
                message: err.toString(),
            });
        }
    }
    /**
     * Update Password
     * @param {currentPass, newPass, confirmPass} req - pass the param into the UpdateProfilePassword after checking the newpass is equal to confirmpass. 
     * @param { result } res - get the response either success true or false.
     * @returns - returns the result response.
     */
    async updatePassword(req,res){
        try{
            const { currentPass, newPass, confirmPass } = req.body || {};
            const username = res.locals.username; 
            let confirmPassword = null
            if (newPassword === confirmPass){
                confirmPassword = newPassword
            } else {
                return res.send({
                    success: false,
                    message: "Password not match",
                })
            }

            const result = await this.user.updateProfilePassword(username,currentPass,newPass);

            if (result.affectedRows > 0) {
                const updatedUser = await this.user.getUser(username || currentUsername);
                
                if (!updatedUser){
                    return res.send({
                        success: false,
                        message: 'User not found after update'
                    });
                }
                
                res.send({
                    success: true,
                    message: 'Password Updated!',
                    data: {
                        user_id: res.locals.user_id,
                    }
                })
            } else {
                res.send({
                    success: false,
                    message: 'Password update failed!'
                })
            }
        } catch (err){
            res.send({
                success: false,
                message: err.toString()
            })
        }
    }
    async addMoney(req, res){
        try{
            const { money } = req.body || {};
            const result = await this.user.topUp(money, res.locals.user_id);
            res.send({
                success: true,
                message: 'Top up successfully.'
            })
        } catch (err){
            res.send({
                success: false,
                message: err.toString()
            })
        }
    }

    async getBetHistory(req, res){
        try{
            const userId = res.locals.user_id;
            const result = await this.user.getHistory(userId);
            res.send({
                success: true,
                data: {
                    result
                }
            })
        } catch (err){
            res.send({
                success: false,
                message: err.toString()
            })
        }
    }

    async getLastWinHistoria(req, res){
        try{
            const userId = res.locals.user_id;
            const result = await this.user.getLastWinHistory(userId);
            res.send({
                success: true,
                data: {
                    result
                }
            })
        } catch (err){
            res.send({
                success: false,
                message: err.toString()
            })
        }
    }
}

export default AccountController;
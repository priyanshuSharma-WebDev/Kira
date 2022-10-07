import emailService from "../services/email.service.js";
import hashOtpService from "../services/hash.service.js";
import otpService from "../services/otp.service.js";
import UserService from "../services/user.service.js";
const {sendMail} = emailService
const {hashOTP} = hashOtpService
const {verifyOtp,generateOTP} = otpService
const {findUserByEmail} = UserService
import jimp from "jimp"
import path from "path"

class AuthController {
    async sendOTP(req,res) {
        const {Email} = req.body;
        if(!Email) {
            // handle error
            res.sendStatus(500)
        }
        const otp = await generateOTP();
        const ttl = 1000 * 60 * 5;
        const expire = Date.now()+ttl;
        const data = `${Email}.${otp}.${expire}`
        const hash = await hashOTP(data)
        try {
            console.log(otp)
            // await sendMail(Email,otp)
            return res.json({reqStatus: true,data: {
                otp,
                hash: `${hash}.${expire}`,
                Email
            }})
        }
        catch(e) {
            return res.status(500).json({reqStatus: false,data: "failed to process request."})
        }
    }
    async verifyOTP(req,res) {
        const { otp, hash, Email } = req.body;
        if (!otp || !hash || !Email) {
            return res.status(400).json({reqStatus: false, data: 'All fields are required.'});
        }

        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            return res.status(400).json({reqStatus: false, data: 'OTP expired.'});
        }

        const data = `${Email}.${otp}.${expires}`;
        const isValid = verifyOtp(data,hashedOtp);
        if (!isValid) {
            return res.status(400).json({reqStatus: false, data: 'Invalid OTP'});
        }
        try {
            const user = await findUserByEmail({ email: Email });

            if (!user) {
                await UserService.createUser({ email: Email,username: "null",fullName: "null",password: "null", activated: true });
            }
        } catch (err) {
            console.log(err)
            return res.status(500).json({reqStatus: false,data: "Error while creating new user."});
        }
        return res.json({reqStatus: true, data: "Otp verified."})

        // const { accessToken, refreshToken } = tokenService.generateTokens({
        //     _id: user._id,
        //     activated: false,
        // });

        // res.cookie('refreshToken', refreshToken, {
        //     maxAge: 1000 * 60 * 60 * 24 * 30,
        //     httpOnly: true,
        // });
        // const userDto = new UserDto(user);
        // res.json({ accessToken, user: userDto });
    }
    async createAccount(req,res) {
        const {Email,password,username,fullName,avatar} = req.body;
        if (!Email || !password || !username || !fullName || !avatar) {
            return res.status(400).json({reqStatus: false, data: 'All fields are required.'});
        }
        try {
            const buffer = Buffer.from(avatar.replace(/^data:image\/png;base64,/,""),"base64")
            const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`
            const jimpResp = await jimp.read(buffer)
            jimpResp
                .resize(150, jimp.AUTO)
                .write(path.resolve(__dirname, `../storage/${imagePath}`))
        }
        catch(e) {
            console.log(e.message)
            return res.status(500).json({reqStatus: false,data: "Error while creating new user."});
        }
        let user;
        try {
            user = await findUserByEmail({ email: Email });
            if(user && !user.activated) {
                return res.status(400).json({reqStatus: false, data: "User is not verified."})
            }
            user = await UserService.ActivateUser(Email,{  username,fullName,password });
        } catch (err) {
            console.log(err)
            return res.status(500).json({reqStatus: false,data: "Error while creating new user."});
        }
        return res.json({reqStatus: true,data: user})
    }
}


export default new AuthController()
import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:
    {
     type:String,
     required:true,
     trim:true,
     index:true
    },
    avatar:
    {
        type:String,
        required:true,
    },
    coverImage:
    {
     type:String,
    },
    watchHistroy:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:
    {
      type:String,
      required:[true, "Password is required"]
    },
    refreshToken:
    {
        type:String,
    }
},
{
    timestamps:true
}
)

/**
 * Middleware function that runs before saving a user document.
 * It hashes the password field if it has been modified.
 * @param {Function} next - The next function to be called in the middleware chain.
 */
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

/**
 * Check if the provided password matches the hashed password stored in the user document.
 * @param {string} password - The password to compare with the hashed password.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}
/**
 * Generates a new access token for the user.
 * @returns {string} The generated access token.
 */
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return  jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model("User",userSchema)
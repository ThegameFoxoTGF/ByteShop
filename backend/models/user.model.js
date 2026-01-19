import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AddressSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    phone_number: { type: String, trim: true },
    label: { type: String, trim: true },
    address_line: { type: String, trim: true },
    sub_district: { type: String, trim: true },
    district: { type: String, trim: true },
    province: { type: String, trim: true },
    zip_code: { type: String, trim: true, maxlength: 5, minlength: 5 },
    detail: { type: String, trim: true },
    is_default: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
    {
        is_active: { type: Boolean, default: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 6 },

        otp: {
            otp_code: { type: String },
            otp_expires: { type: Date },
        },

        passwordToken: { type: String },
        passwordTokenExpires: { type: Date },

        profile: {
            first_name: { type: String, trim: true },
            last_name: { type: String, trim: true },
            phone_number: { type: String, trim: true },
            birthday: { type: Date },
        },

        address: [AddressSchema],

        is_admin: { type: Boolean, default: false },

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//check password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//hide password to output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model("User", UserSchema);

export default User;

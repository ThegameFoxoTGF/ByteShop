import users from "../models/user.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}

const signup = async (req, res) => {
    const { email, password, profile } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userExists = await users.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await users.create({ email, password, profile });

        const token = generateToken(user._id);
        res.status(201).json({ 
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            },
            token,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await users.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "User does not exist" });
        }

        const token = generateToken(user._id);
        res.status(200).json({ 
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            },
            token,
        });

    } catch (error){
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    res.status(200).json(req.user);
};

export {signup, signin, getUserProfile};
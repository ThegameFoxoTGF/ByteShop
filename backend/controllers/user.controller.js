import User from "../models/user.js";

// Admin/Employee: Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin/Employee: Get single user
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new User (Admin/Employee only? or signup handled by auth?)
// Usually signup is in AuthController. This might be "Add Employee" or similar.
// For now, standard CRUD using new Schema structure.
const createUser = async (req, res) => {
     try {
        // Basic create - logic similar to signup but might include role setting
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Update User (Admin or Self)
const updateUserProfile = async (req, res) => {
    try {
        // If admin updates other user, use params.id. If self, use req.user._id
        // This function handles "Self Update" mostly.
        const userId = req.user._id; 
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Update fields if provided
        if (req.body.profile) {
            user.profile = { ...user.profile, ...req.body.profile }; // Merge profile object
        }
        
        // Handle Addresses - This might replace the whole array or add/edit specific index.
        // For simplicity: Replace if provided. 
        if (req.body.address) {
            user.address = req.body.address;
        }

        if (req.body.tax_info) {
           user.tax_info = req.body.tax_info;
        }
        
        // Handling role/position - protected by checks usually
        // if (req.body.position && user.role !== 'customer') ...

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        
        // Return without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin update user (Role, Status etc)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        Object.assign(user, req.body);
        const updatedUser = await user.save();
        res.status(200).json(updatedUser);

    } catch (error) {
         res.status(500).json({ error: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getAllUsers,
    getUserById,
    createUser,
    updateUserProfile, // Self
    updateUser, // Admin
    deleteUser
};

import mongoose from "mongoose";

interface User {
    username: string;
    password: string;
}

const UserSchema = new mongoose.Schema<User>({
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    }
}, {
    timestamps: true,
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
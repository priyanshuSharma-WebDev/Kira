import mongoose, {Schema,model, mongo} from "mongoose";

const commentsSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    bugId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Bug"
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    respondTo: {
        type: mongoose.Types.ObjectId,
        ref: "Comments"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


export default mongoose.model("Comments",commentsSchema,"comments")
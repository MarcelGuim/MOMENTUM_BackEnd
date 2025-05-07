import mongoose from "mongoose";

export interface IBusiness {
    name: string;
    location: mongoose.Types.ObjectId[];
    isDeleted: boolean;
    _id?: mongoose.Types.ObjectId;
}

const BusinessSchema = new mongoose.Schema<IBusiness>({
    name: { 
        type: String,
        required: true,
    },
    location: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location',
        required: true,
    }],
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

BusinessSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

BusinessSchema.pre('findOne', function () {
    if (!this.getOptions().bypassHooks) {
        this.where({ isDeleted: false });
    }
});

const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
export default Business;
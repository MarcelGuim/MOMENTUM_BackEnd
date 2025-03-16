import mongoose from "mongoose";

export interface IBusiness {
    name: string;
    serviceDescripction: string[];
    phone: number;
    location: mongoose.Types.ObjectId;
    openTime: Date;
    closeTime: Date;
    appointments: mongoose.Types.ObjectId[];
    isDeleted: boolean;
    _id?: mongoose.Types.ObjectId;
}

const BusinessSchema = new mongoose.Schema<IBusiness>({
    name: { 
        type: String,
        required: true,
    },
    serviceDescripction: [{
        type: String,
        required: true,
    }],
    phone: { 
        type: Number, 
        required: true,
    },
    location: { 
        type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
        required: true,
        ref: 'Location'
    },
    openTime: {
        type: Date,
        required: true
    },
    closeTime: {
        type: Date,
        required: true
    },
    appointments: [{ 
        type: mongoose.Schema.Types.ObjectId, // Usar Schema.Types.ObjectId
        ref: 'Appointment'
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

BusinessSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
export default Business;
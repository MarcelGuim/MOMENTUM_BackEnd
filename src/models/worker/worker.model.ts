import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { WorkerRole } from '../../enums/workerRoles.enum';

export interface IWorker {
    toObject(): { [x: string]: any; password: any; activationId: any; };
    _id?: mongoose.ObjectId;
    name: string;
    age: number;
    mail: string;
    role: WorkerRole;
    location: mongoose.Types.ObjectId[];
    businessAdministrated?: mongoose.Types.ObjectId;
    password: string;
    isDeleted: boolean;
    activationId?: string;

    isValidPassword: (password: string) => Promise<boolean>;
}

const WorkerSchema = new mongoose.Schema<IWorker>({
    name: { 
        type: String, 
        required: true,
        unique: true,
        index: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    mail: { 
        type: String, 
        required: true,
        unique: true, 
        index: true 
    },
    password: { 
        type: String, 
        required: true,
        select: false  
    },
    isDeleted: {
        type: Boolean,
        required: true, 
        default: false
    },
    role: {
        type: String,
        enum: Object.values(WorkerRole), 
        default: WorkerRole.WORKER,
      },
    location: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    }],
    businessAdministrated: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: false,
    },
    activationId: {
        type: String,
        sparse: true ,
        select: false
    }
});

// UserSchema.pre('find', function() {
//   this.where({ isDeleted: false });
// });

WorkerSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

WorkerSchema.pre('save',async function(next) {
    const hashedPassword= await bcrypt.hash(this.password, bcrypt.genSaltSync(8));
    this.password = hashedPassword;
    next();
});

WorkerSchema.method('isValidPassword',async function(password: string): Promise<boolean> {
    const isValid =  await bcrypt.compare(password, this.password);
    return isValid;
});

const Worker = mongoose.model<IWorker>('Worker', WorkerSchema);

export default Worker;
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUsuari {
  _id?: mongoose.ObjectId;
  name: string;
  age: number;
  mail: string;
  password: string;
  isDeleted: boolean;
  activationId?: string;
  favoriteLocations: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  fcmToken: string;
  // eslint-disable-next-line no-unused-vars
  isValidPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUsuari>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  age: {
    type: Number,
    required: true,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  activationId: {
    type: String,
    sparse: true,
    select: false,
  },
  favoriteLocations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: [],
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  fcmToken: {
    type: String,
    default: null,
  },
});

UserSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

UserSchema.method(
  'isValidPassword',
  async function (password: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
  }
);

const User = mongoose.model<IUsuari>('User', UserSchema);

export default User;

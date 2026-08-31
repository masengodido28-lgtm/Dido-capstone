const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 *
 * Stores user accounts with hashed passwords.
 * Roles: 'user', 'host', 'admin'
 */

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
    },
  },

  {
    timestamps: true,
  }
);

/**
 * Pre-save hook
 *
 * Hash the password before saving it to MongoDB.
 *
 * IMPORTANT:
 * Because this is an async middleware function,
 * we don't use next().
 */

userSchema.pre('save', async function () {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

/**
 * Compare a plain-text password with
 * the hashed password stored in MongoDB.
 */

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

module.exports = mongoose.model('User', userSchema);
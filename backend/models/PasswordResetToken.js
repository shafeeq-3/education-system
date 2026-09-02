import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Indexes
passwordResetTokenSchema.index({ user: 1, isUsed: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }); // For cleanup

// Static method to cleanup expired tokens
passwordResetTokenSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({ expiresAt: { $lt: Date.now() } });
};

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;

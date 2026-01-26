const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    text: String,
    file: String,
}, {timestamps: true});

// Compound indexes for efficient conversation queries
// Index for sender-recipient conversations sorted by time (most recent first)
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

// Index for recipient-sender conversations (reverse direction)
MessageSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

// Index for timestamp-based queries (e.g., get recent messages)
MessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MessageModel", MessageSchema);
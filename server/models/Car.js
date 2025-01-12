const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Used', 'Certified Pre-Owned']
  },
  description: String,
  images: [String],
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);


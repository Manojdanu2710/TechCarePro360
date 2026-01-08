import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['amc', 'homeIT'],
    required: [true, 'Service category is required']
  },
  price: {
    type: String,
    required: [true, 'Price is required'],
    trim: true
  },
  basePrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  active: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Service', serviceSchema);


const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vroomvault_cars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  },
});

const upload = multer({ storage: storage });

// Get cars for a specific seller (protected route)
// IMPORTANT: This route must be defined before the '/:id' route
router.get('/seller', auth, async (req, res) => {
  try {
    console.log('Fetching cars for seller:', req.user.id);
    const cars = await Car.find({ seller: new mongoose.Types.ObjectId(req.user.id) });
    console.log('Found cars:', cars);
    res.json(cars);
  } catch (err) {
    console.error('Error fetching seller cars:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().populate('seller', 'name email');
    res.json(cars);
  } catch (err) {
    console.error('Error fetching all cars:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get a specific car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('seller', 'name email');
    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    console.error('Error fetching specific car:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Car not found' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create a new car listing (protected route)
router.post('/', [auth, upload.array('images', 5)], async (req, res) => {
  try {
    const { brand, model, year, mileage, price, condition, description } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    console.log('Received data:', { brand, model, year, mileage, price, condition, description, images });
    console.log('User ID:', req.user.id);

    const newCar = new Car({
      seller: new mongoose.Types.ObjectId(req.user.id),
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      price: parseFloat(price),
      condition,
      description,
      images
    });

    console.log('New car object:', newCar);

    const car = await newCar.save();
    console.log('Saved car:', car);
    res.status(201).json(car);
  } catch (err) {
    console.error('Error creating new car listing:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a car listing (protected route)
router.put('/:id', [auth, upload.array('images', 5)], async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }

    // Make sure user owns the car listing
    if (car.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const { brand, model, year, mileage, price, condition, description } = req.body;
    const newImages = req.files.map(file => file.path);

    car = await Car.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { brand, model, year, mileage, price, condition, description },
        $push: { images: { $each: newImages } }
      },
      { new: true }
    );

    res.json(car);
  } catch (err) {
    console.error('Error updating car listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Car not found' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a car listing (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }

    // Make sure user owns the car listing
    if (car.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of car.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`vroomvault_cars/${publicId}`);
    }

    await car.remove();

    res.json({ msg: 'Car listing removed' });
  } catch (err) {
    console.error('Error deleting car listing:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Car not found' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;

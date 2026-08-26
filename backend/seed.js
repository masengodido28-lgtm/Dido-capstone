/**
 * seed.js — Populates MongoDB with sample data for development/testing.
 * Run with: node seed.js
 * Creates 2 users (admin + host) and 6 sample accommodation listings.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Accommodation = require('./models/Accommodation');

dotenv.config();

const users = [
  {
    username: 'Admin User',
    email: 'admin@airbnb.com',
    password: 'password123',
    role: 'admin',
  },
  {
    username: 'Jane Doe',
    email: 'jane@airbnb.com',
    password: 'password321',
    role: 'host',
  },
];

const accommodations = [
  {
    title: 'Modern Apartment in New York',
    location: 'New York',
    description: 'Stay in the heart of New York City in this beautiful modern apartment.',
    type: 'Entire apartment',
    price: 320,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    amenities: ['wifi', 'kitchen', 'free parking', 'air conditioning'],
    images: ['/uploads/placeholder-ny.jpg'],
    weeklyDiscount: 10,
    cleaningFee: 50,
    serviceFee: 50,
    occupancyTaxes: 30,
    rating: 4.5,
    reviews: 320,
    host: 'Jane Doe',
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: { cleanliness: 4.8, communication: 4.7, checkIn: 4.9, accuracy: 4.6, location: 4.9, value: 4.5 },
  },
  {
    title: 'Cosy Cottage in Cape Town',
    location: 'Cape Town',
    description: 'A beautiful cosy cottage with stunning mountain views.',
    type: 'Cottage',
    price: 180,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['wifi', 'pool', 'ocean view'],
    images: ['/uploads/placeholder-ct.jpg'],
    weeklyDiscount: 5,
    cleaningFee: 30,
    serviceFee: 25,
    occupancyTaxes: 15,
    rating: 4.8,
    reviews: 156,
    host: 'Jane Doe',
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: { cleanliness: 4.9, communication: 4.8, checkIn: 5.0, accuracy: 4.7, location: 4.8, value: 4.7 },
  },
  {
    title: 'Luxury Villa in Paris',
    location: 'Paris',
    description: 'Experience Paris like royalty in this stunning luxury villa.',
    type: 'Villa',
    price: 550,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ['wifi', 'pool', 'gym', 'kitchen', 'balcony'],
    images: ['/uploads/placeholder-paris.jpg'],
    weeklyDiscount: 15,
    cleaningFee: 100,
    serviceFee: 80,
    occupancyTaxes: 60,
    rating: 4.9,
    reviews: 89,
    host: 'Jane Doe',
    enhancedCleaning: true,
    selfCheckIn: false,
    specificRatings: { cleanliness: 5.0, communication: 4.9, checkIn: 4.8, accuracy: 5.0, location: 4.9, value: 4.6 },
  },
  {
    title: 'Beach House in Durban',
    location: 'Durban',
    description: 'Wake up to the sound of waves in this stunning beachfront house.',
    type: 'Entire house',
    price: 240,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ['wifi', 'beach access', 'barbecue', 'parking'],
    images: ['/uploads/placeholder-durban.jpg'],
    weeklyDiscount: 8,
    cleaningFee: 60,
    serviceFee: 40,
    occupancyTaxes: 25,
    rating: 4.6,
    reviews: 203,
    host: 'Jane Doe',
    enhancedCleaning: true,
    selfCheckIn: true,
    specificRatings: { cleanliness: 4.7, communication: 4.6, checkIn: 4.8, accuracy: 4.5, location: 5.0, value: 4.6 },
  },
  {
    title: 'Private Room in London',
    location: 'London',
    description: 'A comfortable private room in a vibrant London neighbourhood.',
    type: 'Private room',
    price: 95,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['wifi', 'shared kitchen', 'tube nearby'],
    images: ['/uploads/placeholder-london.jpg'],
    weeklyDiscount: 0,
    cleaningFee: 20,
    serviceFee: 15,
    occupancyTaxes: 10,
    rating: 4.3,
    reviews: 411,
    host: 'Jane Doe',
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: { cleanliness: 4.4, communication: 4.5, checkIn: 4.3, accuracy: 4.2, location: 4.8, value: 4.5 },
  },
  {
    title: 'Mountain Cabin in Johannesburg',
    location: 'Johannesburg',
    description: 'Escape the city in this peaceful mountain cabin just outside Joburg.',
    type: 'Cabin',
    price: 150,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['wifi', 'fireplace', 'hiking trails', 'parking'],
    images: ['/uploads/placeholder-jhb.jpg'],
    weeklyDiscount: 12,
    cleaningFee: 40,
    serviceFee: 30,
    occupancyTaxes: 20,
    rating: 4.7,
    reviews: 78,
    host: 'Jane Doe',
    enhancedCleaning: false,
    selfCheckIn: true,
    specificRatings: { cleanliness: 4.8, communication: 4.7, checkIn: 4.9, accuracy: 4.6, location: 4.5, value: 4.8 },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Accommodation.deleteMany({});
    console.log('🗑️   Cleared existing users and accommodations');

    // Insert users (password hashing handled by pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`👤  Created ${createdUsers.length} users`);

    // Attach host_id to accommodations
    const host = createdUsers.find((u) => u.role === 'host');
    const accommodationsWithHost = accommodations.map((acc) => ({
      ...acc,
      host_id: host._id,
    }));

    await Accommodation.create(accommodationsWithHost);
    console.log(`🏠  Created ${accommodations.length} accommodation listings`);

    console.log('\n✅  Seed complete!');
    console.log('   Admin login: admin@airbnb.com / password123');
    console.log('   Host login:  jane@airbnb.com  / password321');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();

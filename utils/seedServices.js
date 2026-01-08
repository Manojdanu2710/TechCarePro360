import Service from '../models/Service.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedServices = async () => {
  try {
    await connectDB();

    const services = [
      // AMC Services
      {
        name: 'PC/Laptop AMC',
        description: 'Comprehensive maintenance contract for PCs and laptops',
        category: 'amc',
        price: 'Starting from ₹399/month',
        basePrice: 399,
        active: true,
        displayOrder: 1
      },
      {
        name: 'Network AMC',
        description: 'Network infrastructure maintenance and monitoring',
        category: 'amc',
        price: 'Starting from ₹699/month',
        basePrice: 699,
        active: true,
        displayOrder: 2
      },
      {
        name: 'Printer AMC',
        description: 'Regular maintenance and support for printers',
        category: 'amc',
        price: 'Starting from ₹499/month',
        basePrice: 499,
        active: true,
        displayOrder: 3
      },
      // Home IT Services
      {
        name: 'Installation',
        description: 'Software and hardware installation services',
        category: 'homeIT',
        price: 'Starting from ₹399',
        basePrice: 399,
        active: true,
        displayOrder: 1
      },
      {
        name: 'Troubleshooting',
        description: 'Diagnose and fix technical issues',
        category: 'homeIT',
        price: 'Starting from ₹399',
        basePrice: 399,
        active: true,
        displayOrder: 2
      },
      {
        name: 'Repair',
        description: 'Hardware and software repair services',
        category: 'homeIT',
        price: 'Starting from ₹599',
        basePrice: 599,
        active: true,
        displayOrder: 3
      },
      {
        name: 'Upgrade',
        description: 'System upgrades and performance optimization',
        category: 'homeIT',
        price: 'Starting from ₹799',
        basePrice: 799,
        active: true,
        displayOrder: 4
      }
    ];

    // Clear existing services (optional - comment out if you want to keep existing)
    // await Service.deleteMany({});

    // Insert services
    for (const service of services) {
      const existing = await Service.findOne({ name: service.name, category: service.category });
      if (!existing) {
        await Service.create(service);
        console.log(`✅ Created: ${service.name}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${service.name}`);
      }
    }

    console.log('\n✅ Services seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();


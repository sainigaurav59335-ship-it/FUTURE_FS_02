const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const User = require('./models/User');

dotenv.config();

const mockLeads = [
  {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.com',
    phone: '555-982-1984',
    source: 'Website Contact Form',
    status: 'New',
    notes: [{ text: 'Looking for emergency protection services. Urgently requested a callback.', createdBy: 'Website Contact Form' }],
    daysOffset: 1 // 1 day ago
  },
  {
    name: 'Tony Stark',
    email: 'tony@starkindustries.com',
    phone: '555-300-3000',
    source: 'Referral',
    status: 'Converted',
    notes: [
      { text: 'Interested in bulk purchasing clean energy modules.', createdBy: 'Admin' },
      { text: 'Finalized contract terms. Conversion successful.', createdBy: 'Admin' }
    ],
    daysOffset: 3 // 3 days ago
  },
  {
    name: 'Bruce Wayne',
    email: 'bwayne@wayneenterprises.com',
    phone: '555-000-1939',
    source: 'Social Media',
    status: 'Qualified',
    notes: [{ text: 'Expressed interest in night surveillance systems. Qualified lead.', createdBy: 'Admin' }],
    daysOffset: 5 // 5 days ago
  },
  {
    name: 'Peter Parker',
    email: 'peter.parker@dailybugle.com',
    phone: '555-824-7743',
    source: 'Website Contact Form',
    status: 'Contacted',
    notes: [{ text: 'Initial outreach made. Left voicemail.', createdBy: 'Admin' }],
    daysOffset: 8 // 8 days ago
  },
  {
    name: 'Clark Kent',
    email: 'ckent@dailyplanet.com',
    phone: '555-900-1938',
    source: 'Cold Outreach',
    status: 'New',
    notes: [{ text: 'Sent introduction email regarding our PR management portal.', createdBy: 'Admin' }],
    daysOffset: 12 // 12 days ago
  },
  {
    name: 'Diana Prince',
    email: 'diana.prince@louvre.fr',
    phone: '555-700-1941',
    source: 'Referral',
    status: 'Converted',
    notes: [{ text: 'Signed corporate tier license.', createdBy: 'Admin' }],
    daysOffset: 14 // 14 days ago
  },
  {
    name: 'Barry Allen',
    email: 'barry.allen@ccpd.gov',
    phone: '555-288-7867',
    source: 'Website Contact Form',
    status: 'Lost',
    notes: [{ text: 'Lead unresponsive after 3 attempts. Closed.', createdBy: 'Admin' }],
    daysOffset: 17 // 17 days ago
  },
  {
    name: 'Arthur Curry',
    email: 'acurry@atlantis.org',
    phone: '555-732-2626',
    source: 'Social Media',
    status: 'Contacted',
    notes: [{ text: 'Spoke briefly. Requested product catalog.', createdBy: 'Admin' }],
    daysOffset: 20 // 20 days ago
  },
  {
    name: 'Selina Kyle',
    email: 'skyle@gotham.org',
    phone: '555-228-9665',
    source: 'Cold Outreach',
    status: 'Qualified',
    notes: [{ text: 'Qualified budget requirements. Fit is good.', createdBy: 'Admin' }],
    daysOffset: 24 // 24 days ago
  },
  {
    name: 'Hal Jordan',
    email: 'hjordan@ferrisaircraft.com',
    phone: '555-473-3600',
    source: 'Referral',
    status: 'New',
    notes: [{ text: 'Interested in aviation logistics dashboard integration.', createdBy: 'Website Contact Form' }],
    daysOffset: 28 // 28 days ago
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-crm');
    console.log('Seed: Connected to Database...');

    // Clear existing leads
    await Lead.deleteMany({});
    console.log('Seed: Cleared old leads.');

    // Save mock leads with calculated creation dates spread in time
    for (const data of mockLeads) {
      const { daysOffset, ...leadData } = data;
      
      // Calculate date
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysOffset);

      // Create history entries
      const history = [
        {
          action: 'Lead Created',
          details: `Lead imported from ${leadData.source}.`,
          createdAt
        }
      ];

      // Add status progress changes to history if status is not 'New'
      if (leadData.status !== 'New') {
        const statusDate = new Date(createdAt);
        statusDate.setHours(statusDate.getHours() + 4);
        history.push({
          action: 'Status Changed',
          details: `Status updated from New to ${leadData.status}.`,
          createdAt: statusDate
        });
      }

      // Add reminders to some leads
      const reminders = [];
      if (leadData.status === 'Contacted' || leadData.status === 'Qualified') {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2); // 2 days in the future
        reminders.push({
          text: `Follow-up call with ${leadData.name}`,
          dueDate,
          completed: false
        });
      }

      const lead = new Lead({
        ...leadData,
        createdAt,
        history,
        reminders
      });

      await lead.save();
    }

    console.log('Seed: Database seeded successfully with 10 mock leads.');
    
    // Check if we should create a default admin user
    const adminExists = await User.findOne({ email: 'admin@crm.com' });
    if (!adminExists) {
      const defaultAdmin = new User({
        username: 'admin',
        email: 'admin@crm.com',
        password: 'password123'
      });
      await defaultAdmin.save();
      console.log('Seed: Created default admin (admin@crm.com / password123).');
    } else {
      console.log('Seed: Default admin already exists.');
    }

    mongoose.connection.close();
    console.log('Seed: Connection closed.');
  } catch (error) {
    console.error('Seed: Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();

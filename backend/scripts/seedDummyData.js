const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const Chat = require('../models/Chat');
const Feedback = require('../models/Feedback');
require('dotenv').config();

const seedDummyData = async (force = false) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/counseling_system');
    console.log('Connected to MongoDB');

    // Check if data already exists
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0 && !force) {
      console.log(`⚠️ Database already contains ${existingUsersCount} users. Skipping seeding.`);
      console.log('💡 To force reseed, run: node scripts/seedDummyData.js --force');
      return;
    }

    // Clear existing data only if force is true or no data exists
    if (force || existingUsersCount === 0) {
      await User.deleteMany({});
      await Session.deleteMany({});
      await Chat.deleteMany({});
      await Feedback.deleteMany({});
      console.log('Cleared existing data');
    }

    // Create dummy users
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client'
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client'
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        name: 'Manager User',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager'
      },
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: await bcrypt.hash('super123', 10),
        role: 'superadmin'
      },
      {
        name: 'Premal Ariwal',
        email: 'premalariwal22@gmail.com',
        password: await bcrypt.hash('premalariwala', 10),
        role: 'superadmin'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created dummy users');

    // Create dummy sessions
    const clientUsers = createdUsers.filter(u => u.role === 'client');
    const sessions = [];

    for (let i = 0; i < 20; i++) {
      const user = clientUsers[Math.floor(Math.random() * clientUsers.length)];
      const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
      const completed = Math.random() > 0.3; // 70% completed
      const duration = completed ? Math.floor(Math.random() * 3600) + 300 : null; // 5-65 minutes if completed

      sessions.push({
        userId: user._id,
        started_at: startedAt,
        updated_at: new Date(startedAt.getTime() + (duration || 0) * 1000),
        completed,
        duration
      });
    }

    const createdSessions = await Session.insertMany(sessions);
    console.log('Created dummy sessions');

    // Create dummy chats
    const chats = [];
    const chatMessages = [
      { sender: 'user', message: 'Hello, I need help with career guidance.' },
      { sender: 'bot', message: 'Hi! I\'m here to help you with career guidance. What specific questions do you have?' },
      { sender: 'user', message: 'I\'m not sure what career path to choose.' },
      { sender: 'bot', message: 'That\'s a common concern. Let\'s explore your interests and skills. What subjects did you enjoy in school?' },
      { sender: 'user', message: 'I liked mathematics and computer science.' },
      { sender: 'bot', message: 'Great! Those are excellent fields. Have you considered software development or data analysis?' },
      { sender: 'user', message: 'Yes, but I\'m worried about job prospects.' },
      { sender: 'bot', message: 'The tech industry has strong job prospects. Let me show you some career options.' },
      { sender: 'user', message: 'That sounds promising. Can you tell me more about software engineering?' },
      { sender: 'bot', message: 'Software engineering involves designing, developing, and maintaining software applications. It\'s a high-demand field with good salaries.' },
      { sender: 'user', message: 'What skills do I need to learn?' },
      { sender: 'bot', message: 'You\'ll need programming languages like Python, JavaScript, and frameworks. Also, problem-solving and communication skills.' },
      { sender: 'user', message: 'How long does it take to become a software engineer?' },
      { sender: 'bot', message: 'Typically 1-2 years of focused learning, depending on your background and dedication.' },
      { sender: 'user', message: 'Thank you for the information!' },
      { sender: 'bot', message: 'You\'re welcome! Feel free to ask more questions anytime.' }
    ];

    for (const session of createdSessions) {
      const numChats = Math.floor(Math.random() * 10) + 3; // 3-12 chats per session
      const sessionChats = [];

      for (let i = 0; i < numChats; i++) {
        const messageIndex = Math.floor(Math.random() * chatMessages.length);
        const message = chatMessages[messageIndex];
        const timestamp = new Date(session.started_at.getTime() + i * 60000); // 1 minute apart

        sessionChats.push({
          sessionId: session._id,
          userId: session.userId,
          message: message.message,
          sender: message.sender,
          timestamp
        });
      }

      chats.push(...sessionChats);
    }

    await Chat.insertMany(chats);
    console.log('Created dummy chats');

    // Create dummy feedback
    const feedback = [];
    const feedbackComments = [
      'Great counseling session! Very helpful and informative.',
      'The AI provided excellent career guidance. Highly recommended.',
      'Very useful insights about my career options.',
      'Good experience overall, but could use more specific advice.',
      'Excellent service! Helped me understand my career path better.',
      'The session was informative and the recommendations were spot on.',
      'Very professional and helpful counseling service.',
      'Good guidance, but I wish there were more resources provided.',
      'Outstanding experience! The AI understood my concerns perfectly.',
      'Helpful session, but could be more detailed in some areas.'
    ];

    for (const session of createdSessions) {
      if (Math.random() > 0.4) { // 60% of sessions have feedback
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
        const comment = feedbackComments[Math.floor(Math.random() * feedbackComments.length)];

        feedback.push({
          userId: session.userId,
          sessionId: session._id,
          rating,
          comments: comment,
          submitted_at: new Date(session.updated_at.getTime() + Math.random() * 24 * 60 * 60 * 1000) // Within 24 hours after session
        });
      }
    }

    await Feedback.insertMany(feedback);
    console.log('Created dummy feedback');

    console.log('\nDummy data seeding completed successfully!');
    console.log(`Created ${createdUsers.length} users, ${createdSessions.length} sessions, ${chats.length} chats, and ${feedback.length} feedback entries.`);

    // Print login credentials
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / manager123');
    console.log('Super Admin: superadmin@example.com / super123');
    console.log('Clients: [any client email] / password123');

  } catch (error) {
    console.error('Error seeding dummy data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding script
if (require.main === module) {
  const force = process.argv.includes('--force');
  seedDummyData(force);
}

module.exports = seedDummyData;

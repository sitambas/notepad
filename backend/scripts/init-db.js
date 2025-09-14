const Database = require('../database/database');

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    const db = new Database();
    
    // Wait a moment for the database to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test database connection
    const stats = await db.getStats();
    console.log('📊 Database stats:', stats);
    
    // Close connection
    await db.close();
    
    console.log('✅ Database initialized successfully!');
    console.log('📁 Database file created at: ./database/notepad.db');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

import pkg from 'pg';
const { Client } = pkg;

async function resetDatabase() {
  // Connect to postgres database (not elimed) to drop and recreate
  const client = new Client({
    host: 'localhost',
    port: 5000,
    user: 'postgres',
    password: '12345',
    database: 'postgres', // Connect to default postgres DB
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Drop the database if it exists
    await client.query('DROP DATABASE IF EXISTS elimed;');
    console.log('✓ Dropped database "elimed"');

    // Create the database
    await client.query('CREATE DATABASE elimed;');
    console.log('✓ Created database "elimed"');

    console.log('\n✓ Database reset complete!');
    console.log('\nNow run: npx prisma migrate deploy');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();

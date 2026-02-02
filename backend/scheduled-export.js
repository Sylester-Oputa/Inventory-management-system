const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:4000';
const TOKEN_FILE = path.join(__dirname, '.auth-token');

async function runDailyExport() {
  try {
    console.log('Starting daily export...');
    console.log('Time:', new Date().toISOString());

    // Read the auth token
    let token = '';
    if (fs.existsSync(TOKEN_FILE)) {
      token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    } else {
      console.error('Auth token file not found. Please create .auth-token file with a valid token.');
      process.exit(1);
    }

    // Make API call to generate export
    const response = await axios.post(
      `${API_URL}/export/generate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Export completed successfully!');
    console.log('Filepath:', response.data.filepath);
    console.log('Completed at:', new Date().toISOString());

    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runDailyExport();

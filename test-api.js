// Test the EliMed API endpoints
async function testSetupOwner() {
  try {
    const response = await fetch('http://localhost:4000/setup/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Owner',
        username: 'testowner',
        password: 'TestPass123'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testSetupOwnerInvalid() {
  try {
    const response = await fetch('http://localhost:4000/setup/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',  // Invalid - empty name
        username: 'ab',  // Invalid - too short
        password: 'short'  // Invalid - too short
      })
    });
    
    const data = await response.json();
    console.log('\n=== VALIDATION ERROR TEST ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

console.log('Testing EliMed API...\n');
testSetupOwnerInvalid();

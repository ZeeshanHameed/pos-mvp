#!/usr/bin/env node

/**
 * Firebase Service Account Credential Converter
 * 
 * This script converts a Firebase service account JSON file to a single-line
 * string that can be used as an environment variable for deployment.
 * 
 * Usage:
 *   node scripts/convert-firebase-credentials.js <path-to-service-account.json>
 * 
 * Example:
 *   node scripts/convert-firebase-credentials.js ./secrets/firebase-service-account.json
 */

const fs = require('fs');
const path = require('path');

// Get the file path from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Please provide the path to your Firebase service account JSON file');
  console.log('\nUsage:');
  console.log('  node scripts/convert-firebase-credentials.js <path-to-service-account.json>');
  console.log('\nExample:');
  console.log('  node scripts/convert-firebase-credentials.js ./secrets/firebase-service-account.json');
  process.exit(1);
}

const filePath = args[0];
const absolutePath = path.isAbsolute(filePath) 
  ? filePath 
  : path.resolve(process.cwd(), filePath);

// Check if file exists
if (!fs.existsSync(absolutePath)) {
  console.error(`❌ Error: File not found: ${absolutePath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const fileContent = fs.readFileSync(absolutePath, 'utf8');
  const serviceAccount = JSON.parse(fileContent);

  // Validate that it's a service account file
  if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
    console.error('❌ Error: This does not appear to be a valid Firebase service account JSON file');
    process.exit(1);
  }

  // Convert to single-line JSON string
  const singleLineJson = JSON.stringify(serviceAccount);

  console.log('✅ Firebase Service Account Credentials Converted Successfully!\n');
  console.log('📋 Copy the following line and set it as your FIREBASE_SERVICE_ACCOUNT environment variable:\n');
  console.log('─'.repeat(80));
  console.log(singleLineJson);
  console.log('─'.repeat(80));
  console.log('\n📝 For .env file, add this line:');
  console.log(`FIREBASE_SERVICE_ACCOUNT='${singleLineJson}'`);
  console.log('\n🚀 For deployment platforms (Heroku, Vercel, etc.):');
  console.log('   Set the environment variable name: FIREBASE_SERVICE_ACCOUNT');
  console.log('   Set the value to the JSON string above (without quotes)');
  console.log('\n⚠️  Security Warning:');
  console.log('   - Never commit this credential to version control');
  console.log('   - Use secure environment variable management in production');
  console.log('   - Rotate credentials regularly');

} catch (error) {
  console.error('❌ Error processing file:', error.message);
  process.exit(1);
}


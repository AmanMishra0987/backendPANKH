import bcrypt from 'bcryptjs';

/**
 * Helper script to generate password hash
 * Run this once to generate a hash for your admin password
 * 
 * Usage: node -e "import('./server/utils/passwordHelper.js').then(m => m.generateHash('your-password'))"
 */

export const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('\n✅ Password hash generated:');
  console.log(hash);
  console.log('\n📝 Add this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  return hash;
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const password = process.argv[2];
  if (!password) {
    console.log('Usage: node server/utils/passwordHelper.js <password>');
    process.exit(1);
  }
  generateHash(password);
}


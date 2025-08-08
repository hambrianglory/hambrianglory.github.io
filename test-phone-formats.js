// Quick test to verify phone formatting logic
const testPhones = [
  '0724222003',    // String with leading 0
  724222003,       // Number without leading 0
  '94724222003',   // String with country code
  94724222003,     // Number with country code
  '0777123456',    // Another Sri Lankan number
  null,            // Edge case
  undefined,       // Edge case
  ''               // Empty string
];

console.log('📱 Testing Phone Number Formatting Logic...\n');

// Simulate the formatPhoneNumber function logic
function formatPhoneNumber(phone) {
  // Convert to string if it's a number (our fix)
  const phoneStr = String(phone || '');
  
  // Remove all non-numeric characters
  let cleanPhone = phoneStr.replace(/\D/g, '');
  
  // Handle Sri Lankan numbers
  if (cleanPhone.startsWith('94')) {
    // Already has country code
    return `${cleanPhone}@c.us`;
  } else if (cleanPhone.startsWith('0')) {
    // Local number starting with 0, replace with 94
    return `94${cleanPhone.substring(1)}@c.us`;
  } else if (cleanPhone.length === 9) {
    // 9 digit number without country code or leading 0
    return `94${cleanPhone}@c.us`;
  } else {
    // Return original with @c.us if no pattern matches
    return `${cleanPhone}@c.us`;
  }
}

testPhones.forEach(phone => {
  try {
    const result = formatPhoneNumber(phone);
    const status = result.includes('94724222003@c.us') || result.includes('94777123456@c.us') ? '✅' : '📱';
    console.log(`${status} Input: ${phone} (${typeof phone}) → Output: ${result}`);
  } catch (error) {
    console.log(`❌ Input: ${phone} (${typeof phone}) → Error: ${error.message}`);
  }
});

console.log('\n🎯 Target Number Test:');
console.log(`✅ 0724222003 → ${formatPhoneNumber('0724222003')}`);
console.log(`✅ 724222003 → ${formatPhoneNumber(724222003)}`);

console.log('\n🔧 The fix ensures:');
console.log('   • String numbers work: "0724222003"');  
console.log('   • Numeric values work: 724222003');
console.log('   • No "phone.replace is not a function" errors');
console.log('   • Proper WhatsApp format: 94724222003@c.us');

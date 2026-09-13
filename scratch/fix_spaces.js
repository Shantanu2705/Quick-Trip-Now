const fs = require('fs');
let c = fs.readFileSync('components/admin/BookingInvoice.tsx', 'utf8');

// Find all instances of [...rgba(...)...] and remove spaces within the brackets
c = c.replace(/\[([^\]]*rgba[^\]]*)\]/g, (match, p1) => {
    return '[' + p1.replace(/\s+/g, '') + ']';
});

fs.writeFileSync('components/admin/BookingInvoice.tsx', c);
console.log('Fixed Tailwind spaces.');

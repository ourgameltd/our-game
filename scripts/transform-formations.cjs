const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'formations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add the helper function after the import (only if not already present)
const helperFunction = `

// Helper to create system formation with default scope
const createSystemFormation = (formation: Omit<Formation, 'scope' | 'isSystemFormation'>): Formation => ({
  ...formation,
  isSystemFormation: true,
  scope: { type: 'system' }
});
`;

if (!content.includes('createSystemFormation')) {
  content = content.replace(
    "import { Formation } from '../types/index';",
    `import { Formation } from '../types/index';${helperFunction}`
  );
}

// Replace each formation object opening with createSystemFormation wrapper
// Match pattern: array start or comma, whitespace, optional comment, then { followed by id:
content = content.replace(
  /(\[\s*\n\s*)(\/\/[^\n]*\n\s*)?(\{\s*\n\s*id:)/g,
  (match, pre, comment, rest) => {
    const commentPart = comment || '';
    return `${pre}${commentPart}createSystemFormation(${rest}`;
  }
);

// Match formations after commas
content = content.replace(
  /(,\s*\n\s*)(\/\/[^\n]*\n\s*)?(\{\s*\n\s*id:)/g,
  (match, pre, comment, rest) => {
    const commentPart = comment || '';
    return `${pre}${commentPart}createSystemFormation(${rest}`;
  }
);

// Replace 'description:' with 'summary:' for Formation type compatibility
content = content.replace(/(\s+)description:/g, '$1summary:');

// Replace 'tactics:' with 'tags:' for Formation type compatibility  
content = content.replace(/(\s+)tactics:/g, '$1tags:');

// Replace closing braces at end of formations with closing paren
// Each formation ends with ]  } (with possibly varied whitespace)
content = content.replace(
  /(\])\s*\n(\s*)\}(,|\s*\n\s*\];)/g,
  (match, bracket, ws, ending) => `${bracket}\n${ws}})${ending}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Formation transformation complete!');

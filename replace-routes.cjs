const fs = require('fs');
const path = require('path');

const replacements = {
  '/foydalanuvchi': '/users',
  '/jamiyat': '/community',
  '/masalalar': '/problems',
  '/natijalar': '/results',
  '/profil': '/profile',
  '/sozlamalar': '/settings',
  '/tarix': '/history',
  '/test-tanlash': '/quizzes',
  '/test-jarayoni': '/quiz-session'
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        // use regex to replace exact route paths
        const regex = new RegExp(`(['"\`])${key}(/?|['"\`?#])`, 'g');
        const newContent = content.replace(regex, `$1${value}$2`);
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'apps', 'web', 'src'));

import fs from 'fs';
import path from 'path';

// Đọc tất cả các file trong thư mục models, trừ index.ts
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.ts')
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    // Đảm bảo rằng module exports model
    if (model) {
      console.log(`Model ${file} loaded.`);
    }
  });

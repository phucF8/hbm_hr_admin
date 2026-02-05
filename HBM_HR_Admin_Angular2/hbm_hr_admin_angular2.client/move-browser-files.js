const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

// Đường dẫn tuyệt đối
const sourceDir = 'D:/admin_deploy/wwwroot/browser';
const targetDir = 'D:/admin_deploy/wwwroot';

if (!fse.existsSync(sourceDir)) {
  console.error(`❌ Không tìm thấy thư mục: ${sourceDir}`);
  process.exit(1);
}

fse.readdirSync(sourceDir).forEach(file => {
  const srcPath = path.join(sourceDir, file);
  const destPath = path.join(targetDir, file);
  fse.moveSync(srcPath, destPath, { overwrite: true });
});

fse.removeSync(sourceDir);
console.log('✅ Đã di chuyển file từ "browser/" ra thư mục cha.');

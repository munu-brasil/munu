const fs = require('fs');
const fileBuilds = './builds';
const webBuilds = [
  { path: '/apps/munu-app/', file: 'dist', dest: '/admin' },
];

const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

if (!fs.existsSync(fileBuilds)) {
  fs.mkdirSync(fileBuilds);
}

webBuilds.map((fp) => {
  try {
    const currentPath = `.${fp.path}${fp.file}`;
    const newPath = fileBuilds + fp.dest;

    if (!fs.existsSync(currentPath)) {
      return;
    }
    deleteFolderRecursive(newPath);
    fs.renameSync(currentPath, newPath);
  } catch (e) {
    console.log(`${fp.path} ${e}`);
  }
});

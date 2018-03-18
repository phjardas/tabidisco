const fs = require('fs-extra');
const path = require('path');
const pkg = require('./package.json');

const root = __dirname;
const server = path.resolve(root, 'server');
const gui = path.resolve(root, 'gui');
const target = path.resolve(root, 'npm');

function copyFile(src, targetDir) {
  const target = path.resolve(targetDir, path.parse(src).base);
  return fs.copy(src, target);
}

async function writePackageJson() {
  const pkg = { ...require(path.resolve(server, 'package.json')) };
  ['private', 'scripts', 'devDependencies', 'jest', 'main', 'typings'].forEach(f => delete pkg[f]);
  pkg.scripts = { start: 'node index.js' };

  const mainPkg = require('./package.json');
  ['name', 'version', 'description', 'homepage', 'bugs', 'license', 'author', 'contributors', 'repository', 'bin'].forEach(
    f => (pkg[f] = mainPkg[f])
  );

  await fs.writeFile(path.resolve(target, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');
}

async function main() {
  await fs.emptyDir(target);
  await fs.ensureDir(target);

  // write package.json
  await writePackageJson();

  // write README.md
  await fs.writeFile(
    path.resolve(target, 'README.md'),
    '# Tabidisco: Jukebox for kids powered by Raspberry Pi\n\nThis is the GUI for [Tabidisco](https://github.com/phjardas/tabidisco).\n',
    'utf-8'
  );

  // copy server files
  await fs.copy(path.resolve(server, 'dist'), target, {
    filter: f => !f.endsWith('.ts') && !f.endsWith('.map'),
  });

  // copy GUI files
  await fs.ensureDir(path.resolve(target, 'gui'));
  await fs.copy(path.resolve(gui, 'dist'), path.resolve(target, 'gui'));

  // copy bin files
  await fs.copy(path.resolve(root, 'bin'), path.resolve(target, 'bin'));
}

main()
  .then(() => console.log('DONE'))
  .catch(err => {
    process.exitCode = 1;
    console.error('ERROR:', err);
  });

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter path to the root directory: ', (rootPath) => {
  const mdlFiles = [];
  const allPaths = [];
  let count = 0;
  
  function traverseDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        traverseDirectory(filePath);
      } else if (path.extname(filePath) === '.mdl') {
        mdlFiles.push(filePath);
      }
    }
  }

  function processFiles(files) {

    if (files.length === 0) {
      fs.writeFile("./output.lua", allPaths.join('\n'), (err) => {
        if (err) throw err;
        console.log('Saved model pool to output.lua');
        rl.close();
      });
      return;
    }

    const normalizePath = files.shift().replace(/\\/g, '/').replace(/^.*(\/models\/)/, 'models/');

    rl.question(`\x1b[32m${normalizePath}\x1b[0m\nIs this a LIFETIME Supporter model? (1 for yes, 0 for no [default]): `, (isSupporter) => {
      count += 1;
      let structure;
      if (isSupporter === '1') {
        structure = `["sup_mdl${count}"] = {name = "Supporter Model ${count}", supporter = true, steamid = "STEAM_0:1:225833141", darkrpcost = -1, coincost = -1, mdl = "${normalizePath}", hasAccess = function( ply ) return SUPPORTER:IsLifeTime( ply ) end, type = CC.ItemType.SUP_LIFETIME },`;
      } else {
        structure = `["sup_mdl${count}"] = {name = "Supporter Model ${count}", supporter = true, steamid = "STEAM_0:1:225833141", darkrpcost = -1, coincost = -1, mdl = "${normalizePath}", hasAccess = function( ply ) return SUPPORTER:IsActive( ply ) end },`;
      }
      allPaths.push(structure);
      processFiles(files);
    });
  }

  traverseDirectory(rootPath);
  processFiles(mdlFiles);
});

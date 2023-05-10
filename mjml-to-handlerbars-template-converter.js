const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Converts mjml to HandleBars syntax
 *
 * The HandlerBars code are written inside <mj-raw></mj-raw> tags as a comment.
 *
 * For example:
 * ```
 * <mj-raw>
 *   <!--{{#each messages}}-->
 * </mj-raw>
 *
 * <mj-raw>
 *   <!--{{/each}}-->
 * </mj-raw>
 * ```
 *
 * This script first execute the `mjml mjml-file-name` command and take HandleBars
 * code out of the comments to generate a HandleBars files.
 * The resulting html file has the same name as the .mjml file.
 *
 *
 * To execute, use `node mjml-to-handlerbars-template-converter.js --path=/terraform/notification-dispatcher/templates`
 */
function main() {
  const extractPathArgvFn = () => {
    let pathArgument = process.argv.find(it => it.startsWith('--path='));
    if (!pathArgument) {
      console.log(`Invalid --path ${pathArgument}`);
      process.exit(1);
    }
    pathArgument = pathArgument.replace('--path=', '').trim();
    return pathArgument;
  };

  const filterMjmlFiles = (dir) => {
    return dir.filter(it => path.extname(it) === '.mjml');
  };

  const inputPath = extractPathArgvFn();
  console.log(`Reading mjml files at path ${inputPath}`);
  const filePath = inputPath.split('/');
  const templatePath = path.join(...filePath);
  const srcDir = fs.readdirSync(templatePath);

  const mjmlFiles = filterMjmlFiles(srcDir);

  mjmlFiles.forEach((fileName) => {
    console.log(`Processing ${fileName}...`);
    exec(`mjml ${path.join(templatePath, fileName)}`, (error, stdout, stderr) => {
      let lines = stdout.split('\n');
      lines.shift(); // stdout has unneeded first line so remove it
      const newContent = mjmlToHandlerBarsConverter(lines);
      const newFileName = path.basename(fileName).replace('mjml', 'html');
      console.log(`The output has been written to ${newFileName}`);
      fs.writeFileSync(path.join(templatePath, newFileName), newContent);
    });
  });
}

function isContainsHandlerBarsCode(currentLine) {
  return currentLine.trim().startsWith('<!--{{') // HandlerBars start tag
    && currentLine.trim().endsWith('}}-->'); // HandlerBars end tag
}

function mjmlToHandlerBarsConverter(lines) {
  const newLines = [];
  lines = lines.filter(it => it.trim().length > 0);
  for (let i = 0; i < lines.length; i++) {
    let current = lines[i];
    if (isContainsHandlerBarsCode(current)) {
      // <!--{{#each messages}}-->
      current = current.replace('<!--', '').replace('-->', '');
    }
    newLines.push(current);
  }
  return newLines.join('\n');
}


main();

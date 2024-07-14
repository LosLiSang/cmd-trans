#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const axios = require('axios');
const qs = require('qs');
const md5 = require('blueimp-md5');
const fs = require('fs');
const os = require('os');
const path = require('path');

const hostDirectory = os.homedir();

const configPath = path.join(hostDirectory, '.cmd-translator');

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    `{
  "appKey": "",e
  "key": ""
}`
  );
}

const { url, from, to, salt } = require('./config');


function print(data) {
  let firstLine = '';

  firstLine += data.query;

  // phonetic symbol
  if (data.basic && data.basic.phonetic) {
    firstLine += chalk.magenta('  [ ' + data.basic.phonetic + ' ]');
  }

  log(
    `${firstLine}  ${data.translation}  ${chalk.gray('~  fanyi.youdao.com')}`
  );

  // pos & acceptation
  if (data.basic && data.basic.explains) {
    log();
    data.basic.explains.forEach(function (item) {
      log(chalk.gray('- ') + chalk.green(item));
    });
  }

  // sentence
  if (data.web && data.web.length) {
    log();
    data.web.forEach(function (item, i) {
      log(chalk.gray(i + 1 + '. ') + highlight(item.key, data.query));
      log('   ' + chalk.cyan(item.value.join(',')));
    });
  }

  log();
  log(chalk.red('Translation done!'));
}

function log(message, indentNum) {
  indentNum = indentNum || 1;
  const indent = '';
  for (const i = 1; i < indentNum; i++) {
    indent += '  ';
  }
  console.log(indent, message || '');
}

function highlight(string, key, defaultColor) {
  defaultColor = defaultColor || 'gray';
  string = string.replace(
    new RegExp('(.*)(' + key + ')(.*)', 'gi'),
    '$1$2' + chalk[defaultColor]('$3')
  );
  return string.replace(
    new RegExp('(.*?)(' + key + ')', 'gi'),
    chalk[defaultColor]('$1') + chalk.yellow('$2')
  );
}

module.exports = q => {
  let appKey, key;
  try{
    const data = fs.readFileSync(configPath, 'utf-8');
    ({ appKey, key } = JSON.parse(data));
  } catch(err){
    console.error('读取或解析{}时出错', configPath);
    console.error('请检查{}', configPath);
    console.error('appKey and key are obtained from https://ai.youdao.com/console/#/service-singleton/text-translation');
    process.exit();
  }
  
  
  axios({
    method: 'post',
    url,
    data: qs.stringify({
      q,
      appKey,
      salt,
      from,
      to,
      sign: md5(appKey + q + salt + key)
    })
  }).then(res => {
    print(res.data);
  });
};

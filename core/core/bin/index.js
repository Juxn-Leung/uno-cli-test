#!/usr/bin/env node

// console.log("welcome @nuo-cli-test/core")

// const utils = require('@uno-cli-test/utils')

// console.log(utils()) 

const importLocal = require('import-local')
const log = require('@uno-cli-test/log')

if (importLocal(__filename)) {
  log.info('cli', '正在使用 uno-cli 本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}
'use strict';

module.exports = core;

const os = require('os');
const userHome = os.homedir();
const path = require('path');

const commander = require('commander');
const semver = require('semver');
const colors = require('colors/safe');

const log = require('@uno-cli-test/log');
const init = require('@uno-cli-test/init')
const exec = require('@uno-cli-test/exec')

const pkg = require('../package.json');
const constant = require('./const');

let args;

const program = new commander.Command();

async function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
    registerCommand()
  } catch (err) {
    log.error(err.message)
  }
}

// 注册命令
function registerCommand() {
  // npm i -S commander
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', ''); // 全局属性

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(init);

  // 将checkInputArgs()方法放在这里
  // 开启调试模式
  program.on('option:debug', function() {
    if (program._optionValues.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    } 
    // console.log('debug', program)
    log.level = process.env.LOG_LEVEL
    log.verbose('debug');
  });

  // 指定targetPath
  program.on('option:targetPath', function() {
    process.env.CLI_TARGET_PATH = program._optionValues.targetPath;
    console.log('program.targetPath', program._optionValues.targetPath)
  });
  

  // 对未知命令监听
  program.on('command:*', function(obj) {
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.log(colors.red('未知的命令：' + obj[0]));
    if (availableCommands.length) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')));
    }
  });

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }

  program.parse(process.argv);

}

function checkPkgVersion() {
  log.success(pkg.version)
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`uno-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`))
  }
}

async function checkRoot() {
  const rootCheck = await import('root-check');
  rootCheck.default();
}

async function checkUserHome() {
  const { pathExists } = await import('path-exists')
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登录用户主目录不存在！`))
  }
}

function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs()
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.LOG_LEVEL
}

async function checkEnv() {
  const { pathExists } = await import('path-exists')
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    });
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  };
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用npm API，获取所有版本号
  const { getNpmSemverVersions } = require('@uno-cli-test/get-npm-info')
  const lastVersion = await getNpmSemverVersions(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动跟新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${lastVersion}
      更新命令: npm install -g ${npmName}`))
  }
  // 3. 提取所有版本号，对比哪些版本号是大于当前版本号

  // 4. 获取最新的版本号，提示用户更新到最新版本
}

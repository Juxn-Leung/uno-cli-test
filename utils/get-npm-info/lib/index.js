'use strict';

const axios = require('axios')
const semver = require('semver')


async function getNpmInfo(npmName, registry) {
  console.log(npmName)
  if (!npmName) return null
  // 将 axios 库安装到 utils/get-npm-info 
  // npm i axios -w utils/get-npm-info/
  // 网络请求


  // 将 url-join 库安装到 utils/get-npm-info 
  // npm i url-join -w utils/get-npm-info/
  // 拼接 url
  const urlJoin = (await import('url-join')).default;

  // 将 semver 库安装到 utils/get-npm-info 
  // npm i semver -w utils/get-npm-info/
  // 版本比较
  console.log(urlJoin)
  
  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registryUrl, npmName)
  console.log(npmInfoUrl)
  return axios.get(npmInfoUrl).then(response => {
    if (response.status === 200) {
      return response.data
    }
    return null
  }).catch(error => {
    return Promise.reject(error)
  })
}

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org': 'https://registry.npmjs.taobao.org'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions);
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  const newVersions = versions.filter(version => semver.satisfies(version, `^${baseVersion}`)).sort((a, b) => semver.gt(b, a));
  return newVersions
}

async function getNpmSemverVersions(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersions
}
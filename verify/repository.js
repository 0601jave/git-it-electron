var exec = require('child_process').exec
var fs = require('fs')

var helper = require('../lib/helpers.js')
var userData = require('../lib/user-data.js')

var addtoList = helper.addtoList
var markChallengeCompleted = helper.markChallengeCompleted

// do I want to do this as a var? un-needed, also can't browser view
// pass in the challenge string?
var currentChallenge = 'repository'

module.exports = function repositoryVerify (path) {
  // path should be a directory
  if (!fs.lstatSync(path).isDirectory()) return addtoList('Path is not a directory', false)
  exec('git status', {cwd: path}, function (err, stdout, stdrr) {
    if (err) return addtoList(err.message, false)
    // can't return on error since git's 'fatal' not a repo is an error
    // potentially read file, look for '.git' directory
    var status = stdout.trim()
    if (status.match('On branch')) {
      addtoList('This is a Git repository!', true)
      markChallengeCompleted(currentChallenge)
      userData.updateData(currentChallenge)
    }
    else addtoList("This folder isn't being tracked by Git.", false)
  })
}

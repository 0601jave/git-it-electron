#!/usr/bin/env node

var exec = require('child_process').exec
var fs = require('fs')

var helper = require('../helpers.js')
var userData = require('../user-data.js')

var addtoList = helper.addtoList
var markChallengeCompleted = helper.markChallengeCompleted

var currentChallenge = 'merge_tada'
var counter = 0
var total = 2

// check that they performed a merge
// check there is not username named branch

module.exports = function verifyMergeTadaChallenge (path) {
  counter = 0
  if (!fs.lstatSync(path).isDirectory()) {
    addtoList('Path is not a directory', false)
    return helper.challengeIncomplete()
  }

  exec('git reflog -10', {cwd: path}, function (err, stdout, stdrr) {
    if (err) {
      addtoList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    var ref = stdout.trim()

    if (ref.match('merge')) {
      counter++
      addtoList('Branch has been merged!', true)
    } else addtoList('No merge in the history.', false)

    exec('git config user.username', function (err, stdout, stdrr) {
      if (err) {
        addtoList('Could not find username', false)
        return helper.challengeIncomplete()
      }
      var user = stdout.trim()

      exec('git branch', {cwd: path}, function (err, stdout, stdrr) {
        if (err) {
          addtoList('Error: ' + err.message, false)
          return helper.challengeIncomplete()
        }
        var branches = stdout.trim()
        var branchName = 'add-' + user

        if (branches.match(branchName)) {
          addtoList('Uh oh, branch is still there.', false)
          helper.challengeIncomplete()
        }
        else {
          counter++
          addtoList('Branch deleted!', true)
          if (counter === total) {
            markChallengeCompleted(currentChallenge)
            userData.updateData(currentChallenge)
          }
        }
      })
    })
  })
}

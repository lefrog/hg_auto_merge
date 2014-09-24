/**
 * https://github.com/lefrog/hg_auto_merge
 *
 * node hg_auto_merge.js <parent repo url> [merge commit comment]
 */

var util = require('util');
var exec = require('child_process').exec;

var parent_repo = process.argv[2] || process.env['parent_branch_name'];
var commit_message = process.argv[3] || util.format('Merge with %s', parent_repo);


function doPush() {
    exec("hg push", function(err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log("Failed to push: %s", stderr);
        } else {
            console.log("Done!");
        }
    });
}

function doMerge() {
    exec("hg merge -t internal:merge", function(err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log("Failed to merge: %s", stderr);
            throw new Error("Failed to merge");
        } else {
            var cmd = util.format('hg commit -m "%s"', commit_message);
            exec(cmd, function(err, stdout, stderr) {
                if (err) {
                    console.log("Failed to commit merge: %s", stderr);
                } else {
                    doPush();
                }
            });
        }
    });
}

function doUpdate() {
    exec("hg update", function(err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log("Update failed: %s", stderr);
        } else {
            if (stdout.match(/no changes found/) == null) {
                doPush();
            }
        }
    });
}

function doDetectMultipleHeads() {
    exec("hg heads default", function(err, stdout, stderr) {
        if (err) {
            console.log('Failed to get heads: %s', err);
        } else {
            if (stdout.match(/changeset:   /g).length > 1) {
                doMerge();
            } else {
                doUpdate();
            }
        }
    });
}

exec("hg pull " + parent_repo, function(err, stdout, stderr) {
    console.log(stdout);
    if (err) {
        console.log("Failed pull %s", stderr);
    } else {
        doDetectMultipleHeads();
    }
});

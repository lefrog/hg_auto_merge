var exec = require('child_process').exec;

var current_repo = process.env["current_branch_name"];
var parent_repo = process.env["parent_branch_name"];

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
    var msg = "Merge " + parent_repo + " into " + current_repo;
    exec("hg merge -t internal:merge && hg commit -m '" + msg + "'", function(err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log("Failed to merge: %s", stderr);
        } else {
            doPush();
        }
    });
}

function doUpdate() {
    exec("hg update", function(err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.log("Update failed: %s", stderr);
        } else {
            doPush();
        }
    });
}

function doDetectMultipleHeads() {
    exec("hg heads default", function(err, stdout, stderr) {
        if (stdout.lastIndexOf("changeset") > 1) {
            doMerge();
        } else {
            doUpdate();
        }
    });
}

exec("hg pull " + parent_repo, function(err, stdout, stderr) {
    console.log(stdout);
    if (err) {
        console.log("Failed pull %s", stderr);
    } else {
        console.log(stdout);
        doDetectMultipleHeads();
    }
});

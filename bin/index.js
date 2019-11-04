#!/usr/bin/env node
const path = process.argv[2];
const exec = require("child_process").exec;
const p = require('path');
function execShellCommand(cmd) {  
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

async function main() {
  var file = "Changelog.html";
  var fs = require("fs");
  fs.appendFileSync(file, template);
  fs.writeFileSync(file, '<html><head><meta charset="UTF-8"><head><body>');
  var cssPath = p.join(__dirname, '..', 'lib', 'style.css');
  var style = fs.readFileSync(cssPath);
  fs.appendFileSync(
    file,
    "<style>" +
      style +
      "</style>"
  );

  var template = `
    <div>
      <div class=header2>
         <div class="releaseSelector">
            <h1> Sürüm Notları Gadget </h1>
         </div>
      </div>
      <div class="container">
        `;

  const tagListsStr = await execShellCommand(
    'git --git-dir ' + path + '/.git tag -l --sort=-taggerdate --format="%(creatordate:short)|%(refname)"'
  );
  var tagList = ["|HEAD"];
  tagList = tagList.concat(tagListsStr.split("\n"));
  for (var i in tagList) {
    var line = tagList[i];
    var tag = line.split("|")[1];
    var date = line.split("|")[0];
    if (line === "") {
      continue;
    }
    tag = tag.replace("refs/tags/", "");
    var lastTag =
      i < tagList.length - 2 ? tagList[parseInt(i) + 1].split("|")[1] : "";
    let issue = `
      <div class="update">
        <div class="issue">
          <div class="issueButton">
            <p>${tag}</p>
          </div>
          <div class="issueText">${date}</div>
        </div>
        `;
    var cmdLine = `git --git-dir ${path}/.git log ${lastTag}..${tag} --pretty=format:"%s" --date=short`;
    const commits = await execShellCommand(cmdLine);
    if (commits === "" || commits.split("\n").length == 0) {
      continue;
    }
    for (var x in commits.split("\n")) {
      issue += `
        <div class="issueItem">
          <div class="issueItemButton new">Yeni</div>
          <div class="issueItemText">
            ${commits.split("\n")[x].trim()}
          </div>
        </div>`;
    }
    issue += "</div>";
    lastTag = tag;
    template += issue;
  }
  template += "</div>";
  template += "</div>";
  template += "</body>";
  template += "</html>";
  fs.appendFileSync(file, template);
}
main();

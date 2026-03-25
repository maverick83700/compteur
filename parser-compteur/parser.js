const fs = require("fs");

const content = fs.readFileSync("data.txt", "utf-8");

const groups = [];
let currentGroup = null;

const lines = content.split("\n");

let currentName = null;
let currentValue = null;

for (let line of lines) {
  line = line.trim();
  console.log(line);
  const lnjson = JSON.parse(line);

  //au premier passage on créer le premier group
  if(groups==[]) {
    currentGroup = lnjson.GroupName;
    groups.push({
      name: currentGroup,
      counters: [{
            title: lnjson.Name,
            value: Math.floor(parseInt(lnjson.CountValue, 10) / 1000)
        }]
    });
  }
  //sinon on boucle les groupes déjà existant
  else {
    for (let group of groups) {
      if(group.name === lnjson.GroupName) {
        currentGroup = group;

        //on ajoute le compteur au groupe
        group.counters.push({
            title: lnjson.Name,
            value: Math.floor(parseInt(lnjson.CountValue, 10) / 1000)
        });
        break;
      }
    }
    console.log(currentGroup);
    //si le groupe existe pas on le créer
    if(!currentGroup) {
        currentGroup = lnjson.GroupName;
        groups.push({
          name: currentGroup,
          counters: [{
            title: lnjson.Name,
            value: Math.floor(parseInt(lnjson.CountValue, 10) / 1000)
        }]
        });
    }
  }

  
  
  currentGroup = null;
}


fs.writeFile('date-parse.txt', JSON.stringify(groups, null, 2), err => {
  if (err) {
    console.error(err);
  } else {
    console.log('File written successfully');
  }
});
//console.log(JSON.stringify(groups, null, 2));
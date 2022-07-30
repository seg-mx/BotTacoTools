const Upgrade = require('./upgrade.js');
const fs = require('fs');

function loadData(data) {
    let upgrades = new Map();
    for (let id in data.upgrades) {
        let upgrade = new Upgrade(data, id);
        upgrades.set(id, upgrade);
    }

    return upgrades;
}

function saveData(upgrades) {
    let json = {upgrades: {}};

    for (let i in upgrades) {
        let up = upgrades[i];
        json.upgrades[up.id] = up.toJSON();
    }

    fs.writeFileSync('./data.json', JSON.stringify(json));
}

module.exports = {loadData, saveData};

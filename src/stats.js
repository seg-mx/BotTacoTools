const {getPrice} = require('./utils.js');

function sendStats(upgrades, channel) {
    let array = Array.from(upgrades.values());

    let missing = getMissingTiers(array);
    let total = getTotalTiers(array);
    let current = total-missing;

    let cu = getCompletedUpgrades(array);
    let missingUp = array.length-cu;

    let money = calculateMissingMoney(array);

    let income = calculateRemainingIncome(array);

    channel.send(
        ":small_red_triangle: Tiers faltantes: " +missing+ " (" +current+ "/" +total+ ")\n" +
        ":ballot_box_with_check: Mejoras faltantes: "+missingUp+" ("+cu+"/"+array.length+")\n" +
        ":moneybag: Dinero faltante: "+Number(money).toLocaleString(),
        ":alarm_clock: Income faltante:"+Number(income).toLocaleString()
    );
}

function getMissingTiers(array) {
    let missing = 0;
    array.forEach(upgrade => {
        missing += upgrade.max - upgrade.current;
    });

    return missing;
}

function getTotalTiers(array) {
    let total = 0;
    array.forEach(upgrade => {
        total += upgrade.max;
    });
    return total;
}

function getCompletedUpgrades(array) {
    let upgrades = 0;
    array.forEach(upgrade => {
        if (upgrade.isCompleted) {
            upgrades++;
        }
    });
    return upgrades;
}

function calculateMissingMoney(array) {
    let money = 0;
    for (let i in array) {
        let upgrade = array[i];
        let upgradeMoney = 0;

        for (let j = upgrade.current; j < upgrade.max; j++) {
            upgradeMoney += getPrice(upgrade.initial, j);
        }
        money += upgradeMoney;
    }
    return money;
}

function calculateRemainingIncome(array) {
    let income = 0;
    for (let i in array) {
        let upgrade = array[i];

        if (typeof upgrade.boost != 'number') {
            continue;
        }

        for (let j = upgrade.current; j < upgrade.max; j++) {
            income += upgrade.boost;
        }
    }
    return income;
}

module.exports = sendStats;

function getPrice(initial, tier) {
    const limit = tier * 2 + 3;
    let current = initial;
    let multiplicator = 3;

    while (multiplicator != limit) {
        current += initial * multiplicator;
        multiplicator += 2;
    }

    return current;
}

function sortMap(upgradesMap) {
    let upgrades = Array.from(upgradesMap.values());
    upgrades = upgrades.filter(up => !up.isCompleted);

    upgrades.sort((a, b) => {
        return b.bestUpgrade - a.bestUpgrade;
    });

    return upgrades;
}

function sortMapByPrice(upgradesMap) {
    let upgrades = Array.from(upgradesMap.values());
    upgrades = upgrades.filter(up => !up.isCompleted);

    upgrades.sort((a, b) => {
        return a.price - b.price;
    });

    return upgrades;
}

module.exports = {getPrice, sortMap, sortMapByPrice};

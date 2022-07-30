const {getPrice} = require('./utils.js');

class Upgrade {
    constructor(data, id) {
        let upgrade = data.upgrades[id];

        this.name = upgrade.name;
        this.current = upgrade.current;
        this.max = upgrade.max;
        this.price = upgrade.price;
        this.boost = upgrade.boost;
        this.initial = upgrade.initial;
        
        this.load()
        this.id = id;
    }

    load() {
        this.bestUpgrade = this.boost/this.price;
        this.isCompleted = this.current == this.max;
    }

    setTiers(current, max) {
        this.current = current;
        this.max = max;
        this.price = getPrice(this.initial, this.current);

        this.load();
    }

    buy() {
        if (this.current == this.max) {
            return;
        }

        this.current++;

        this.price = getPrice(this.initial, this.current);
        this.load();
    }

    toJSON() {
        return {
            name: this.name,
            current: this.current,
            max: this.max,
            price: this.price,
            boost: this.boost,
            initial: this.initial
        };
    }
}

module.exports = Upgrade;

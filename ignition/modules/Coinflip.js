const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoinflipModule", (m) => {
    const coinflip = m.contract("Coinflip");

    return { coinflip };
});

const { assert, expect } = require("chai");

describe("Coinflip contract", () => {
    let coinflip;

    beforeEach(async () => {
        coinflip = await ethers.deployContract("Coinflip");
    });

    it("Sets the owner of contract correctly", async () => {
        const [deployer] = await ethers.getSigners();
        const owner = await coinflip.i_owner();
        assert.equal(deployer.address, owner);
    });

    describe("withdraw", async () => {
        it("Reverts if admin is not the one withdrawing", async () => {
            const [deployer, user] = await ethers.getSigners();
            await expect(coinflip.connect(user).withdraw()).to.be.reverted;
        });
        it("Transfers the contract balance to the owner", async () => {
            const [deployer] = await ethers.getSigners();
            let startingOwnerBalance = Number(await ethers.provider.getBalance(deployer.address));
            let startingContractBalance = Number(
                await ethers.provider.getBalance(coinflip.getAddress())
            );

            const tx = await coinflip.withdraw();
            const tr = await tx.wait(1);
            let { gasUsed, gasPrice } = tr;
            let gasCost = Number(gasUsed) * Number(gasPrice);

            let endingOwnerBalance = Number(await ethers.provider.getBalance(deployer.address));
            let endingContractBalance = Number(
                await ethers.provider.getBalance(coinflip.getAddress())
            );

            assert.equal(endingContractBalance, 0);

            assert.equal(
                parseInt((startingContractBalance + startingOwnerBalance) / 10000000),
                parseInt((endingOwnerBalance + gasCost) / 10000000)
            );
        });
    });
});

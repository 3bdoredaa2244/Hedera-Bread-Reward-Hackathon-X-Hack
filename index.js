const {
    createRewardToken,
    associateToken,
    rewardDonorAndBakery
} = require("./hederaService");

const { AccountId, PrivateKey, Status } = require("@hashgraph/sdk");
require("dotenv").config();

// Replace these keys with your actual donor and bakery private keys
const donorKey = PrivateKey.fromString("302e020100300506032b6570042204202ae2041134a44746116b6d32f5880256bcb1836a99f0742c377b321561012ea3");
const bakeryKey = PrivateKey.fromString("302e020100300506032b657004220420d0423cf748cca1774582529055b202db65e0578f954dcea7d8cccc12b6b5006a");
const donorId = AccountId.fromString(process.env.DONOR_ID);
const bakeryId = AccountId.fromString(process.env.BAKERY_ID);

(async () => {
    try {
        // Step 1: Create the token (run once)
        const tokenId = await createRewardToken();

        // Step 2: Associate token with donor (skip if already associated)
        try {
            await associateToken(donorId, donorKey, tokenId);
        } catch (err) {
            if (err.status && err.status._code === Status.TokenAlreadyAssociatedToAccount._code) {
                console.log(`ℹ️ Donor ${donorId.toString()} already associated with token`);
            } else {
                throw err;
            }
        }

        // Step 2: Associate token with bakery (skip if already associated)
        try {
            await associateToken(bakeryId, bakeryKey, tokenId);
        } catch (err) {
            if (err.status && err.status._code === Status.TokenAlreadyAssociatedToAccount._code) {
                console.log(`ℹ️ Bakery ${bakeryId.toString()} already associated with token`);
            } else {
                throw err;
            }
        }

        // Step 3: Distribute rewards
        await rewardDonorAndBakery(tokenId, 10);

        console.log("🎉 All done!");
    } catch (error) {
        console.error("❌ Error:", error);
    }
})();

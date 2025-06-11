require("dotenv").config();
const {
    Client,
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TransferTransaction,
    TokenAssociateTransaction
} = require("@hashgraph/sdk");

// Load environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const donorId = AccountId.fromString(process.env.DONOR_ID);
const bakeryId = AccountId.fromString(process.env.BAKERY_ID);

// Set up client for Hedera Testnet
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Create a fungible token
async function createRewardToken() {
    const tx = await new TokenCreateTransaction()
        .setTokenName("BreadReward")
        .setTokenSymbol("BRD")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(1000)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Infinite)
        .freezeWith(client);

    const signed = await tx.sign(operatorKey);
    const response = await signed.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("✅ Token Created:", receipt.tokenId.toString());
    return receipt.tokenId.toString();
}

// Associate token with user account (run once per account)
async function associateToken(userId, userKey, tokenId) {
    const tx = await new TokenAssociateTransaction()
        .setAccountId(userId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(userKey);

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log(`✅ Token associated with ${userId}:`, receipt.status.toString());
}

// Transfer tokens split between donor and bakery
async function rewardDonorAndBakery(tokenId, amount = 10) {
    const half = Math.floor(amount / 2);

    const tx = await new TransferTransaction()
        .addTokenTransfer(tokenId, operatorId, -amount)
        .addTokenTransfer(tokenId, donorId, half)
        .addTokenTransfer(tokenId, bakeryId, half)
        .freezeWith(client);

    const signed = await tx.sign(operatorKey);
    const response = await signed.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("✅ Reward Distributed:", receipt.status.toString());
}

module.exports = {
    createRewardToken,
    associateToken,
    rewardDonorAndBakery
};

import { expect, test } from "vitest";
import { Effect } from "effect";
import { LucidContext, makeBlockfrostContext, makeEmulatorContext } from "./service/lucidContext.js";
import { Address, Credential, applyParamsToScript, deploySyngentaOracle, MintingPolicy, paymentCredentialOf, PolicyId, SpendingValidator, UTxO, WithdrawalValidator, Validator, mintingPolicyToId, unixTimeToSlot, scriptFromNative, Constr, validatorToScriptHash, fromText, Assets, toUnit, Unit, validatorToAddress, validatorToRewardAddress, utxosAtAddressWithPolicyId, UTxOSelectionCriteria, ScriptHash, deployRefscripts, DeploySyngentaOracleResult, DeploySyngentaOracleConfig, SyngentaOracleData, Data, generateSeedPhrase, generateAccountSeedPhrase, getSignedOracleMessage } from "../src/index.js";
import { alwaysFailsBytes, syngentaOracleMintingBytes, syngentaOracleSpendingBytes } from "./common/constants.js";

test<LucidContext>("Test 10 - Deploy Syngenta Oracle", async () => {
    const  { lucid, users, emulator } = await Effect.runPromise(makeBlockfrostContext("Preprod"));
    lucid.selectWallet.fromSeed(users.operatorAccount1.seedPhrase);
    const operatorAccount1Address: Address = await lucid.wallet().address();
    console.log("Operator Account 1 Address: " + operatorAccount1Address);
    const operatorAccountUTxOs = await lucid.wallet().getUtxos();
    const initSyngentaOracleUTxO : UTxO = operatorAccountUTxOs[0];
    const network = lucid.config().network;
    const syngentaOracleData : SyngentaOracleData = {
        farmerId: "1234567890",
        farmId: "1234567890",
        aeId: "1234567890",
        sustainabilityIndex: 100,
        additionalData: Data.void(),
        farmArea: 100,
        farmBorders: "1234567890",
    }

    const paramConfig : DeploySyngentaOracleConfig = {
        initSyngentaOracleUTxO: initSyngentaOracleUTxO,
        syngentaOracleData: syngentaOracleData,
        scripts: {
            syngentaOracleMinting: syngentaOracleMintingBytes,
            syngentaOracleSpending: syngentaOracleSpendingBytes,
            alwaysFails: alwaysFailsBytes
        }
    }
    const deploySyngentaOracleProgram = Effect.gen(function* ($) {
        const paramResult : DeploySyngentaOracleResult = yield* deploySyngentaOracle(lucid, paramConfig);
        const paramTx = paramResult.tx;
        const paramTxSigned = yield* Effect.promise(() =>
            paramTx.sign.withWallet().complete()
        );
        const paramTxHash = yield* Effect.promise(() =>
            paramTxSigned.submit()
        );
        if (emulator) {
            yield* Effect.promise(() =>
                emulator.awaitTx(paramTxHash)
            );
        } else {
            yield* Effect.promise(() =>
                lucid.awaitTx(paramTxHash)
            );
        }
        console.log("Deployed syngenta oracle with tx hash: " + paramTxHash);
        const result = paramResult;
        return result;
    });
    const oracleResult = await Effect.runPromise(deploySyngentaOracleProgram);
  
    const operator1Cred : Credential = paymentCredentialOf(operatorAccount1Address);
    const operator1CredHash = operator1Cred.hash;
    const oraclePolicyId : PolicyId = oracleResult.syngentaOraclePolicyId;
    const syngentaOracleSpending : SpendingValidator = oracleResult.scripts.syngentaOracleSpending;
    const syngentaOracleSpendingHash : ScriptHash = validatorToScriptHash(syngentaOracleSpending)
    const syngentaOracleSpendingCred = new Constr(1, [syngentaOracleSpendingHash]);
    const syngentaOracleMinting : MintingPolicy = oracleResult.scripts.syngentaOracleMinting;
    const syngentaOracleSpend : SpendingValidator = {
            type: "PlutusV3",
            script: applyParamsToScript(syngentaOracleSpendingBytes, [oraclePolicyId])
    } 
    expect(syngentaOracleSpend).toBeDefined();
});

test<LucidContext>("Test 10 - Deploy Syngenta Oracle", async () => {
    const  { lucid, users } = await Effect.runPromise(makeEmulatorContext());
    lucid.selectWallet.fromSeed(users.operatorAccount1.seedPhrase);
    const syngentaOracleData : SyngentaOracleData = {
        farmerId: "1234567890",
        farmId: "1234567890",
        aeId: "1234567890",
        sustainabilityIndex: 100,
        additionalData: Data.void(),
        farmArea: 100,
        farmBorders: "1234567890",
    }
    const signedOracleMessage = await Effect.runPromise(getSignedOracleMessage(lucid, syngentaOracleData));
    console.log("Signed Oracle Message: " + signedOracleMessage);
});

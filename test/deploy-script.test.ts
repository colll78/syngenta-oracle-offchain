import { expect, test } from "vitest";
import { Effect } from "effect";
import { LucidContext, makeBlockfrostContext, makeEmulatorContext } from "./service/lucidContext.js";
import { Address, Credential, applyParamsToScript, deploySyngentaOracle, updateSyngentaOracle, MintingPolicy, paymentCredentialOf, PolicyId, SpendingValidator, UTxO, Constr, validatorToScriptHash, ScriptHash, DeploySyngentaOracleResult, DeploySyngentaOracleConfig, SyngentaOracleData, Data, getSignedOracleMessage, SyngentaOracleSignature, BatchDeploySyngentaOracleResult, batchDeploySyngentaOracle, BatchDeploySyngentaOracleConfig, fromText } from "../src/index.js";
import { alwaysFailsBytes, syngentaOracleMintingBytes, syngentaOracleSpendingBytes } from "./common/constants.js";

/*
Test 1 - Deploy Syngenta Oracle
- Deploy a new Syngenta Oracle feed with initial data.
*/
test<LucidContext>("Test 1 - Deploy Syngenta Oracle", async () => {
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
        syngentaOracleData: syngentaOracleData,
        scripts: {
            syngentaOracleMinting: syngentaOracleMintingBytes,
            syngentaOracleSpending: syngentaOracleSpendingBytes,
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

/*
Test 2 - Get Signed Oracle Message
- Sign an oracle data payload with the Syngenta Oracle credential. 
- Return the signed oracle data payload which can be consumed by smart contracts to read the certified oracle data.
*/
test<LucidContext>("Test 2 - Get Signed Oracle Message", async () => {
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
    const signedOracleMessage : SyngentaOracleSignature = await Effect.runPromise(getSignedOracleMessage(lucid, syngentaOracleData));
    console.log("Signed Oracle Message: " + signedOracleMessage.signedOracleMessage.signature);
});

/*
Test 3 - Update Syngenta Oracle (Emulator)
- Update an existing Syngenta Oracle feed with new data.
*/
test<LucidContext>("Test 3 - Update Syngenta Oracle (Emulator)", async () => {
    const  { lucid, users, emulator } = await Effect.runPromise(makeEmulatorContext());
    lucid.selectWallet.fromSeed(users.operatorAccount1.seedPhrase);

    // Prepare initial oracle data
    const initialData : SyngentaOracleData = {
        farmerId: "1234567890",
        farmId: "1234567890",
        aeId: "1234567890",
        sustainabilityIndex: 100,
        additionalData: Data.void(),
        farmArea: 100,
        farmBorders: "1234567890",
    };

    // Use an existing wallet UTxO to bootstrap deployment
    const operatorAccountUTxOs = await lucid.wallet().getUtxos();
    const initSyngentaOracleUTxO : UTxO = operatorAccountUTxOs[0];

    // Deploy the oracle in the emulator first
    const deployConfig : DeploySyngentaOracleConfig = {
        syngentaOracleData: initialData,
        scripts: {
            syngentaOracleMinting: syngentaOracleMintingBytes,
            syngentaOracleSpending: syngentaOracleSpendingBytes,
        }
    };

    const deployProgram = Effect.gen(function* ($) {
        const res : DeploySyngentaOracleResult = yield* deploySyngentaOracle(lucid, deployConfig);
        const tx = res.tx;
        const txSigned = yield* Effect.promise(() =>
            tx.sign.withWallet().complete()
        );
        const txHash = yield* Effect.promise(() =>
            txSigned.submit()
        );
        if (emulator) {
            yield* Effect.promise(() =>
                emulator.awaitTx(txHash)
            );
        } else {
            yield* Effect.promise(() =>
                lucid.awaitTx(txHash)
            );
        }
        return res;
    });

    const deployed = await Effect.runPromise(deployProgram);

    // Prepare new oracle data for update
    const newData : SyngentaOracleData = {
        farmerId: "1234567890",
        farmId: "1234567890",
        aeId: "1234567890",
        sustainabilityIndex: 90,
        additionalData: Data.void(),
        farmArea: 110,
        farmBorders: "0987654321",
    };

    // Perform update
    const updateProgram = Effect.gen(function* ($) {
        const updateRes = yield* updateSyngentaOracle(lucid, {
            farmIdToUpdate: "1234567890",
            newSyngentaOracleData: newData,
            scripts: {
                syngentaOracleMinting: deployed.scripts.syngentaOracleMinting,
                syngentaOracleSpending: deployed.scripts.syngentaOracleSpending as unknown as SpendingValidator,
            }
        } as any);

        const upTx = updateRes.tx;
        const upTxSigned = yield* Effect.promise(() =>
            upTx.sign.withWallet().complete()
        );
        const upTxHash = yield* Effect.promise(() =>
            upTxSigned.submit()
        );
        if (emulator) {
            yield* Effect.promise(() =>
                emulator.awaitTx(upTxHash)
            );
        } else {
            yield* Effect.promise(() =>
                lucid.awaitTx(upTxHash)
            );
        }
        return updateRes;
    });

    const updated = await Effect.runPromise(updateProgram);
    expect(updated.tx).toBeDefined();
});

/*
Test 4 - Batch Deploy Syngenta Oracle
- Deploy multiple Syngenta Oracle feeds in a single transaction.
- Each oracle gets a unique NFT based on its farmId.
*/
test<LucidContext>("Test 4 - Batch Deploy Syngenta Oracle", async () => {
    const  { lucid, users, emulator } = await Effect.runPromise(makeEmulatorContext());
    lucid.selectWallet.fromSeed(users.operatorAccount1.seedPhrase);
    const operatorAccount1Address: Address = await lucid.wallet().address();
    console.log("Operator Account 1 Address: " + operatorAccount1Address);

    // Prepare 50 oracle data entries
    const batchSyngentaOracleData: SyngentaOracleData[] = Array.from({ length: 50 }, (_, index) => ({
        farmerId: fromText(`farmer${String(index + 1)}`),
        farmId: fromText(`farm${String(index + 1)}`),
        aeId: fromText(`ae${String(index + 1)}`),
        sustainabilityIndex: 95,
        additionalData: Data.void(),
        farmArea: 150,
        farmBorders: fromText(`borders${String(index + 1)}`),
    }));

    const batchConfig: BatchDeploySyngentaOracleConfig = {
        batchSyngentaOracleData: batchSyngentaOracleData,
        scripts: {
            syngentaOracleMinting: syngentaOracleMintingBytes,
            syngentaOracleSpending: syngentaOracleSpendingBytes,
        }
    };

    const batchDeployProgram = Effect.gen(function* ($) {
        const batchResult: BatchDeploySyngentaOracleResult = yield* batchDeploySyngentaOracle(lucid, batchConfig);
        const batchTx = batchResult.tx;
        const batchTxSigned = yield* Effect.promise(() =>
            batchTx.sign.withWallet().complete()
        );
        const batchTxHash = yield* Effect.promise(() =>
            batchTxSigned.submit()
        );
        if (emulator) {
            yield* Effect.promise(() =>
                emulator.awaitTx(batchTxHash)
            );
        } else {
            yield* Effect.promise(() =>
                lucid.awaitTx(batchTxHash)
            );
        }
        console.log("Batch deployed syngenta oracles with tx hash: " + batchTxHash);
        return batchResult;
    });

    const batchResult = await Effect.runPromise(batchDeployProgram);
    expect(batchResult).toBeDefined();
    console.log(`Successfully batch deployed ${batchSyngentaOracleData.length} syngenta oracles`);
});

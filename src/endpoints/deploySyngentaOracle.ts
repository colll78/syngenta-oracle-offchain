import {
  Address,
  applyParamsToScript,
  Assets,
  Constr,
  Data,
  getAddressDetails,
  LucidEvolution,
  MintingPolicy,
  mintingPolicyToId,
  PolicyId,
  RedeemerBuilder,
  SignedMessage,
  SpendingValidator,
  toUnit,
  TransactionError,
  TxSignBuilder,
  validatorToAddress,
  validatorToScriptHash,
  WithdrawalValidator,
  fromText,
} from "@lucid-evolution/lucid";
import { DeploySyngentaOracleConfig, DeploySyngentaOracleResult, SyngentaOracleData, SyngentaOracleSignature, UpdateSyngentaOracleConfig, UpdateSyngentaOracleResult } from "../core/index.js";
import { Effect } from "effect";


export const getSignedOracleMessage = (lucid: LucidEvolution, config: SyngentaOracleData): Effect.Effect<SyngentaOracleSignature, never> => 
  Effect.gen(function* () {
    const userAddress: Address = yield* Effect.promise(() =>
      lucid.wallet().address()
    );
     
    const {farmerId, farmId, aeId, farmArea, farmBorders, sustainabilityIndex, additionalData} : SyngentaOracleData = config;
    const syngentaOracleDatum = [farmerId, farmId, aeId, BigInt(farmArea), farmBorders, BigInt(sustainabilityIndex), additionalData]
    const paramDatum = Data.to<Data>(syngentaOracleDatum)

    const signedOracleMessage: SignedMessage = yield* Effect.promise(() =>
      lucid.wallet().signMessage(userAddress, paramDatum)
    );
    
    const syngentaOracleSignature: SyngentaOracleSignature = {
      data: config,
      signedOracleMessage: signedOracleMessage
    }

    return syngentaOracleSignature;
  })

export const deploySyngentaOracle = (
  lucid: LucidEvolution,
  config: DeploySyngentaOracleConfig,
): Effect.Effect<DeploySyngentaOracleResult, TransactionError, never> =>
  Effect.gen(function* () { // return type ,
    const network = lucid.config().network;
    const userAddress: Address = yield* Effect.promise(() =>
      lucid.wallet().address()
    );

    const { paymentCredential } = getAddressDetails(userAddress);
    if (!paymentCredential) {
        throw new Error("Payment credential is undefined");
    }
    
    const syngentaOracleScript = applyParamsToScript(config.scripts.syngentaOracleMinting, [paymentCredential.hash])

    const syngentaOracleMinting: MintingPolicy = {
      type: "PlutusV3",
      script: syngentaOracleScript,
    };
    const syngentaOraclePolicyId = mintingPolicyToId(syngentaOracleMinting);
   
    const syngentaOracleSpending : SpendingValidator = {
      type: "PlutusV3",
      script: syngentaOracleScript
    }
    const syngentaOracleSpendingAddr = validatorToAddress(network!, syngentaOracleSpending)

    // Syngenta Oracle Datum structure:
    // data SyngentaOracleData = SyngentaOracleData
    //   { farmerId           :: BuiltinByteString
    //   , farmId             :: BuiltinByteString
    //   , aeId               :: BuiltinByteString
    //   , farmArea           :: Integer            -- fixed‑point (e.g., area * 10^2)
    //   , farmBorders        :: BuiltinByteString  -- IPFS hash
    //   , sustainabilityIndex:: Integer            -- 0..100
    //   , additionalData     :: BuiltinData        -- BuiltinData blob
    //   }
    const {farmerId, farmId, aeId, farmArea, farmBorders, sustainabilityIndex, additionalData} : SyngentaOracleData = config.syngentaOracleData;
    const syngentaOracleDatum = [farmerId, farmId, aeId, BigInt(farmArea), farmBorders, BigInt(sustainabilityIndex), additionalData]
    const scripts = { 
      syngentaOracleMinting: syngentaOracleMinting,
      syngentaOracleSpending: syngentaOracleSpending
    }

    const paramDatum = Data.to<Data>(syngentaOracleDatum)
    const syngentaOracleNFT = toUnit(syngentaOraclePolicyId, fromText(farmId))

    const mintedAssets : Assets = { [syngentaOracleNFT]: 1n }
    
    const tx = yield* lucid
      .newTx()
      .pay.ToContract(syngentaOracleSpendingAddr, {
        kind: "inline",
        value: paramDatum,
      }, {
        [syngentaOracleNFT]: 1n,
      })
      .mintAssets(mintedAssets, Data.void())
      .attach.MintingPolicy(syngentaOracleMinting)
      .addSignerKey(paymentCredential.hash)
      .completeProgram();
      //.completeProgram({localUPLCEval: false});
    
    return {tx: tx, syngentaOraclePolicyId: syngentaOraclePolicyId, scripts};
  });


  export const updateSyngentaOracle = (
    lucid: LucidEvolution,
    config: UpdateSyngentaOracleConfig,
  ): Effect.Effect<UpdateSyngentaOracleResult, TransactionError, never> =>
    Effect.gen(function* () { // return type ,
      const network = lucid.config().network;
      const userAddress: Address = yield* Effect.promise(() =>
        lucid.wallet().address()
      );
  
      const { paymentCredential } = getAddressDetails(userAddress);
      if (!paymentCredential) {
          throw new Error("Payment credential is undefined");
      }
        
      const syngentaOraclePolicyId : PolicyId = mintingPolicyToId(config.scripts.syngentaOracleMinting);
  
      const syngentaOracleNFT = toUnit(syngentaOraclePolicyId, fromText(config.farmIdToUpdate))
     
      const syngentaOracleSpending : SpendingValidator = config.scripts.syngentaOracleSpending
      
      const syngentaOracleSpendingAddr = validatorToAddress(network!, syngentaOracleSpending)

      const [oracleUTxO, ...rest] = yield* Effect.promise(() => lucid.utxosAtWithUnit(syngentaOracleSpendingAddr, syngentaOracleNFT))
      // data SyngentaOracleData = SyngentaOracleData
      //   { farmerId           :: BuiltinByteString
      //   , farmId             :: BuiltinByteString
      //   , aeId               :: BuiltinByteString
      //   , farmArea           :: Integer            -- fixed‑point (e.g., area * 10^2)
      //   , farmBorders        :: BuiltinByteString  -- IPFS hash
      //   , sustainabilityIndex:: Integer            -- 0..100
      //   , additionalData     :: BuiltinData        -- BuiltinData blob
      //   }
      const {farmerId, farmId, aeId, farmArea, farmBorders, sustainabilityIndex, additionalData} : SyngentaOracleData = config.newSyngentaOracleData;
      const syngentaOracleDatum = [farmerId, farmId, aeId, BigInt(farmArea), farmBorders, BigInt(sustainabilityIndex), additionalData]
  
      const paramDatum = Data.to<Data>(syngentaOracleDatum)
      
      const tx = yield* lucid
        .newTx()
        .collectFrom([oracleUTxO], Data.void())
        .pay.ToContract(syngentaOracleSpendingAddr, {
          kind: "inline",
          value: paramDatum,
        }, {
          [syngentaOracleNFT]: 1n,
        })
        .addSignerKey(paymentCredential.hash)
        .attach.SpendingValidator(config.scripts.syngentaOracleSpending)
        .completeProgram();
        //.completeProgram({localUPLCEval: false});
      
      return {tx: tx};
    });

    
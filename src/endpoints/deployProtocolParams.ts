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
  RedeemerBuilder,
  SignedMessage,
  SpendingValidator,
  toUnit,
  TransactionError,
  TxSignBuilder,
  validatorToAddress,
  validatorToScriptHash,
  WithdrawalValidator,
} from "@lucid-evolution/lucid";
import { DeploySyngentaOracleConfig, PROTOCOL_PARAMS_TOKEN_NAME, DeploySyngentaOracleResult, ProtocolParametersDatum, SyngentaOracleData, SyngentaOracleSignature } from "../core/index.js";
import { Effect } from "effect";


export const getSignedOracleMessage = (lucid: LucidEvolution, config: SyngentaOracleData): Effect.Effect<SyngentaOracleSignature, never> => 
  Effect.gen(function* () {
    const userAddress: Address = yield* Effect.promise(() =>
      lucid.wallet().address()
    );
     
    const {farmerId, farmId, aeId, farmArea, farmBorders, sustainabilityIndex, additionalData} : SyngentaOracleData = config;
    const protocolParametersDatum = [farmerId, farmId, aeId, BigInt(farmArea), farmBorders, BigInt(sustainabilityIndex), additionalData]
    const paramDatum = Data.to<Data>(protocolParametersDatum)

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
    
    const initProtocolParamsOutRef = new Constr(0, [String(config.initSyngentaOracleUTxO.txHash), BigInt(config.initSyngentaOracleUTxO.outputIndex)]);

    const protocolParamsScript = applyParamsToScript(config.scripts.syngentaOracleMinting, [initProtocolParamsOutRef])

    const protocolParametersMinting: MintingPolicy = {
      type: "PlutusV3",
      script: protocolParamsScript,
    };
    const protocolParamsPolicyId = mintingPolicyToId(protocolParametersMinting);

    const alwaysFails: SpendingValidator = {
      type: "PlutusV3",
      script: applyParamsToScript(config.scripts.alwaysFails, [55n]),
    };

    const alwaysFailsAddr = validatorToAddress(
      network!,
      alwaysFails,
    );

    const protocolParamsNFT = toUnit(protocolParamsPolicyId, PROTOCOL_PARAMS_TOKEN_NAME)
    //console.log("protocolParamsNFT: " + protocolParamsNFT)
   
    const protocolParamsSpending : SpendingValidator = {
      type: "PlutusV3",
      script: protocolParamsScript
    }
    const protocolParamsSpendingAddr = validatorToAddress(network!, protocolParamsSpending)
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
    const protocolParametersDatum = [farmerId, farmId, aeId, BigInt(farmArea), farmBorders, BigInt(sustainabilityIndex), additionalData]
    const scripts = { 
      syngentaOracleMinting: protocolParametersMinting,
      syngentaOracleSpending: protocolParamsSpending
    }

    const paramDatum = Data.to<Data>(protocolParametersDatum)
    const mintedAssets : Assets = { [protocolParamsNFT]: 1n }
    
    const tx = yield* lucid
      .newTx()
      .collectFrom([config.initSyngentaOracleUTxO])
      .pay.ToContract(protocolParamsSpendingAddr, {
        kind: "inline",
        value: paramDatum,
      }, {
        [protocolParamsNFT]: 1n,
      })
      .mintAssets(mintedAssets, Data.void())
      .attach.MintingPolicy(protocolParametersMinting)
      .completeProgram();
      //.completeProgram({localUPLCEval: false});
    
    return {tx: tx, syngentaOraclePolicyId: protocolParamsPolicyId, scripts};
  });

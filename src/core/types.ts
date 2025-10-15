import {
  Address,
  Assets,
  Credential,
  MintingPolicy,
  OutRef,
  PolicyId,
  Redeemer,
  Script,
  ScriptHash,
  SpendingValidator,
  TxSignBuilder,
  Unit,
  UTxO,
  Validator,
  WithdrawalValidator,
  Data,
  SignedMessage, 
} from "@lucid-evolution/lucid";

// data SyngentaOracleData = SyngentaOracleData
//   { farmerId           :: BuiltinByteString
//   , farmId             :: BuiltinByteString
//   , aeId               :: BuiltinByteString
//   , farmArea           :: Integer            -- fixed‑point (e.g., area * 10^2)
//   , farmBorders        :: BuiltinByteString  -- IPFS hash
//   , sustainabilityIndex:: Integer            
//   , additionalData     :: BuiltinData        -- BuiltinData
//   }

export type SyngentaOracleData = {
  farmerId: string;
  farmId: string;
  aeId: string;
  farmArea: number;
  farmBorders: string;
  sustainabilityIndex: number;
  additionalData: Data;
}

export type SyngentaOracleSignature = {
  data: SyngentaOracleData; 
  signedOracleMessage: SignedMessage; 
};

export type CborHex = string;
export type RawHex = string;
export type POSIXTime = number;

export type Result<T> =
  | { type: "ok"; data: T }
  | { type: "error"; error: Error };

export type Either<L, R> =
  | { type: "left"; value: L }
  | { type: "right"; value: R };

export type ReadableUTxO<T> = {
  outRef: OutRef;
  datum: T;
  assets: Assets;
};

export type Deploy = {
  tx: TxSignBuilder;
  syngentaOraclePolicyId: string;
};

export type DeploySyngentaOracleConfig = {
  syngentaOracleData: SyngentaOracleData;
  scripts: {
    syngentaOracleMinting : CborHex;
    syngentaOracleSpending: CborHex;
    alwaysFails: CborHex;
  }
};

export type BatchDeploySyngentaOracleConfig = {
  syngentaOracleData: SyngentaOracleData;
  scripts: {
    syngentaOracleMinting : CborHex;
    syngentaOracleSpending: CborHex;
    alwaysFails: CborHex;
  }
};



export type DeploySyngentaOracleResult = {
  tx: TxSignBuilder;
  syngentaOraclePolicyId: PolicyId;
  scripts: {
    syngentaOracleMinting : MintingPolicy;
    syngentaOracleSpending: WithdrawalValidator;
  }
};

export type UpdateSyngentaOracleConfig = {
  farmIdToUpdate: string;
  newSyngentaOracleData: SyngentaOracleData;
  scripts: {
    syngentaOracleMinting : MintingPolicy;
    syngentaOracleSpending: SpendingValidator;
  }
};

export type UpdateSyngentaOracleResult = {
  tx: TxSignBuilder;
};

type RedeemerBuilderGeneral = {
  makeRedeemer: (inputIndices?: bigint[], referenceInputIndices?: bigint[], outputIndices?: bigint[], redeemerIndices?: bigint[], withdrawalIndices?: bigint[]) => Redeemer;
  inputs?: UTxO[];
  referenceInputs?: UTxO[];
  outputs?: UTxO[]; 
  redeemers? : Redeemer[];
  withdrawals?: ScriptHash[];
} 

export type UTxOSelectionCriteria = (utxo: UTxO) => boolean;

export type MultiValidator = {
  spendValidator: SpendingValidator;
  spendValAddress: Address;
  mintValidator: MintingPolicy;
  mintValAddress: Address;
};
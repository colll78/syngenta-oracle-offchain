import * as _lucid_evolution_lucid from '@lucid-evolution/lucid';
import { Data, Credential, Constr, ScriptHash, KeyHash, SignedMessage, OutRef, Assets, TxSignBuilder, UTxO, PolicyId, MintingPolicy, WithdrawalValidator, SpendingValidator, Address, LucidEvolution, Network, Unit, Redeemer, TransactionError } from '@lucid-evolution/lucid';
export * from '@lucid-evolution/lucid';
import { Effect } from 'effect';

declare const OutputReferenceSchema: _lucid_evolution_lucid.TObject<{
    txHash: _lucid_evolution_lucid.TUnsafe<string>;
    outputIndex: _lucid_evolution_lucid.TUnsafe<bigint>;
}>;
type OutputReference = Data.Static<typeof OutputReferenceSchema>;
declare const OutputReference: OutputReference;
declare const CredentialSchema: _lucid_evolution_lucid.TUnion<(_lucid_evolution_lucid.TObject<{
    PublicKeyCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}> | _lucid_evolution_lucid.TObject<{
    ScriptCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}>)[]>;
type CredentialD = Data.Static<typeof CredentialSchema>;
declare const CredentialD: CredentialD;
declare const AddressSchema: _lucid_evolution_lucid.TObject<{
    paymentCredential: _lucid_evolution_lucid.TUnion<(_lucid_evolution_lucid.TObject<{
        PublicKeyCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
    }> | _lucid_evolution_lucid.TObject<{
        ScriptCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
    }>)[]>;
    stakeCredential: _lucid_evolution_lucid.TUnsafe<{
        Inline: [{
            PublicKeyCredential: [string];
        } | {
            ScriptCredential: [string];
        }];
    } | {
        Pointer: [{
            slotNumber: bigint;
            transactionIndex: bigint;
            certificateIndex: bigint;
        }];
    } | null>;
}>;
type AddressD = Data.Static<typeof AddressSchema>;
declare const AddressD: AddressD;
declare const AssetClassSchema: _lucid_evolution_lucid.TObject<{
    policyId: _lucid_evolution_lucid.TUnsafe<string>;
    assetName: _lucid_evolution_lucid.TUnsafe<string>;
}>;
type AssetClassD = Data.Static<typeof AssetClassSchema>;
declare const AssetClassD: AssetClassD;
declare const ValueSchema: _lucid_evolution_lucid.TUnsafe<Map<string, Map<string, bigint>>>;
type Value = Data.Static<typeof ValueSchema>;
declare const Value: Value;
declare const DirectoryNodeDatumSchema: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>, _lucid_evolution_lucid.TUnsafe<string>, _lucid_evolution_lucid.TUnion<(_lucid_evolution_lucid.TObject<{
    PublicKeyCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}> | _lucid_evolution_lucid.TObject<{
    ScriptCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}>)[]>, _lucid_evolution_lucid.TUnion<(_lucid_evolution_lucid.TObject<{
    PublicKeyCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}> | _lucid_evolution_lucid.TObject<{
    ScriptCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
}>)[]>]>;
type DirectoryNodeDatum = Data.Static<typeof DirectoryNodeDatumSchema>;
declare const DirectoryNodeDatum: DirectoryNodeDatum;
declare const ProtocolParametersDatumSchema: _lucid_evolution_lucid.TObject<{
    directoryNodeCS: _lucid_evolution_lucid.TUnsafe<string>;
    progLogicCred: _lucid_evolution_lucid.TUnion<(_lucid_evolution_lucid.TObject<{
        PublicKeyCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
    }> | _lucid_evolution_lucid.TObject<{
        ScriptCredential: _lucid_evolution_lucid.TTuple<[_lucid_evolution_lucid.TUnsafe<string>]>;
    }>)[]>;
}>;
type ProtocolParametersDatum = Data.Static<typeof ProtocolParametersDatumSchema>;
declare const ProtocolParametersDatum: ProtocolParametersDatum;
declare const toCredentialData: (cred: Credential) => Constr<string>;
declare const scriptHashToCredentialData: (scriptHash: ScriptHash) => Constr<string>;
declare const keyHashToCredentialData: (keyHash: KeyHash) => Constr<string>;

type SyngentaOracleData = {
    farmerId: string;
    farmId: string;
    aeId: string;
    farmArea: number;
    farmBorders: string;
    sustainabilityIndex: number;
    additionalData: Data;
};
type SyngentaOracleSignature = {
    data: SyngentaOracleData;
    signedOracleMessage: SignedMessage;
};
type CborHex = string;
type RawHex = string;
type POSIXTime = number;
type Result<T> = {
    type: "ok";
    data: T;
} | {
    type: "error";
    error: Error;
};
type Either<L, R> = {
    type: "left";
    value: L;
} | {
    type: "right";
    value: R;
};
type ReadableUTxO<T> = {
    outRef: OutRef;
    datum: T;
    assets: Assets;
};
type Deploy = {
    tx: TxSignBuilder;
    syngentaOraclePolicyId: string;
};
type DeploySyngentaOracleConfig = {
    initSyngentaOracleUTxO: UTxO;
    syngentaOracleData: SyngentaOracleData;
    scripts: {
        syngentaOracleMinting: CborHex;
        syngentaOracleSpending: CborHex;
        alwaysFails: CborHex;
    };
};
type DeploySyngentaOracleResult = {
    tx: TxSignBuilder;
    syngentaOraclePolicyId: PolicyId;
    scripts: {
        syngentaOracleMinting: MintingPolicy;
        syngentaOracleSpending: WithdrawalValidator;
    };
};
type UpdateSyngentaOracleConfig = {
    farmIdToUpdate: string;
    newSyngentaOracleData: SyngentaOracleData;
    scripts: {
        syngentaOracleMinting: MintingPolicy;
        syngentaOracleSpending: SpendingValidator;
    };
};
type UpdateSyngentaOracleResult = {
    tx: TxSignBuilder;
};
type UTxOSelectionCriteria = (utxo: UTxO) => boolean;
type MultiValidator = {
    spendValidator: SpendingValidator;
    spendValAddress: Address;
    mintValidator: MintingPolicy;
    mintValAddress: Address;
};

declare const ONE_HOUR_MS = 3600000;
declare const ONE_YEAR_MS = 31557600000;
declare const TWO_YEARS_MS: number;
declare const TWENTY_FOUR_HOURS_MS: number;
declare const PROTOCOL_FEE = 0.05;
declare const TIME_TOLERANCE_MS: number;
declare const PROTOCOL_PAYMENT_KEY = "014e9d57e1623f7eeef5d0a8d4e6734a562ba32cf910244cd74e1680";
declare const PROTOCOL_STAKE_KEY = "5e8aa3f089868eaadf188426f49db6566624844b6c5d529b38f3b8a7";
declare const ADA: {
    policyId: string;
    assetName: string;
};
declare const REF_SCRIPT_TOKEN_NAMES: {
    spendSyngentaOracle: string;
    mintSyngentaOracle: string;
};
declare const SYNGENTA_ORACLE_TOKEN_NAME: string;

declare const getMultiValidator: (lucid: LucidEvolution, scripts: {
    spending: CborHex;
    minting: CborHex;
    staking: CborHex;
}) => MultiValidator;

declare function ok<T>(x: T): Result<T>;
declare const utxosAtScript: (lucid: LucidEvolution, script: string, stakeCredentialHash?: string) => Promise<UTxO[]>;
declare const parseSafeDatum: <T>(datum: string | null | undefined, datumType: T) => Either<string, T>;
declare const parseUTxOsAtScript: <T>(lucid: LucidEvolution, script: string, datumType: T, stakeCredentialHash?: string) => Promise<ReadableUTxO<T>[]>;
declare const toCBORHex: (rawHex: string) => string;
declare const generateAccountSeedPhrase: (assets: Assets) => Promise<{
    seedPhrase: string;
    address: () => Promise<Address>;
    assets: Assets;
}>;
declare function fromAddress(address: Address): AddressD;
declare function toAddress(address: AddressD, network: Network): Address;
declare const fromAddressToData: (address: Address) => Result<Data>;
declare const chunkArray: <T>(array: T[], chunkSize: number) => T[][];
declare const replacer: (_key: unknown, value: unknown) => unknown;
declare const divCeil: (a: bigint, b: bigint) => bigint;
declare function union(a1: Assets, a2: Assets): Assets;
declare function fromAssets(assets: Assets): Value;
declare function toAssets(value: Value): Assets;
/**
 * Returns a list of UTxOs whose total assets are equal to or greater than the asset value provided
 * @param utxos list of available utxos
 * @param minAssets minimum total assets required
 */
declare function selectUtxos(utxos: UTxO[], minAssets: Assets): Result<UTxO[]>;
declare function getInputUtxoIndices(indexInputs: UTxO[], remainingInputs: UTxO[]): bigint[];
declare function sortByOutRefWithIndex(utxos: UTxO[]): UTxO[];
declare function sumUtxoAssets(utxos: UTxO[]): Assets;
declare function filterPolicyFromAssets(assets: Assets, policyId: PolicyId): Assets;
declare function filterForeignPoliciesFromAssets(assets: Assets, policyIds: PolicyId[]): Assets;
/** Remove the intersection of a & b asset quantities from a
 * @param a assets to be removed from
 * @param b assets to remove
 * For e.g.
 * a = {[x] : 5n, [y] : 10n}
 * b = {[x] : 3n, [y] : 15n, [z] : 4n}
 * remove(a, b) = {[x] : 2n}
 */
declare function removeAssets(a: Assets, b: Assets): Assets;
declare const mintingMetadataFromAsset: (assetId: Unit, projectId: string) => Promise<string>;
declare const utxosAtAddressWithPolicyId: (lucid: LucidEvolution, address: Address, policyId: PolicyId) => Promise<UTxO[]>;
declare const sortUtxosByOutRef: (utxos: UTxO[]) => UTxO[];
declare const makeFreezeRedeemer: (selectedRefIndices: bigint[]) => Redeemer;
interface MakeTransferRedeemerParams {
    referenceInputs: UTxO[];
    inputs?: UTxO[];
    outputs?: UTxO[];
    inputSelectionCriteria?: (input: UTxO) => boolean;
    refInputSelectionCriteria: (input: UTxO) => boolean;
    outputSelectionCriteria?: (output: UTxO) => boolean;
    makeRedeemer: (selectedRefIndices: bigint[], selectedInputIndices?: bigint[], selectedOutputIndices?: bigint[]) => Redeemer;
}
declare const makeTransferRedeemer: ({ referenceInputs, inputs, outputs, inputSelectionCriteria, refInputSelectionCriteria, outputSelectionCriteria, makeRedeemer, }: MakeTransferRedeemerParams) => Redeemer;

declare const getSignedOracleMessage: (lucid: LucidEvolution, config: SyngentaOracleData) => Effect.Effect<SyngentaOracleSignature, never>;
declare const deploySyngentaOracle: (lucid: LucidEvolution, config: DeploySyngentaOracleConfig) => Effect.Effect<DeploySyngentaOracleResult, TransactionError, never>;
declare const updateSyngentaOracle: (lucid: LucidEvolution, config: UpdateSyngentaOracleConfig) => Effect.Effect<UpdateSyngentaOracleResult, TransactionError, never>;

export { ADA, AddressD, AddressSchema, AssetClassD, AssetClassSchema, CborHex, CredentialD, CredentialSchema, Deploy, DeploySyngentaOracleConfig, DeploySyngentaOracleResult, DirectoryNodeDatum, DirectoryNodeDatumSchema, Either, MakeTransferRedeemerParams, MultiValidator, ONE_HOUR_MS, ONE_YEAR_MS, OutputReference, OutputReferenceSchema, POSIXTime, PROTOCOL_FEE, PROTOCOL_PAYMENT_KEY, PROTOCOL_STAKE_KEY, ProtocolParametersDatum, ProtocolParametersDatumSchema, REF_SCRIPT_TOKEN_NAMES, RawHex, ReadableUTxO, Result, SYNGENTA_ORACLE_TOKEN_NAME, SyngentaOracleData, SyngentaOracleSignature, TIME_TOLERANCE_MS, TWENTY_FOUR_HOURS_MS, TWO_YEARS_MS, UTxOSelectionCriteria, UpdateSyngentaOracleConfig, UpdateSyngentaOracleResult, Value, ValueSchema, chunkArray, deploySyngentaOracle, divCeil, filterForeignPoliciesFromAssets, filterPolicyFromAssets, fromAddress, fromAddressToData, fromAssets, generateAccountSeedPhrase, getInputUtxoIndices, getMultiValidator, getSignedOracleMessage, keyHashToCredentialData, makeFreezeRedeemer, makeTransferRedeemer, mintingMetadataFromAsset, ok, parseSafeDatum, parseUTxOsAtScript, removeAssets, replacer, scriptHashToCredentialData, selectUtxos, sortByOutRefWithIndex, sortUtxosByOutRef, sumUtxoAssets, toAddress, toAssets, toCBORHex, toCredentialData, union, updateSyngentaOracle, utxosAtAddressWithPolicyId, utxosAtScript };

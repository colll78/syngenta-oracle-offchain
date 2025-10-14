## Syngenta Oracle SDK

Utilities to sign oracle data and deploy the Syngenta Oracle protocol parameters using Lucid Evolution and Effect.

### Installation

```bash
pnpm add syngenta-oracle-offchain
```

Peer/runtime dependencies you likely need in your app:

```bash
pnpm add @lucid-evolution/lucid effect
```

### Exports

- `getSignedOracleMessage`
- `deploySyngentaOracle`
- `updateSyngentaOracle`

Import from the package root:

```ts
import { getSignedOracleMessage, deploySyngentaOracle, updateSyngentaOracle } from "syngenta-oracle-offchain";
```

### Types

Key types used by the API (importable from the package as well):

```ts
import type { SyngentaOracleData, SyngentaOracleSignature, DeploySyngentaOracleConfig, DeploySyngentaOracleResult, UpdateSyngentaOracleConfig, UpdateSyngentaOracleResult } from "syngenta-oracle-offchain";
```

- `SyngentaOracleData`:
  - `farmerId: string`
  - `farmId: string`
  - `aeId: string`
  - `farmArea: number`
  - `farmBorders: string`
  - `sustainabilityIndex: number`
  - `additionalData: Data`

- `SyngentaOracleSignature`:
  - `data: SyngentaOracleData`
  - `signedOracleMessage: { signature: string; key: string }`

- `DeploySyngentaOracleConfig`:
  - `initSyngentaOracleUTxO: UTxO`
  - `syngentaOracleData: SyngentaOracleData`
  - `scripts: { syngentaOracleMinting: string; syngentaOracleSpending: string; alwaysFails: string }` // CBOR hex

- `DeploySyngentaOracleResult`:
  - `tx: TxSignBuilder`
  - `syngentaOraclePolicyId: PolicyId`
  - `scripts: { syngentaOracleMinting: MintingPolicy; syngentaOracleSpending: WithdrawalValidator }`

- `UpdateSyngentaOracleConfig`:
  - `farmIdToUpdate: string`
  - `newSyngentaOracleData: SyngentaOracleData`
  - `scripts: { syngentaOracleMinting: MintingPolicy; syngentaOracleSpending: SpendingValidator }`

- `UpdateSyngentaOracleResult`:
  - `tx: TxSignBuilder`

### Lucid Evolution setup

You need a `LucidEvolution` instance configured with your provider and selected wallet.

```ts
import { Lucid, Blockfrost, type LucidEvolution } from "@lucid-evolution/lucid";

const lucid: LucidEvolution = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<BLOCKFROST_API_KEY>"),
  "Preprod"
);

// Connect a wallet (examples)
// lucid.selectWallet.fromAPI(window.cardano.nami);
// lucid.selectWallet.fromSeed("...seed mnemonic...");
```

### getSignedOracleMessage

Signs a canonical payload derived from `SyngentaOracleData` with the connected wallet.

Signature:

```ts
declare function getSignedOracleMessage(
  lucid: LucidEvolution,
  config: SyngentaOracleData
): Effect.Effect<SyngentaOracleSignature, never>;
```

Usage:

```ts
import { Effect } from "effect";
import { getSignedOracleMessage } from "syngenta-oracle-offchain";

const data = {
  farmerId: "farmer-123",
  farmId: "farm-456",
  aeId: "ae-789",
  farmArea: 12345,
  farmBorders: "ipfs://...",
  sustainabilityIndex: 88,
  additionalData: { int: 1n } // example BuiltinData
};

const program = getSignedOracleMessage(lucid, data);

const signature = await Effect.runPromise(program);
// signature: { data: SyngentaOracleData, signedOracleMessage: { signature, key } }
```

### deploySyngentaOracle

Builds a transaction that mints the protocol-parameters NFT and writes initial datum to the contract. Returns a `TxSignBuilder`, policy id, and scripts.

Signature:

```ts
declare function deploySyngentaOracle(
  lucid: LucidEvolution,
  config: DeploySyngentaOracleConfig
): Effect.Effect<DeploySyngentaOracleResult, TransactionError>;
```

Usage:

```ts
import { Data } from "@lucid-evolution/lucid";
import { Effect } from "effect";
import { deploySyngentaOracle } from "syngenta-oracle-offchain";

const config = {
  initSyngentaOracleUTxO: /* a UTxO containing the init funds */,
  syngentaOracleData: {
    farmerId: "farmer-123",
    farmId: "farm-456",
    aeId: "ae-789",
    farmArea: 12345,
    farmBorders: "ipfs://...",
    sustainabilityIndex: 88,
    additionalData: Data.void(),
  },
  scripts: {
    syngentaOracleMinting: "<cbor-hex>",
    syngentaOracleSpending: "<cbor-hex>",
    alwaysFails: "<cbor-hex>"
  }
} as const;

const effect = deploySyngentaOracle(lucid, config);
const { tx, syngentaOraclePolicyId, scripts } = await Effect.runPromise(effect);

// Sign and submit
const signed = await tx.sign.withWallet().completeProgram();
const txHash = await signed.submit();
```

### updateSyngentaOracle

Updates an existing Syngenta Oracle by collecting the current oracle UTxO and re-locking it with updated data. This function allows you to modify the oracle data for a specific farm.

Signature:

```ts
declare function updateSyngentaOracle(
  lucid: LucidEvolution,
  config: UpdateSyngentaOracleConfig
): Effect.Effect<UpdateSyngentaOracleResult, TransactionError>;
```

Usage:

```ts
import { Data } from "@lucid-evolution/lucid";
import { Effect } from "effect";
import { updateSyngentaOracle } from "syngenta-oracle-offchain";

const config = {
  farmIdToUpdate: "farm-456", // The farm ID to update
  newSyngentaOracleData: {
    farmerId: "farmer-123",
    farmId: "farm-456",
    aeId: "ae-789",
    farmArea: 15000, // Updated area
    farmBorders: "ipfs://...", // Updated borders
    sustainabilityIndex: 92, // Updated sustainability index
    additionalData: Data.void(),
  },
  scripts: {
    syngentaOracleMinting: deployedScripts.syngentaOracleMinting, // From deploySyngentaOracle result
    syngentaOracleSpending: deployedScripts.syngentaOracleSpending, // From deploySyngentaOracle result
  }
} as const;

const effect = updateSyngentaOracle(lucid, config);
const { tx } = await Effect.runPromise(effect);

// Sign and submit
const signed = await tx.sign.withWallet().completeProgram();
const txHash = await signed.submit();
```

### Build & Test (local)

```bash
pnpm run build
pnpm test
```

### Notes

- Both APIs are Effect programs; use `Effect.runPromise(...)` (or your preferred `Effect` runtime) to execute.
- Ensure your wallet is selected in `LucidEvolution` before calling these functions.

### Preprod Integration Tests:

Deploy oracle transaction ID: 
  246936866d55eabd1b8b42665a2dc27448e3847ad709279960c41fb36b9bda77
  https://preprod.cexplorer.io/tx/246936866d55eabd1b8b42665a2dc27448e3847ad709279960c41fb36b9bda77?tab=content
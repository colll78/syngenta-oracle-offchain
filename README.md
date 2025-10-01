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

Import from the package root:

```ts
import { getSignedOracleMessage, deploySyngentaOracle } from "syngenta-oracle-offchain";
```

### Types

Key types used by the API (importable from the package as well):

```ts
import type { SyngentaOracleData, SyngentaOracleSignature, DeploySyngentaOracleConfig, DeploySyngentaOra >

  cleResult } from "syngenta-oracle-offchain";
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

### Build & Test (local)

```bash
pnpm run build
pnpm test
```

### Notes

- Both APIs are Effect programs; use `Effect.runPromise(...)` (or your preferred `Effect` runtime) to execute.
- Ensure your wallet is selected in `LucidEvolution` before calling these functions.
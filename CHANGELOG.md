## Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning where applicable.

### Unreleased

- Added: `updateSyngentaOracle` endpoint to update an existing Syngenta Oracle feed.
  - Implementation lives in `src/endpoints/deploySyngentaOracle.ts` and is exported via `src/endpoints/index.ts` and `src/index.ts`.
  - Accepts `syngentaOracleData` and required scripts; builds a transaction that collects the current oracle UTxO and re-locks it with updated inline datum.
- Added: Emulator test for update flow in `test/deploy-script.test.ts` ("Test 3 - Update Syngenta Oracle (Emulator)").

- Added: `batchDeploySyngentaOracle` endpoint to deploy multiple oracle feeds for different farms in a single transaction. 
  - Implementation lives in `src/endpoints/deploySyngentaOracle.ts` and is exported via `src/endpoints/index.ts` and `src/index.ts`.
- Added: Emulator test for batch deployment flow in `test/deploy-script.test.ts` ("Test 4").


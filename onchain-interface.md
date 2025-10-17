# 🌾 Syngenta Oracle — On-Chain Interface for Data Consumers

This document describes how on-chain smart contracts can **consume and authenticate Syngenta Oracle data** either **signed messages** or **on-chain reference inputs**.

---

## 📘 Overview

In the **signed-message variant**, oracle data are not stored on-chain.  
Instead, the Syngenta Oracle service produces a **digital signature** over the serialized oracle data and delivers both the oracle data and the signature to the dApp that consumes it.

Consumer contracts can then verify authenticity directly inside a Plutus V3 validator using the built-ins:

- `serialiseData` – converts a `BuiltinData` structure into canonical CBOR bytes (the message that gets signed).
- `verifyEd25519Signature` checks that a signature corresponds to a message and an authorized public key.

This enables low-cost oracle consumption without depending on on-chain UTxOs, thus minimizing end-user transaction fees and maximizing potential throughput.

---

## 🧩 Data Structures

### `SyngentaOracleData`

Represents the oracle payload containing agricultural and sustainability metrics.

```haskell
import PlutusTx.IsData qualified as IsData

data SyngentaOracleData = SyngentaOracleData
  { farmerId            :: BuiltinByteString
  , farmId              :: BuiltinByteString
  , aeId                :: BuiltinByteString
  , farmArea            :: Integer
  , farmBorders         :: BuiltinByteString
  , sustainabilityIndex :: Integer
  , additionalData      :: BuiltinData
  }
IsData.makeIsDataAsList ''SyngentaOracleData
```

### `SyngentaOracleSignatureRedeemer`

Carries both the oracle data and its Ed25519 signature.

```haskell
data SyngentaOracleSignatureRedeemer = SyngentaOracleSignatureRedeemer
  { oracleData :: SyngentaOracleData
  , signature  :: BuiltinByteString
  }
IsData.makeIsDataAsList ''SyngentaOracleSignatureRedeemer
```

## 🏗 Example Signed Oracle Data Variant Validator

The following Plutus V3 validator demonstrates how a dApp can consume and verify syngenta oracle data from signed message variant on-chain.

```haskell
import PlutusTx.IsData qualified as IsData

-- The datum structure for the syngenta oracle feed. 
data SyngentaOracleData = SyngentaOracleData
  { farmerId            :: BuiltinByteString
  , farmId              :: BuiltinByteString
  , aeId                :: BuiltinByteString
  , farmArea            :: Integer
  , farmBorders         :: BuiltinByteString
  , sustainabilityIndex :: Integer
  , additionalData      :: BuiltinData
  }
IsData.makeIsDataAsList ''SyngentaOracleData

-- The necessary information to authenticate the oracle data is indeed authentic. 
data SyngentaOracleSignatureRedeemer = SyngentaOracleSignatureRedeemer
  { oracleData :: SyngentaOracleData
  , signature  :: BuiltinByteString
  }
IsData.makeIsDataAsList ''SyngentaOracleSignatureRedeemer

-- This is a demonstration of how to consume and authenticate syngenta oracle data in a cardano smart contract.
-- The oracle data along with the signature which guarantees its authenticity are passed to the smart contract via the redeemer. 
-- You use the serialiseData builtin to convert the oracle data to the message bytes that are signed by the oracle; 
-- this way you can verify that the signature attests to the authenticity of the oracle data by verifying the signature against the message bytes 
-- using the verifyEd25519Signature builtin.
-- This validator will succeed if and only if the signature attests to the authenticity of the oracle data.
{-# INLINABLE mkSyngentaOracleValidator #-}
mkSyngentaOracleValidator :: PubKeyHash -> ScriptContext -> ()
mkSyngentaOracleValidator syngentaOraclePKH ctx =
  let
      -- Decode redeemer into our type
      redeemer = unsafeFromBuiltinData @SyngentaOracleSignatureRedeemer (getRedeemer $ scriptContextRedeemer redeemerRaw)
      ourOracleData = oracleData redeemer
      
      -- Serialize the BuiltinData to the canonical CBOR bytes.
      -- This is the message that is signed by the oracle.
      oracleDataAsMessageBytes = serialiseData $ toBuiltinData ourOracleData

      -- Verify Ed25519 signature using the oracle's PubKeyHash
      isValid :: Bool
      isValid = verifyEd25519Signature
                  (getPubKeyHash syngentaOraclePKH)
                  oracleDataAsMessageBytes
                  (signature sigBundle)
  in
      if isValid
        then ()
        else traceError "invalid Syngenta oracle signature"
```        

## 🏗 Example Reference Oracle Data Variant Validator

The following Plutus V3 validator demonstrates how a dApp can consume and verify syngenta oracle data from the reference input variant on-chain.

```haskell
{-# INLINABLE mkSyngentaOracleValidatorRefVariant #-}
mkSyngentaOracleValidatorRefVariant :: CurrencySymbol -> ScriptContext -> ()
mkSyngentaOracleValidatorRefVariant syngentaCS ctx =
  let
      info :: TxInfo
      info = scriptContextTxInfo ctx

      -- Extract the redeemer as an integer index
      redeemer :: Integer
      redeemer =
        unsafeDataAsI (getRedeemer $ scriptContextRedeemer ctx)

      syngentaRefInput :: TxOut
      syngentaRefInput = txInInfoResolved elemAt redeemer (txInfoReferenceInputs info)

      -- Expect inline datum
      syngentaOracleData :: SyngentaOracleData
      syngentaOracleData = case txOutDatum refOut of
        OutputDatum (Datum d) -> unsafeFromBuiltinData @SyngentaOracleData d
        _                     -> traceError "no inline datum"


      oracleTokenName :: TokenName
      oracleTokenName = TokenName (farmId oracleDatum)

      -- Validate that this reference output carries exactly 1 NFT
      -- with the oracle CurrencySymbol and the token name = farmId
      -- Thus verifying that it contains an authenticated syngenta oracle data feed.
      hasOracleToken :: Bool
      hasOracleToken = valueOf (txOutValue syngentaRefInput) syngentaCS oracleTokenName == 1

  in
      if hasOracleToken 
        then () -- you can trust the oracle data.
        else traceError "unauthentic Syngenta oracle data"
```        
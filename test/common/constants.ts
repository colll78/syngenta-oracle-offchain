import { applyDoubleCborEncoding, applyParamsToScript, applySingleCborEncoding, mintingPolicyToId, SpendingValidator } from "@lucid-evolution/lucid";

let alwaysFails, syngentaMinting, syngentaSpending;

try {
  alwaysFails = await import("../compiled/alwaysFail.json", { assert: { type: "json" } });
  syngentaMinting = await import("../compiled/permissionedMinting.json", { assert: { type: "json" } });
  syngentaSpending = await import("../compiled/permissionedTransfer.json", { assert: { type: "json" } });
} catch (error) {
  console.error("Error loading JSON files:", error);
}


export const alwaysFailsValidator : SpendingValidator = {
    type: "PlutusV3",
    script: applyParamsToScript(applyDoubleCborEncoding(alwaysFails.cborHex), [55n])
};

export const alwaysFailsBytes = applyDoubleCborEncoding(alwaysFails.cborHex);

// accepts syngenta init TxOutRef as a parameter
export const syngentaOracleMintingBytes = applyDoubleCborEncoding(syngentaMinting.cborHex);
export const syngentaOracleSpendingBytes = applyDoubleCborEncoding(syngentaSpending.cborHex);

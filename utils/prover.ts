// @ts-ignore
import { create_proof, setup_generic_prover_and_verifier } from '@noir-lang/barretenberg';
import initializeAztecBackend from '@noir-lang/aztec_backend';

// // Add an event listener for the message event
onmessage = async event => {
  try {
    await initializeAztecBackend();
    const { acir, input } = event.data;

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    console.log(input);

    const proof = await create_proof(prover, acir, input.values, input.query, input.signatureData);
    postMessage(proof);
  } catch (er) {
    console.log(er);
    postMessage(er);
  } finally {
    close();
  }
};

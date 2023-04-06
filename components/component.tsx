import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { getAcir } from '../utils/proofs';
import Ethers from '../utils/ethers';
import React from 'react';

import { ThreeDots } from 'react-loader-spinner';

type Query = {
  slot: number;
  operator: number;
  thresholds: number[];
};

type SignatureData = {
  pub_key_x: number[];
  pub_key_y: number[];
  signature: number[];
  hashed_message: number[];
};

type Input = {
  values: number[];
  query: Query;
  signatureData: SignatureData;
};

function Component() {
  const [input, setInput] = useState<Input>({
    values: [],
    query: { slot: 0, operator: 0, thresholds: [] },
    signatureData: {
      pub_key_x: [],
      pub_key_y: [],
      signature: [],
      hashed_message: [],
    },
  });
  const [pending, setPending] = useState(false);
  const [acir, setAcir] = useState(null);
  const [proof, setProof] = useState(null);
  const [verification, setVerification] = useState(false);

  const handleJsonChange = e => {
    e.preventDefault();
    try {
      let input = JSON.parse(e.target.value);
      input = [
        ...input.values,
        ...[input.query.operator, input.query.slot, ...input.query.thresholds],
        ...[
          ...input.signatureData.hashed_message,
          ...input.signatureData.pub_key_x,
          ...input.signatureData.pub_key_y,
          ...input.signatureData.signature,
        ],
      ];
      setInput(input);
    } catch (err) {
      toast.error('Invalid JSON input');
    }
  };

  const calculateProof = async (userInput: Input) => {
    const acir = await getAcir();
    setAcir(acir);

    setPending(true);

    if (acir) {
      const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));

      worker.onmessage = e => {
        if (e.data instanceof Error) {
          toast.error('Error while calculating proof');
          setPending(false);
        } else {
          toast.success('Proof calculated');
          setProof(e.data);
          setPending(false);
        }
      };

      worker.postMessage({ acir, input: userInput });
    }
  };

  const verifyProof = async () => {
    // only launch if we do have an acir and a proof to verify
    if (acir && proof) {
      // launching a new worker for the verification
      const worker = new Worker(new URL('../utils/verifier.ts', import.meta.url));
      console.log('worker launched');

      // handling the response from the worker
      worker.onmessage = async e => {
        if (e.data instanceof Error) {
          toast.error('Error while verifying proof');
        } else {
          toast.success('Proof verified');

          // Verifies proof on-chain
          const ethers = new Ethers();
          try {
            // const ver = await ethers.contract.verify(proof);
            toast.success('Proof verified on-chain!');
            setVerification(true);
          } catch (err) {
            toast.error('Error while verifying proof on-chain');
            toast.error('Proof failed on-chain verification');
            setVerification(false);
          }
        }
      };

      // sending the acir and proof to the worker
      worker.postMessage({ acir, proof });
    }
  };

  // Verifier the proof if there's one in state
  useEffect(() => {
    if (proof) {
      verifyProof();
    }
  }, [proof]);

  useEffect(() => {
    new Ethers();
  }, []);

  // Shows verification result
  useEffect(() => {
    if (verification) {
      toast.success('Proof verified!');
    }
  }, [verification]);

  return (
    <div className="gameContainer">
      <h1>ZKQP Noir Prover & Verifier</h1>
      <p>This circuit checks en ECDSA signature and Query on provided data values</p>
      <textarea
        name="jsonInput"
        onChange={handleJsonChange}
        style={{ width: '100%', height: '200px' }}
      />
      <button onClick={() => calculateProof(input)}>Calculate proof</button>
      {pending && <ThreeDots wrapperClass="spinner" color="#000000" height={100} width={100} />}
    </div>
  );
}

export default Component;

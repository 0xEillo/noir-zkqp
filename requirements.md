# ZKQP in Noir and Turbo Plonk

## ZKQP

A ZKQP takes an attestation signature, the attestation and a query. In one circuit it proves:

1. The Attestation was signed by the attestor.
2. The query is satisfied on the attestation values.

## Examples

### Attestation

const attestation = [10, 20, 30, 40, 50]

### Query

Operators:

- 0: ==
- 1: !=
- 2: >
- 3: <
- 4: belongs in set
- 5: belongs out set

const query = { index: 1, operator: 2, thresholds: [1, 2, 3], }

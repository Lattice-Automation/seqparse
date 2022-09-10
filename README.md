# seqparse

Parse sequence files (GenBank, FASTA, JBEI, SnapGene, SBOL) or accession IDs (NCBI, iGEM) to a simple, common format:

```ts
interface Seq {
  name: string;
  type: "dna" | "rna" | "aa" | "unknown";
  seq: string;
  annotations: Annotation[];
}

interface Annotation {
  name: string;
  start: number;
  end: number;
  direction?: number;
  color?: string;
  type?: string;
}
```

## Installation

```bash
npm i seqparse
```

To install the CLI globally:

```bash
npm i -g seqparse
```

## Examples

### CLI

Example outputs are truncated for clarity.

```bash
$ seqparse NC_011521.gb
{
  "name": "NC_011521",
  "type": "dna",
  "seq": "atgagtaaaggagaagaacttttca...",
  "annotations": [
    {
      "direction": 1,
      "end": 22,
      "name": "Primer 1",
      "start": 0,
      "type": "primer_bind"
    },
...

$ cat pBbE0c-RFP.fasta | seqparse
{
  "name": "pBbE0c-RFP.1",
  "type": "dna",
  "seq": "cagctagctcagtcctagg...",
  "annotations": []
}

$ seqparse j5.SBOL.xml | jq -r '.seq'
ggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgc

$ seqparse NC_011521
{
  "name": "NC_011521",
  "type": "dna",
  "seq": "cccatcttaagacttcacaagactt...",
  "annotations": [
    {
      "name": "HS566_RS00005",
      "start": 6,
      "end": 285,
      "direction": -1,
      "type": "gene"
    },
...
```

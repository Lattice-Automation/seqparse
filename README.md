# seqparse

Parse sequence files (GenBank, FASTA, SnapGene, SBOL) or accession IDs (NCBI, iGEM) to a simple, common format:

```ts
interface Seq {
  name: string;
  type: "dna" | "rna" | "aa" | "unknown";
  seq: string;
  annotations: Annotation[];
}
```

## Installation

```
npm i seqparse
```

To install the CLI globally:

```
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
```

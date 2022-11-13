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

### Library

```ts
import seqparse from "seqparse";

const { name, type, seq, annotations } = await seqparse(file);
```

### CLI

Example outputs are truncated for clarity.

```bash
# parse files
$ seqparse pBbE0c-RFP.gb
{
  "name": "pBbE0c-RFP",
  "type": "dna",
  "seq": "cagctagctcagtcctaggtactgtgctagctacta...",
  "annotations": [
    {
      "name": "colE1 origin",
      "start": 1234,
      "end": 1917,
      "direction": -1,
      "type": "rep_origin"
    },
...

# parse files from stdin
$ cat pBbE0c-RFP.fasta | seqparse
{
  "name": "pBbE0c-RFP.1",
  "type": "dna",
  "seq": "cagctagctcagtcctagg...",
  "annotations": []
}

# parse files then use jq to get seqs alone
$ seqparse j5.SBOL.xml | jq -r '.seq'
ggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgc

# fetch and parse remote sequence files from NCBI
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

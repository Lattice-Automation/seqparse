// from http://arep.med.harvard.edu/labgc/adnan/projects/Utilities/revcomp.html
const comp = {
  A: "T",
  B: "V",
  C: "G",
  D: "H",
  G: "C",
  H: "D",
  K: "M",
  M: "K",
  N: "N",
  R: "Y",
  S: "S",
  T: "A",
  U: "A",
  V: "B",
  W: "W",
  X: "X",
  Y: "R",
  a: "t",
  b: "v",
  c: "g",
  d: "h",
  g: "c",
  h: "d",
  k: "m",
  m: "k",
  n: "n",
  r: "y",
  s: "s",
  t: "a",
  u: "a",
  v: "b",
  w: "w",
  x: "x",
  y: "r",
};

/**
 * Return the filtered sequence and its complement if its an empty string, return the same for both.
 */
export const complement = (origSeq: string): { compSeq: string; seq: string } => {
  if (!origSeq) {
    return { compSeq: "", seq: "" };
  }

  // filter out unrecognized basepairs and build up the complement
  let seq = "";
  let compSeq = "";
  for (let i = 0, origLength = origSeq.length; i < origLength; i += 1) {
    if (comp[origSeq[i]]) {
      seq += origSeq[i];
      compSeq += comp[origSeq[i]];
    }
  }
  return { compSeq, seq };
};

/**
 * Return the reverse complement of a DNA sequence
 */
export const reverseComplement = (inputSeq: string): string => {
  const { compSeq } = complement(inputSeq);
  return compSeq.split("").reverse().join("");
};

export const firstElement = (arr: any) => {
  if (!Array.isArray(arr)) return undefined;
  return arr[0];
};

const fwd = new Set(["FWD", "fwd", "FORWARD", "forward", "FOR", "for", "TOP", "top", "1", 1]);
const rev = new Set(["REV", "rev", "REVERSE", "reverse", "BOTTOM", "bottom", "-1", -1]);

/**
 * Parse the user defined direction, estimate the direction of the element
 *
 * ```js
 * parseDirection("FWD") => 1
 * parseDirection("FORWARD") => 1
 * ```
 */
export const parseDirection = (direction: number | string | undefined): -1 | 0 | 1 => {
  if (!direction) {
    return 0;
  }
  if (fwd.has(direction)) {
    return 1;
  }
  if (rev.has(direction)) {
    return -1;
  }
  return 0;
};

/**
 * mapping the 64 standard codons to amino acids
 * no synth AA's
 *
 * adapted from: "https://github.com/keithwhor/NtSeq/blob/master/lib/nt.js
 */
const codon2AA = {
  AAA: "K",
  AAC: "N",
  AAG: "K",
  AAT: "N",
  ACA: "T",
  ACC: "T",
  ACG: "T",
  ACT: "T",
  AGA: "R",
  AGC: "S",
  AGG: "R",
  AGT: "S",
  ATA: "I",
  ATC: "I",
  ATG: "M",
  ATT: "I",
  CAA: "Q",
  CAC: "H",
  CAG: "Q",
  CAT: "H",
  CCA: "P",
  CCC: "P",
  CCG: "P",
  CCT: "P",
  CGA: "R",
  CGC: "R",
  CGG: "R",
  CGT: "R",
  CTA: "L",
  CTC: "L",
  CTG: "L",
  CTT: "L",
  GAA: "E",
  GAC: "D",
  GAG: "E",
  GAT: "D",
  GCA: "A",
  GCC: "A",
  GCG: "A",
  GCT: "A",
  GGA: "G",
  GGC: "G",
  GGG: "G",
  GGT: "G",
  GTA: "V",
  GTC: "V",
  GTG: "V",
  GTT: "V",
  TAA: "*",
  TAC: "Y",
  TAG: "*",
  TAT: "Y",
  TCA: "S",
  TCC: "S",
  TCG: "S",
  TCT: "S",
  TGA: "*",
  TGC: "C",
  TGG: "W",
  TGT: "C",
  TTA: "L",
  TTC: "F",
  TTG: "L",
  TTT: "F",
};

const aminoAcids = Array.from(new Set(Object.values(codon2AA)).values()).join("");
const aminoAcidRegex = new RegExp(`^[${aminoAcids}]+$`, "i");

/** Infer the type of a sequence. This only allows a couple wildcard characters so may be overly strict. */
export const guessType = (seq: string): "dna" | "rna" | "aa" | "unknown" => {
  if (/^[atgcn.]+$/i.test(seq)) {
    return "dna";
  } else if (/^[augcn.]+$/i.test(seq)) {
    return "rna";
  } else if (aminoAcidRegex.test(seq)) {
    return "aa";
  }
  return "unknown";
};

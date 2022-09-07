/** Range is a single element with a range and direction in the viewer */
export interface Range {
  direction: -1 | 0 | 1;
  end: number;
  start: number;
}

/** NameRange elements have been parsed to include an id and name */
export interface NameRange extends Range {
  color?: string;
  id: string;
  name: string;
}

/** Annotation is a single feature/annotation parsed from a sequence file. */
export interface Annotation {
  color?: string;
  direction?: number | string;
  end: number;
  name: string;
  start: number;
  type?: string;
}

/** Translation is a single translated CDS. */
export interface Translation extends NameRange {
  AAseq: string;
  direction: -1 | 1;
}

/** Primer is a single primer for PCR. Not visualized right now. */
export interface Primer extends NameRange {
  color: string;
  direction: 1 | -1;
}

export interface Part {
  annotations: Annotation[];
  compSeq: string;
  name: string;
  primers: Primer[];
  seq: string;
}

/** supported input sequence types */
export type SeqType = "dna" | "rna" | "aa" | "unknown";

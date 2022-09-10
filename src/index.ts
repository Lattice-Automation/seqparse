import fetchFile, { isAccession } from "./fetchFile";
import parseFile, { ParseOptions } from "./parseFile";

/** Seq is a single parsed sequence from a file or accession. */
export interface Seq {
  /** name of the sequence */
  name: string;
  /** type of sequence. Inferred from the seq's symbols */
  type: "dna" | "rna" | "aa" | "unknown";
  /** the sequence */
  seq: string;
  /** annotations of the sequence */
  annotations: Annotation[];
}

/** Annotation is a single feature/annotation parsed from a sequence file. */
export interface Annotation {
  /** name of the annotation */
  name: string;
  /** start of the annotation, 0-based */
  start: number;
  /** end of the annotation, 0-based */
  end: number;
  /** 1 if forward, 0 if no direction, -1 if in reverse direction */
  direction?: number;
  /** color of the annotation if set */
  color?: string;
  /** type field if set on the annotation */
  type?: string;
}

/* Parse a sequence file. Or download a sequence with an Accession ID. */
export default async (input: string, options?: ParseOptions): Promise<Seq> => {
  if (!options?.fileName && isAccession(input)) {
    return await fetchFile(input);
  }
  return (await parseFile(input, options))[0];
};

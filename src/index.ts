import fetchFile, { isAccession } from "./fetchFile";
import parseFile from "./parseFile";

/** Seq is a single parsed sequence from a file or accession. */
export interface Seq {
  /** annotations of the sequence */
  annotations: Annotation[];
  /** name of the sequence */
  name: string;
  /** the sequence */
  seq: string;
  /** type of sequence. Inferred from the seq's symbols */
  type: "dna" | "rna" | "aa" | "unknown";
}

/** Annotation is a single feature/annotation parsed from a sequence file. */
export interface Annotation {
  /** color of the annotation if set */
  color?: string;
  /** 1 if forward, 0 if no direction, -1 if in reverse direction */
  direction?: number;
  /** end of the annotation, 0-based */
  end: number;
  /** name of the annotation */
  name: string;
  /** start of the annotation, 0-based */
  start: number;
  /** type field if set on the annotation */
  type?: string;
}

/** Options to parse sequence files. */
export interface ParseOptions {
  /**
   * Whether to use cors-anywhere to circumvent iGEM's web server having a bad configuration.
   */
  cors?: boolean;

  /** name of the source file */
  fileName?: string;

  /**
   * Source of the file (ArrayBuffer). This is necessary for SnapGene.
   *
   * Eg after a read from FileReader.readAsArrayBuffer() in a browser:
   * https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer
   */
  source?: ArrayBuffer;
}

/* Parse a sequence file. Or download a sequence with an Accession ID. */
export default async (input: string, options?: ParseOptions): Promise<Seq> => {
  if (!options?.fileName && isAccession(input)) {
    return await fetchFile(input, options);
  }
  return parseFile(input, options)[0];
};

export { parseFile };

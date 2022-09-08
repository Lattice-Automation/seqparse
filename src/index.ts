import fetchFile, { isAccession } from "./fetchFile";
import parseFile, { FileOptions } from "./parseFile";

/** Seq is a single parsed sequence from a file or accession. */
export interface Seq {
  annotations: Annotation[];
  name: string;
  seq: string;
  type: "dna" | "rna" | "aa" | "unknown";
}

/** Annotation is a single feature/annotation parsed from a sequence file. */
export interface Annotation {
  color?: string;

  /** 1 if forward, 0 if no direction, -1 if in reverse direction */
  direction?: number;

  /** end of the annotation, 0-based */
  end: number;

  /** name of the annotation */
  name: string;

  /** start of the annotation, 0-based */
  start: number;

  type?: string;
}

/* Parse file contents or an Accession to a Seq */
export default async (input: string, options: FileOptions = { fileName: "" }): Promise<Seq> => {
  if (isAccession(input)) {
    return await fetchFile(input);
  }
  return (await parseFile(input, options))[0];
};

import { sep } from "path";

import { Seq } from ".";
import parseBenchling from "./parsers/benchling";
import parseBioBrick from "./parsers/biobrick";
import parseFasta from "./parsers/fasta";
import parseGenbank from "./parsers/genbank";
import parseJbei from "./parsers/jbei";
import parseSbol from "./parsers/sbol";
import parseSeqBuilder from "./parsers/seqbuilder";
import parseSnapgene from "./parsers/snapgene";
import { complement, guessType } from "./utils";

/** Options to parse sequence files. */
export interface ParseOptions {
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

/**
 * parseFile converts the contents of a sequence file to a an array of Seq
 */
export default async (file: string, opts?: ParseOptions): Promise<Seq[]> => {
  const fileName = opts?.fileName || "";
  const sourceName = fileName.split(sep).pop() || fileName;

  if (!file) {
    throw Error("cannot parse null or empty string");
  }

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = file.substring(0, file.search("\n"));
  const dnaCharLength = firstLine.replace(/[^atcgATCG]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const name = fileName && sourceName ? sourceName.substring(0, sourceName.search("\\.")) : "Untitled";

  // another edge case check for whether the seq is a JSON seq from Benchling
  // just a heuristic that says 1) yes it can be parsed 2) it contains a list of
  // fields that are common to Benchling files
  let isBenchling = false;
  try {
    const benchlingJSON = JSON.parse(file); // will err out if not JSON
    if (["bases", "annotations", "primers"].every(k => typeof benchlingJSON[k] !== "undefined")) {
      isBenchling = true;
    }
  } catch (ex) {
    // expected
  }

  const prefix = file.substring(0, 200);
  let seqs: Seq[];
  switch (true) {
    // JBEI
    case prefix.includes(':seq="http://jbei.org/sequence"'):
    case file.startsWith("<seq:seq"):
      seqs = await parseJbei(file);
      break;

    // FASTA
    case file.startsWith(">"):
    case file.startsWith(";"):
    case fileName.endsWith(".seq"):
    case fileName.endsWith(".fa"):
    case fileName.endsWith(".fas"):
    case fileName.endsWith(".fasta"):
      seqs = await parseFasta(file, fileName);
      break;

    // Genbank
    case file.includes("LOCUS") && file.includes("ORIGIN"):
    case fileName.endsWith(".gb"):
    case fileName.endsWith(".gbk"):
    case fileName.endsWith(".genbank"):
    case fileName.endsWith(".ape"):
      seqs = await parseGenbank(file, fileName);
      break;

    // SnapGene
    case fileName.endsWith(".dna"):
      seqs = await parseSnapgene(opts);
      break;

    // SeqBuilder
    case prefix.includes("Written by SeqBuilder"):
    case fileName.endsWith(".sbd"):
      seqs = await parseSeqBuilder(file, fileName);
      break;

    // BioBrick XML
    case prefix.includes("Parts from the iGEM"):
    case prefix.includes("<part_list>"):
      seqs = await parseBioBrick(file);
      break;

    // Benchling JSON
    case isBenchling:
      seqs = await parseBenchling(file);
      break;

    // SBOL
    case prefix.includes("RDF"):
      seqs = await parseSbol(file, fileName);
      break;

    // a DNA text file without an official formatting
    case dnaOnlyFile: {
      const { seq } = complement(file);
      seqs = [{ annotations: [], name, seq, type: guessType(seq) }];
      break;
    }

    default:
      throw Error(`${fileName} File type not recognized: ${file}`);
  }

  // bit of clean up to: only return the fields in a Seq and reorder to match expectations.
  return seqs.map(p => ({
    name: p.name,
    type: p.type,
    seq: p.seq,
    annotations: p.annotations
      .sort((a, b) => a.start - b.start || a.end - b.end)
      .map(a => ({
        name: a.name,
        start: a.start,
        end: a.end,
        direction: a.direction,
        type: a.type,
        color: a.color,
      })),
  }));
};

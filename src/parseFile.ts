import * as path from "path";

import { Seq } from ".";
import parseBenchling from "./parsers/benchling";
import parseBioBrick from "./parsers/biobrick";
import parseFASTA from "./parsers/fasta";
import parseGenbank from "./parsers/genbank";
import parseJBEI from "./parsers/jbei";
import parseSBOL from "./parsers/sbol";
import parseSeqBuilder from "./parsers/seqbuilder";
import parseSnapgene from "./parsers/snapgene";
import { complement, guessType } from "./utils";

export interface FileOptions {
  fileName?: string;
}

/**
 * parseFile can convert either string contents of DNA files or a list of File objects into Seqs
 */
export default async (
  files: string | string[] | File | File[],
  options: FileOptions = { fileName: "" }
): Promise<Seq[]> => {
  const partLists: Promise<Seq[]>[] = [];
  const { fileName = "" } = options;

  // if it's just a single file string
  if (typeof files === "string") {
    partLists.push(parseFile(files, { fileName }));
  } else {
    if (!Array.isArray(files)) {
      files = [files];
    }

    // a list of file strings or a FileList
    files.forEach((file: string | File) => {
      if (typeof file === "string") {
        partLists.push(parseFile(file, options));
      } else if (file.type === "application/zip") {
        throw new Error("zip files are not supported by SeqViz");
      } else {
        partLists.push(
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
              if (e.target && e.target.result) {
                resolve(parseFile(e.target.result, fileOptions));
              } else {
                reject("Failed to load results from FileReader");
              }
            };

            // set fileName in options if available
            // fileName used in naming seq and determining which file parser to use
            const fileOptions = file.name ? { ...options, fileName: file.name } : options;

            // SnapGene files are buffers, rest are strings
            if (fileOptions.fileName != null && fileOptions.fileName.endsWith(".dna")) {
              reader.readAsArrayBuffer(file);
            } else {
              reader.readAsText(file);
            }
          })
        );
      }
    });
  }

  return (await Promise.all(partLists)).reduce((acc, partList) => acc.concat(partList), []);
};

/**
 * Takes in the contents of file, figures out which type of file it is and converts it to a Seq.
 */
const parseFile = async (file: string | ArrayBuffer, options: FileOptions = { fileName: "" }): Promise<Seq[]> => {
  const { fileName = "" } = options;
  const sourceName = fileName.split(path.sep).pop() || fileName;

  if (!file) {
    throw Error("cannot parse null or empty string");
  }

  let fileString: string;
  if (file instanceof ArrayBuffer) {
    if (fileName.endsWith(".dna")) {
      // SnapGene; first because it's a buffer, not string
      // it will fail for some string methods below
      return await parseSnapgene(file, { fileName });
    } else {
      throw Error("Unrecognized file type, ArrayBuffer but not a Snapgene file (.dna)");
    }
  } else {
    fileString = file;
  }

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = fileString.substring(0, fileString.search("\n"));
  const dnaCharLength = firstLine.replace(/[^atcgATCG]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const name = fileName && sourceName ? sourceName.substring(0, sourceName.search("\\.")) : "Untitled";

  // another edge case check for whether the seq is a JSON seq from Benchling
  // just a heuristic that says 1) yes it can be parsed 2) it contains a list of
  // fields that are common to Benchling files
  let isBenchling = false;
  try {
    const benchlingJSON = JSON.parse(fileString); // will err out if not JSON
    if (["bases", "annotations", "primers"].every(k => typeof benchlingJSON[k] !== "undefined")) {
      isBenchling = true;
    }
  } catch (ex) {
    // expected
  }

  let seqs: Seq[];
  switch (true) {
    // FASTA
    case fileString.startsWith(">"):
    case fileString.startsWith(";"):
    case fileName.endsWith(".seq"):
    case fileName.endsWith(".fa"):
    case fileName.endsWith(".fas"):
    case fileName.endsWith(".fasta"):
      seqs = await parseFASTA(fileString, fileName);
      break;

    // Genbank
    case fileString.includes("LOCUS") && fileString.includes("ORIGIN"):
    case fileName.endsWith(".gb"):
    case fileName.endsWith(".gbk"):
    case fileName.endsWith(".genbank"):
    case fileName.endsWith(".ape"):
      seqs = await parseGenbank(fileString, fileName);
      break;

    // SeqBuilder
    case fileString.includes("Written by SeqBuilder"):
    case fileName.endsWith(".sbd"):
      seqs = await parseSeqBuilder(fileString, fileName);
      break;

    // BioBrick XML
    case fileString.includes("Parts from the iGEM"):
    case fileString.includes("<part_list>"):
      seqs = await parseBioBrick(fileString);
      break;

    // Benchling JSON
    case isBenchling:
      seqs = await parseBenchling(fileString);
      break;

    // SBOL
    case fileString.includes("RDF"):
      seqs = await parseSBOL(fileString, fileName);
      break;

    // jbei
    case fileString.includes(':seq="http://jbei.org/sequence"'):
    case fileString.startsWith("<seq:seq"):
      seqs = await parseJBEI(fileString);
      break;

    // a DNA text fileString without an official formatting
    case dnaOnlyFile: {
      const { seq } = complement(fileString);
      seqs = [{ annotations: [], name, seq, type: guessType(seq) }];
      break;
    }

    default:
      throw Error(`${fileName} File type not recognized: ${fileString}`);
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

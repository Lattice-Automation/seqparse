import { sep } from "path";
import * as xml2js from "xml2js";

import { Annotation, Seq } from "..";
import { ParseOptions } from "../parseFile";
import { guessType, parseDirection } from "../utils";

/**
 * Parse a Snapgene file to Seq[]
 *
 * this is adapted from https://github.com/TeselaGen/ve-sequence-parsers/blob/master/src/parsers/snapgeneToJson.js
 * which was adapted from https://github.com/IsaacLuo/SnapGeneFileReader/blob/master/snapgene_reader/snapgene_reader.py
 */
export default async (options?: ParseOptions): Promise<Seq[]> => {
  if (!options || !options.source) {
    throw new Error("Failed to parse SnapGene file. No valid file input");
  }

  const fileName = options?.fileName || "";
  const seq = {
    annotations: [] as Annotation[],
    circular: false,
    name: "",
    seq: "",
    type: "unknown",
  };

  const buffer = Buffer.from(options.source);

  // Accumulate an offset from the start as we read through the file
  let offset = 0;

  // Read a buffer from the buffer
  const read = (size: number) => {
    const start = offset;
    offset += size;
    return buffer.subarray(start, offset);
  };

  // Read from buffer and decode as string
  const readEnc = (size: number, fmt: BufferEncoding) => read(size).toString(fmt);

  // Read the first byte
  read(1);

  // Read document properties
  const length = read(4).readUInt32BE();
  const title = readEnc(8, "ascii");
  if (length !== 14 || title !== "SnapGene") {
    throw new Error(`Wrong format for a SnapGene file: length=${length} title=${title}`);
  }

  read(2); // isDNA
  read(2); // exportVersion
  read(2); // importVersion

  /* eslint-disable no-await-in-loop */
  // READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
  while (offset < buffer.length) {
    // next_byte table
    // 0: dna sequence
    // 1: compressed DNA
    // 2: unknown
    // 3: unknown
    // 5: primers
    // 6: notes
    // 7: history tree
    // 8: additional sequence properties segment
    // 9: file Description
    // 10: features
    // 11: history node
    // 13: unknown
    // 16: alignable sequence
    // 17: alignable sequence
    // 18: sequence trace
    // 19: Uracil Positions
    // 20: custom DNA colors

    const nextByte = read(1);
    const blockSize = read(4).readUInt32BE();
    const ord = nextByte.toString().charCodeAt(0);
    if (ord === 0) {
      // Read the sequence and its properties
      read(1); // isCircular

      const size = blockSize - 1;
      if (size < 0) throw new Error("Failed parsing SnapGene: < 0 length sequence");
      seq.seq = readEnc(size, "ascii");
    } else if (ord === 10) {
      // Read all the features

      const xml = readEnc(blockSize, "utf8") as string;
      const b = await new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      const { Features: { Feature = [] } = {} } = b as { Features: { Feature: any[] } };
      Feature.forEach(({ $: attrs, Segment = [] }) => {
        let minStart = 0;
        let maxEnd = 0;
        if (Segment) {
          Segment.forEach(({ $: seg }) => {
            if (!seg) throw new Error("Invalid feature definition");
            const { range } = seg as { range: string };
            const [start, end] = range.split("-");
            minStart = minStart === 0 ? +start : Math.min(minStart, +start);
            maxEnd = Math.max(maxEnd, +end);
          });
        }

        // create an Annotation
        seq.annotations.push({
          direction: parseDirection(
            {
              "0": "NONE",
              "1": 1,
              "2": -1,
              "3": "BIDIRECTIONAL",
              undefined: "NONE",
            }[attrs.directionality]
          ),
          end: maxEnd - 1,
          name: attrs.name,
          start: minStart - 1,
          type: attrs.type,
        });
      });
    } else {
      // UNKNOWN: WE IGNORE THE WHOLE BLOCK
      read(blockSize);
    }
  }

  return [
    {
      ...seq,
      // snapgene uses the filename as the sequence name
      name: fileName.split(sep).pop()?.replace(".dna", "") || fileName,
      type: guessType(seq.seq),
    },
  ];
};

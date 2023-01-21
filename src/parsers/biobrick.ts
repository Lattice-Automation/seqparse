import { XMLParser } from "fast-xml-parser";

import { Seq } from "..";
import { complement, firstElement, guessType, parseDirection } from "../utils";

/**
 * Parse a BioBrick in XML format to Seq[]
 *
 * Eg: https://parts.igem.org/cgi/xml/part.cgi?part=BBa_J23100
 */
export default (file: string): Seq[] => {
  const bail = (err: string) => {
    throw new Error(`Failed on BioBrick: ${err}`);
  };

  // parse
  const parsedBiobrick = new XMLParser({
    isArray: name => {
      return ["features", "part_name", "sequences"].includes(name);
    },
    removeNSPrefix: true,
  }).parse(file);

  // get the first part
  const { part } = parsedBiobrick.rsbpml.part_list;
  if (!part) bail("No part seen in part_list");

  // extract the useful fields
  const { features, part_name, sequences } = part;

  const name = firstElement(part_name);

  // parse the iGEM annotations
  const annotations = features
    .map(({ feature }) => {
      if (!feature) return null;

      const { direction, endpos, startpos, type } = feature;

      return {
        direction: parseDirection(direction),
        end: +endpos,
        name: `${direction}-${startpos}`,
        start: +startpos || 0,
        type: type || undefined,
      };
    })
    .filter(a => a);

  // parse the sequence
  const { seq } = complement(sequences[0].seq_data);

  return [
    {
      annotations: annotations,
      name,
      seq,
      type: guessType(seq),
    },
  ];
};

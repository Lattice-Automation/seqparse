import * as xml2js from "xml2js";

import { Seq } from "..";
import { complement, firstElement, guessType, parseDirection } from "../utils";

/**
 * Parse a BioBrick in XML format to Seq[]
 *
 * Eg: https://parts.igem.org/cgi/xml/part.cgi?part=BBa_J23100
 */
export default async (file: string): Promise<Seq[]> =>
  new Promise((resolve, reject) => {
    const bail = (err: string) => reject(new Error(`Failed on BioBrick: ${err}`));

    // by default, all nodes are pushed to arrays, even if just a single child element
    // is present in the XML
    xml2js.parseString(file, {}, (err, response) => {
      if (err) bail(`Failed to parse XML: ${err}`);

      // get the first part
      let part = firstElement(response.rsbpml.part_list);
      if (!part || !part.part) bail("No part seen in part_list");

      // part is also an array... xml...
      part = firstElement(part.part);
      if (!part) bail("No part seen in part_list");

      // extract the useful fields
      const { features: featureArray, part_name, sequences } = part;

      // go another level...
      const seq_data = firstElement(sequences);
      if (!seq_data || !seq_data.seq_data) bail("No seq_data");

      let seq = firstElement(seq_data.seq_data);
      const name = firstElement(part_name);

      // go another level to get features...
      let features = firstElement(featureArray);
      if (features && "feature" in features) {
        features = features.feature;
      } else {
        features = [];
      }

      // parse the iGEM annotations
      const annotations = features
        .map(f => {
          if (!f) return null;

          const { direction, endpos, startpos, type } = f;

          return {
            direction: parseDirection(direction[0]),
            end: +endpos[0] || 0,
            name: `${direction[0]}-${startpos[0]}`,
            start: +startpos[0] || 0,
            type: type[0] || undefined,
          };
        })
        .filter(a => a);

      ({ seq } = complement(seq));
      resolve([
        {
          name,
          type: guessType(seq),
          seq,
          annotations: annotations,
        },
      ]);
    });
  });

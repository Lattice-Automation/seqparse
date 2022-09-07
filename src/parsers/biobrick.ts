import * as xml2js from "xml2js";

import { Part } from "../elements";
import { complement, firstElement, partFactory } from "../parser";

/**
 * converts an XML part representation of a BioBrick part into a format
 * compatible with our DB representation of a part.
 *
 * with all the error handling this file reads like a Golang script
 *
 * an exmaple of the XML file that's parsed is in ./examples/biobrick
 */
export default async (file: string): Promise<Part[]> =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectBioBrick = errType => reject(new Error(`Failed on BioBrick because ${errType}`));

    // by default, all nodes are pushed to arrays, even if just a single child element
    // is present in the XML
    xml2js.parseString(file, {}, (err, response) => {
      if (err) rejectBioBrick(`XML to JSON: ${err}`);

      // get the first part
      let part = firstElement(response.rsbpml.part_list);
      if (!part || !part.part) rejectBioBrick("getting first part");

      // part is also an array... xml...
      part = firstElement(part.part);
      if (!part) rejectBioBrick("getting first part");

      // extract the userful fields
      const { features: featureArray, part_name, sequences } = part;

      // go another level...
      const seq_data = firstElement(sequences);
      if (!seq_data || !seq_data.seq_data) rejectBioBrick("getting seq_data");

      // go another level to get features...
      let features = firstElement(featureArray);
      if (features && "feature" in features) {
        features = features.feature;
      } else {
        features = [];
      }

      const seq = firstElement(seq_data.seq_data);
      const name = firstElement(part_name);

      if (!seq || !name) {
        // assume it failed
        rejectBioBrick("seq || name || featureArray");
      }

      // parse the iGEM annotations
      const annotations = features
        .map(f => {
          if (!f) return null;

          const { direction, endpos, startpos, type } = f;

          return {
            direction: direction[0] === "forward" ? 1 : -1,
            end: +endpos[0] || 0,
            name: `${direction[0]}-${startpos[0]}`,
            start: +startpos[0] || 0,
            type: type[0] || "N/A",
          };
        })
        .filter(a => a);

      const newPart = {
        ...partFactory(),
        ...complement(seq),
        annotations: annotations,
        // seq and compSeq
        name: name,
      };

      resolve([newPart]);
    });
  });

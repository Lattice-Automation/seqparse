import * as xml2js from "xml2js";

import { Annotation, Seq } from "..";
import { complement, guessType } from "../utils";

/**
 * takes a JBEI file, as a string, and converts it to a Part.
 * An example of this type of file can be found in ../examples/jbei
 */
export default async (JBEI: string): Promise<Seq[]> =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectJBEI = errType => reject(new Error(`Failed on JBEI file; ${errType}`));

    // weird edge case with directed quotation characters
    const fileString = JBEI.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString,
      {
        attrkey: "xml_tag",
        tagNameProcessors: [xml2js.processors.stripPrefix],
        xmlns: true,
      },
      (err, parsedJBEI) => {
        if (err) rejectJBEI(err);

        // destructure the paramaeters from JBEI
        const { seq } = parsedJBEI;
        const { features, name, sequence } = seq;

        // attempt to get the name out of the JBEI
        let parsedName = "Unnamed";
        if (name && name[0] && name[0]._) {
          parsedName = name[0]._;
        }

        // attempt to get the sequence. fail if it's not findable
        let parsedSeq = "";
        if (sequence && sequence[0] && sequence[0]._) {
          parsedSeq = sequence[0]._;
        }
        const { seq: parsedSeq2 } = complement(parsedSeq); // seq and compSeq
        if (!parsedSeq2) return null;

        // attempt to parse the JBEI annotations into our version of annotations
        const annotations: Annotation[] = [];
        if (features && features[0] && features[0].feature) {
          features[0].feature.forEach(feature => {
            if (!feature) return;

            const { label = [{}], type = [{}], complement = [{}], location = [] } = feature;
            if (location && location[0] && location[0].genbankStart && location[0].end) {
              annotations.push({
                direction: complement[0]._ === "true" ? -1 : 1,
                // JBEI is 1-based
                end: +location[0].end[0]._ || 0,
                name: label[0]._ || "Untitled",
                start: +location[0].genbankStart[0]._ - 1 || 0,
                type: type[0]._ || "N/A",
              });
            }
          });
        }

        resolve([
          {
            annotations: annotations,
            name: parsedName,
            seq: parsedSeq2,
            type: guessType(parsedSeq2),
          },
        ]);
      }
    );
  });

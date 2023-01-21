import { XMLParser } from "fast-xml-parser";

import { Annotation, Seq } from "..";
import { complement, guessType } from "../utils";

/**
 * Converts a JBEI file to a Seq
 *
 * https://j5.jbei.org/j5manual/pages/94.html
 */
export default (JBEI: string): Seq[] => {
  // weird edge case with directed quotation characters
  const fileString = JBEI.replace(/“|”/g, '"');

  // parse
  const parsedJbei = new XMLParser({
    removeNSPrefix: true,
  }).parse(fileString);

  // destructure the parameters from JBEI
  const { seq } = parsedJbei;
  const { features, name, sequence } = seq;

  // attempt to get the name out of the JBEI
  let parsedName = "Unnamed";
  if (name) {
    parsedName = name;
  }

  // attempt to get the sequence. fail if it's not findable
  const { seq: parsedSeq } = complement(sequence); // seq and compSeq
  if (!parsedSeq) return [];

  // attempt to parse the JBEI annotations into our version of annotations
  const annotations: Annotation[] = [];
  if (features && features.feature) {
    features.feature.forEach(feature => {
      if (!feature) return;

      const { complement, label, location, type } = feature;
      if (location && location.genbankStart && location.end) {
        annotations.push({
          direction: complement ? -1 : 1,
          // JBEI is 1-based
          end: +location.end || 0,
          name: label || "Untitled",
          start: +location.genbankStart - 1 || 0,
          type: type || "N/A",
        });
      }
    });
  }

  return [
    {
      annotations: annotations,
      name: parsedName,
      seq: parsedSeq,
      type: guessType(parsedSeq),
    },
  ];
};

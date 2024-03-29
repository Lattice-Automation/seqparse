import { XMLParser } from "fast-xml-parser";

import { Annotation, Seq } from "..";
import { complement, guessType } from "../utils";

/**
 * Converts an SBOL file to our Seq format.
 *
 * SBOL v2.0 schema definition can be found at: http://sbolstandard.org/wp-content/uploads/2016/06/SBOL-data-model-2.2.1.pdf
 * differs from SBOL v1.0 in that the ComponentDefinitions are like the root parts,
 * and the sequence and annotations are separated (they're no longer defined relationally
 * by nesting but, instead, by id) we only care about components that have sequence information
 */
export default (sbol: string, fileName: string): Seq[] => {
  // weird edge case with directed quotation characters
  const fileString = sbol.replace(/“|”/g, '"');

  // parse
  const parsedSBOL = new XMLParser({
    ignoreAttributes: false,
    isArray: name =>
      ["Sequence", "ComponentDefinition", "SequenceAnnotation", "sequenceAnnotation", "elements"].includes(name),
    removeNSPrefix: true,
  }).parse(fileString);

  try {
    const seqList = parseSBOL2(parsedSBOL, fileName);

    if (seqList.length) {
      return seqList;
    } else {
      throw new Error("No Sequence info found");
    }
  } catch (err) {
    throw new Error(`Failed to parse SBOL v2 file: ${err}`);
  }
};

const parseSBOL2 = (parsedSBOL, fileName: string): Seq[] => {
  let RDF = null;
  if (parsedSBOL.RDF) {
    ({ RDF } = parsedSBOL);
  }

  if (!RDF) {
    throw new Error("No root RDF document");
  }

  // check if anything is defined, return if not
  const { ComponentDefinition, Sequence } = RDF;
  if (!ComponentDefinition && !Sequence) {
    throw new Error("Failed to parse SBOL v2: No ComponentDefinition or Sequence");
  }

  // read thru the Sequence elements
  const getSeq = (seqID?: string) => {
    const seqElement = seqID
      ? // @ts-ignore
        Sequence.find(
          s =>
            (s.persistentIdentity && s.persistentIdentity.length && s.persistentIdentity["@_resource"] === seqID) ||
            s["@_about"] === seqID
        )
      : Sequence[0];

    if (seqElement && seqElement.elements) {
      const { seq } = complement(seqElement.elements[0] || "");
      return {
        annotations: [],
        name: seqElement.displayId,
        seq,
        type: guessType(seq),
      };
    }
    return null;
  };

  // if it's a collection of DnaComponents, parse each to a part
  const seqList: Seq[] = [];
  // @ts-ignore
  ComponentDefinition?.forEach((c, i) => {
    // we're only making parts out of those with seq info
    if (!c.sequence) {
      return;
    }

    const { displayId, sequence, sequenceAnnotation } = c;
    const name = displayId || `${fileName}_${i + 1}`;

    const annotations: Annotation[] = [];
    (sequenceAnnotation || []).forEach(({ SequenceAnnotation }) => {
      const ann = SequenceAnnotation[0];
      const annId = ann.displayId;
      const { Range } = ann.location;

      const range = Range;
      if (range) {
        annotations.push({
          end: range.end - 1,
          name: annId,
          start: range.start - 1,
        });
      }
    });

    const seq = getSeq(sequence["@_resource"]);

    if (seq) {
      seqList.push({
        annotations,
        name,
        seq: seq.seq,
        type: seq.type,
      });
    }
  });

  // if it's a single sequence, just try and get the sequence from that alone
  const seq = getSeq();
  if (!seqList.length && seq) {
    seqList.push(seq);
  }
  return seqList;
};

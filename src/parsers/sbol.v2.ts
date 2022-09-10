import * as xml2js from "xml2js";

import { Annotation, Seq } from "..";
import { complement, guessType } from "../utils";

// get the first string/number child out of an array of possible null elements
const first = elArr => {
  if (elArr && elArr[0]) {
    if (elArr[0]._) {
      return elArr[0]._;
    }
    return elArr[0];
  }
  return null;
};

/**
 * Converts an SBOL file to our Seq format.
 *
 * SBOL v2.0 schema definition can be found at: http://sbolstandard.org/wp-content/uploads/2016/06/SBOL-data-model-2.2.1.pdf
 * differs from SBOL v1.0 in that the ComponentDefinitions are like the root parts,
 * and the sequence and annotations are separated (they're no longer defined relationally
 * by nesting but, instead, by id) we only care about components that have sequence information
 */
export default async (sbol: string, fileName: string): Promise<Seq[]> =>
  new Promise((resolve, reject) => {
    // weird edge case with directed quotation characters
    const fileString = sbol.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString,
      {
        attrkey: "xml_tag",
        tagNameProcessors: [xml2js.processors.stripPrefix],
        xmlns: true,
      },
      (err, parsedSBOL) => {
        if (err) {
          reject(new Error(`Failed to parse SBOL v2: ${err}`));
        }

        try {
          const seqList = parseSBOL2(parsedSBOL, fileName);

          if (seqList.length) {
            resolve(seqList);
          } else {
            throw new Error("No Sequence info found");
          }
        } catch (err) {
          reject(`Failed to parse SBOL v2 file: ${err}`);
        }
      }
    );
  });

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
            (s.persistentIdentity &&
              s.persistentIdentity.length &&
              s.persistentIdentity[0].xml_tag["rdf:resource"].value === seqID) ||
            s.xml_tag["rdf:about"].value === seqID
        )
      : first(Sequence);

    if (seqElement && seqElement.elements) {
      const { seq } = complement(first(seqElement.elements) || "");
      return {
        annotations: [],
        name: first(seqElement.displayId),
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
    if (!c.sequence || !c.sequence.length) {
      return;
    }

    const { displayId, sequence, sequenceAnnotation } = c;
    const name = first(displayId) || `${fileName}_${i + 1}`;

    const annotations: Annotation[] = [];
    (sequenceAnnotation || []).forEach(({ SequenceAnnotation }) => {
      const ann = SequenceAnnotation[0];
      const annId = first(ann.displayId);
      const { Range } = first(ann.location);

      const range = first(Range);
      if (range) {
        annotations.push({
          end: first(range.end) - 1,
          name: annId,
          start: first(range.start) - 1,
        });
      }
    });

    const seqID = first(sequence)?.xml_tag["rdf:resource"]?.value;

    const seq = getSeq(seqID);
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

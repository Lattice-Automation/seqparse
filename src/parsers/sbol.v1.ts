import { XMLParser } from "fast-xml-parser";

import { Annotation, Seq } from "..";
import { complement, guessType } from "../utils";

/*
  <sbol:Sequence rdf:about="https://synbiohub.cidarlab.org/public/Demo/A1_sequence/1">
    <sbol:persistentIdentity rdf:resource="https://synbiohub.cidarlab.org/public/Demo/A1_sequence"/>
    <sbol:displayId>A1_sequence</sbol:displayId>
    <sbol:version>1</sbol:version>
    <prov:wasDerivedFrom rdf:resource="https://github.com/CIDARLAB/cello/blob/master/resources/UCF/Eco1C1G1T0.UCF.json"/>
    <prov:wasGeneratedBy rdf:resource="https://synbiohub.cidarlab.org/public/Demo/cello2sbol/1"/>
    <dcterms:title>A1_sequence</dcterms:title>
    <sbh:ownedBy rdf:resource="https://synbiohub.cidarlab.org/user/prash"/>
    <sbh:topLevel rdf:resource="https://synbiohub.cidarlab.org/public/Demo/A1_sequence/1"/>
    <sbol:elements>AATGTTCCCTAATAATCAGCAAAGAGGTTACTAG</sbol:elements>
    <sbol:encoding rdf:resource="http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html"/>
  </sbol:Sequence>
*/

/**
 * takes an SBOL file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/j5.SBOL.xml
 */
export default (sbol: string): Seq[] => {
  // weird edge case with directed quotation characters
  const fileString = sbol.replace(/“|”/g, '"');

  // parse
  const parsedSBOL = new XMLParser({
    ignoreAttributes: false,
    isArray: name =>
      [
        "Sequence",
        "Collection",
        "DnaComponent",
        "dnaSequence",
        "ComponentDefinition",
        "SequenceAnnotation",
        "sequenceAnnotation",
        "elements",
        "component",
        "annotation",
      ].includes(name),
    removeNSPrefix: true,
  }).parse(fileString);

  let RDF = null;
  if (parsedSBOL.RDF) ({ RDF } = parsedSBOL);

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'Collection' does not exist on type 'null... Remove this comment to see the full error message
  const { Collection, DnaComponent } = RDF;
  if (Collection && Collection.length) {
    // it's a collection of DnaComponents, parse each to a part
    const partList = [];
    Collection.forEach(({ component }) => {
      if (component && component.length) {
        component.forEach(({ DnaComponent: nestedDnaComponent }) => {
          partList.push(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ seq: string; compSeq: string; ... Remove this comment to see the full error message
            dnaComponentToPart(nestedDnaComponent[0], {
              file: sbol,
              strict: false,
            })
          );
        });
      }
    });

    // check whether any parts were created from the collection
    if (partList.length) return partList;
  } else if (DnaComponent && DnaComponent.length) {
    // create a single part from the single one passed
    const validPart = dnaComponentToPart(DnaComponent[0], {
      file: sbol,
      strict: false,
    });
    // it will be null if there isn't any sequence information beneath it
    if (validPart) return [validPart];
  }

  // go on a fishing expedition for DnaComponents
  // everything else has failed
  // accumulate all that are "valid" (name + seq)
  const dnaComponentAccumulator = [];
  findDnaComponentNodes(dnaComponentAccumulator, RDF);

  // @ts-ignore
  const attemptedSeqs: Seq[] = dnaComponentAccumulator
    .map(p =>
      dnaComponentToPart(p, {
        file: sbol,
        strict: true,
      })
    )
    .filter(p => !!p); // invalid parts will be null
  if (attemptedSeqs.length) return attemptedSeqs;

  // go on another fishing expedition, but for Sequence nodes
  const dnaSequenceAccumulator = [];
  findSequenceNodes(dnaSequenceAccumulator, RDF);
  return dnaSequenceAccumulator.map(p => sequenceToPart(p, sbol)).filter(p => p); // invalid parts will be null
};

/**
 * find all the nodes within the JSON document that are keyed "Sequence"
 *
 * this is another last-resort scrapper for trying to find valid parts
 */
const findSequenceNodes = (acc, doc) => {
  Object.keys(doc).forEach(k => {
    if (k === "Sequence" && doc[k].length) acc.push(...doc[k]);
    if (Array.isArray(doc[k])) {
      doc[k].forEach(nestedNode => {
        findSequenceNodes(acc, nestedNode);
      });
    }
  });
};

/**
 * after getting a DnaComponent out of the SBOL document,
 * at either the root RDF level or from within a Collection/Annotation
 * hierarchy, convert that DnaComponent to a Seq
 */
const dnaComponentToPart = (DnaComponent, options) => {
  const { strict = false } = options;
  // destructure the params from DnaComponent
  const { annotation, displayId, dnaSequence, name } = DnaComponent;

  // attempt to get the name out of the SBOL
  let parsedName = "Unnamed";
  if (name) {
    parsedName = name;
  } else if (displayId) {
    parsedName = displayId;
  } else if (strict) {
    // in this scenario, we're really scrapping to find parts, but shouldn't
    // accept any that don't at least have some name and sequence information
    return null;
  }

  // attempt to get the sequence. fail if it's not findable
  let seq = "";
  if (dnaSequence && dnaSequence[0].DnaSequence) {
    seq = dnaSequence[0].DnaSequence.nucleotides;
  }

  const { seq: parsedSeq } = complement(seq); // seq and compSeq
  if (!parsedSeq) return null;

  // attempt to parse the SBOL annotations into our version of annotations
  const annotations: Annotation[] = [];
  if (annotation) {
    annotation.forEach(({ SequenceAnnotation }) => {
      if (!SequenceAnnotation || !SequenceAnnotation[0]) return;

      const { bioEnd, bioStart, strand, subComponent } = SequenceAnnotation[0];
      if (subComponent && subComponent.DnaComponent && subComponent.DnaComponent[0]) {
        const { displayId: annId, name: annName, type: annType } = subComponent.DnaComponent[0];

        annotations.push({
          direction: strand === "+" ? 1 : -1,
          end: bioEnd - 1 || 0,
          name: annName || annId || "Untitled",
          start: bioStart - 1 || 0,
          type: annType["@_resource"] || "N/A",
        });
      }
    });
  }

  return {
    annotations: annotations,
    name: parsedName,
    seq: parsedSeq,
    type: guessType(seq),
  };
};

/**
 * find all nodes that of the type Sequence, and convert those to parts "Sequence" -> Part
 *
 * this is not the standard format. see A1.xml
 */
const sequenceToPart = (Seq, file) => {
  // get the name
  const name = Seq.displayId || Seq.title || "Unnamed";

  // get the sequence
  const seqOrig = Seq.elements[0] || "";

  const { compSeq, seq } = complement(seqOrig);

  // guess whether it's circular or not based on the presence of a word like vector.
  // very ad hoc
  const circular = file.search(/plasmid/i) > 0;

  return { annotations: [], circular, compSeq, name, seq, type: guessType(seq) };
};

/**
 * find all the nodes within the SBOL JSON document that are keyed "DnaComponent"
 *
 * this is a last-resort scrapper that tries to find valid parts that aren't within a root
 * DnaComponent document or within a root Collection array
 */
const findDnaComponentNodes = (acc: Seq[], doc: any) => {
  Object.keys(doc).forEach(k => {
    if (k === "DnaComponent" && doc[k].length) acc.push(...doc[k]);
    if (Array.isArray(doc[k])) {
      doc[k].forEach(nestedNode => {
        findDnaComponentNodes(acc, nestedNode);
      });
    }
  });
};

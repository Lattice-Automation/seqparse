import { Seq } from "..";
import { complement, directionality, guessType } from "../utils";

/**
 * Benchling format is just JSON. It's virtually the same format.
 */
export default async (text: string): Promise<Seq[]> => {
  const partJSON = JSON.parse(text);
  const { seq } = complement(partJSON.bases);

  // throw an error if the sequence is empty
  if (seq.length < 1) {
    return Promise.reject(new Error("Invalid Benchling part: empty sequence"));
  }

  return [
    {
      annotations: partJSON.annotations.map(a => ({
        ...a,
        direction: directionality(a.strand),
      })),
      name: partJSON.name || partJSON._id,
      seq: seq,
      type: guessType(seq),
    },
  ];
};

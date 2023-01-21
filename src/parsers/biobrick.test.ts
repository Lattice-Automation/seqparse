import { readFileSync } from "fs";
import { join } from "path";

import parseBiobrick from "./biobrick";

describe("BioBrick parser", () => {
  it("should parse a JBEI file", () => {
    const file = readFileSync(join(__dirname, "..", "examples", "biobrick", "iGEM.BioBrick.xml"), "utf8");

    const seqs = parseBiobrick(file);

    expect(seqs).toEqual([
      {
        annotations: [
          {
            direction: 1,
            end: 8,
            name: "forward-5",
            start: 5,
            type: "conserved",
          },
        ],
        name: "BBa_B0034",
        seq: "aaagaggagaaa",
        type: "dna",
      },
    ]);
  });
});

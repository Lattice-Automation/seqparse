import fetchFile from "./fetchFile";

describe("Fetches files", () => {
  // test import of some known seqs against their expected properties

  // test a couple files with a known number of annotations/seq length/name
  // etc to test that it's parsing correctly
  // just check that the name, annotation count and sequence length are correct
  const knownGenbanks = {
    // BBa_J23100: {
    //   annotationCount: 1,
    //   name: "BBa_J23100", // one annotation for pSB1C3
    //   seqLength: 35 + 2070, // J23100 + pSB1C3
    // },
    // FJ172221: {
    //   annotationCount: 5,
    //   name: "FJ172221",
    //   seqLength: 6062,
    // },
    // NC_011521: {
    //   annotationCount: 22,
    //   name: "NC_011521",
    //   seqLength: 6062,
    // },
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownGenbanks).forEach(file => {
    it(`imports ${file}`, async () => {
      const { annotationCount, name, seqLength } = knownGenbanks[file];

      const result = await fetchFile(file);

      expect(result).toBeDefined();
      expect(result.seq).toHaveLength(seqLength);
      expect(result.annotations).toHaveLength(annotationCount);
      expect(result.annotations.map(a => a.name)).not.toContain("Untitled");
      expect(result.name).toMatch(name);
    });
  });

  it("throws error for bad accession", async () => {
    try {
      const seqs = await fetchFile("asdf");
      fail(`error expected, seqs returned: ${seqs}`);
    } catch (err) {
      // expected
    }
  });
});

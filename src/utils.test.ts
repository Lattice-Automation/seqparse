import { complement, guessType, parseDirection, reverseComplement } from "./utils";

describe("Parse seq input", () => {
  it("parses DNA seq and compSeq", () => {
    const inSeq =
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg";

    const { compSeq, seq } = complement(inSeq);

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual(
      "tgtgctaacgggctgcctaagtactctacagtccggcgtttcccgcggaccaccgCTACTTAACGCGCCGGTAAGGCCTCAGGGAGCggctctcgctcaataagccgcaccagtcgccacggatgtggccgcgactagcgaggtctcagc"
    );
  });

  it("returns the reverse complement", () => {
    const revCompSeq = reverseComplement(
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg"
    );

    expect(revCompSeq).toEqual(
      "cgactctggagcgatcagcgccggtgtaggcaccgctgaccacgccgaataactcgctctcggCGAGGGACTCCGGAATGGCCGCGCAATTCATCgccaccaggcgccctttgcggcctgacatctcatgaatccgtcgggcaatcgtgt"
    );
  });

  it("parses directionality from multiple formats", () => {
    expect(parseDirection("FWD")).toEqual(1);
    expect(parseDirection("FORWARD")).toEqual(1);
    expect(parseDirection(1)).toEqual(1);
    expect(parseDirection("1")).toEqual(1);
    expect(parseDirection("test")).toEqual(0);
    expect(parseDirection("NONE")).toEqual(0);
    expect(parseDirection("REVERSE")).toEqual(-1);
    expect(parseDirection("REV")).toEqual(-1);
    expect(parseDirection(-1)).toEqual(-1);
    expect(parseDirection("-1")).toEqual(-1);
  });

  it("detects type", () => {
    const types = {
      KNTRSPRFLE: "aa",
      _fajsi: "unknown",
      atgagcAGTA: "dna",
      atugc: "unknown",
      augagcAGUAa: "rna",
      "kInm*": "aa",
      tgatcaaacctaaagagtgggacagagagtactactatattcgtttcactcgccnaaaagttttgaac: "dna",
      ttgacggctagctcagtcctaggtacagtgctagc: "dna",
    };

    Object.keys(types).forEach(k => {
      expect(guessType(k)).toEqual(types[k]);
    });
  });
});

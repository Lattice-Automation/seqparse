import * as fs from "fs";

import parseFile, { ParseOptions } from "./parseFile";

describe("Parses files", () => {
  const types = ["benchling", "biobrick", "fasta", "genbank", "jbei", "sbol/v1", "sbol/v2", "seqbuilder", "snapgene"];
  const folders = types.map(t => `${__dirname}/examples/${t}`);

  // key is type/file-name, value is it's path
  const allFiles = folders.reduce((acc, dir, i) => {
    fs.readdirSync(dir).forEach(f => {
      acc[`${types[i]}/${f}`] = `${dir}/${f}`;
    });
    return acc;
  }, {});

  // loop through every file. don't fail on any of them
  Object.keys(allFiles)
    .filter(f => !f.includes("empty"))
    .forEach((file, i) => {
      it(`parses: ${file} ${i}`, async () => {
        const fileString = fs.readFileSync(allFiles[file], "utf8");

        const result = await parseFile(fileString, allFiles[file]);

        expect(typeof result).toEqual(typeof []);
        expect(typeof result[0]).toEqual(typeof {});
        expect(result[0].name).toMatch(/.{2,}/);
        expect(result[0].seq.length).toBeGreaterThan(0);
      });
    });

  // https://github.com/Lattice-Automation/seqviz/issues/117
  it("handles single bp annotations", async () => {
    const result = await parseFile(fs.readFileSync(allFiles["genbank/testGenbankFile.2.gb"], "utf8"));

    expect(result.length).toEqual(1);
    const annotation = result[0].annotations[1];
    expect(annotation.start).toEqual(499);
    expect(annotation.end).toEqual(500);
  });

  // https://github.com/Lattice-Automation/seqviz/issues/166

  /**
   * table-test of file names to expected output
   */
  Object.entries({
    "sbol/v2/singleSequence.xml": [
      {
        name: "pLacSeq",
        seq: "ACGTURYSWKMBDHVN",
        annotations: [],
        type: "unknown",
      },
    ],
    "sbol/v2/CreateAndRemoveModel.xml": [
      {
        name: "someSequence",
        seq: "ACGTURYSWKMBDHVN",
        annotations: [],
        type: "unknown",
      },
    ],
    "sbol/v2/BBa_I0462.xml": [
      {
        name: "BBa_I0462",
        seq: "aaagaggagaaatactagatgaaaaacataaatgccgacgacacatacagaataattaataaaattaaagcttgtagaagcaataatgatattaatcaatgcttatctgatatgactaaaatggtacattgtgaatattatttactcgcgatcatttatcctcattctatggttaaatctgatatttcaatcctagataattaccctaaaaaatggaggcaatattatgatgacgctaatttaataaaatatgatcctatagtagattattctaactccaatcattcaccaattaattggaatatatttgaaaacaatgctgtaaataaaaaatctccaaatgtaattaaagaagcgaaaacatcaggtcttatcactgggtttagtttccctattcatacggctaacaatggcttcggaatgcttagttttgcacattcagaaaaagacaactatatagatagtttatttttacatgcgtgtatgaacataccattaattgttccttctctagttgataattatcgaaaaataaatatagcaaataataaatcaaacaacgatttaaccaaaagagaaaaagaatgtttagcgtgggcatgcgaaggaaaaagctcttgggatatttcaaaaatattaggttgcagtgagcgtactgtcactttccatttaaccaatgcgcaaatgaaactcaatacaacaaaccgctgccaaagtatttctaaagcaattttaacaggagcaattgattgcccatactttaaaaattaataacactgatagtgctagtgtagatcactactagagccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttata",
        annotations: [
          {
            name: "BBa_B0034_annotation",
            start: 0,
            end: 11,
          },
          {
            name: "BBa_C0062_annotation",
            start: 18,
            end: 773,
          },
          {
            name: "BBa_B0015_annotation",
            start: 807,
            end: 935,
          },
        ],
        type: "dna",
      },
    ],
    "benchling/benchling1.json": [
      {
        name: "AF090832",
        type: "dna",
        seq: "tgatcaaacctaaagagtgggacagagagtactactatattcgtttcactcgccaaaagttttgaac",
        annotations: [
          {
            direction: -1,
            name: "Mlp84B protein_bind",
            end: 2344,
            start: 2334,
            color: "#F58A5E",
            type: "protein_bind",
          },
          {
            direction: 0,
            end: 2946,
            start: 2867,
            name: "Mlp84B 5'UTR",
            color: "#F8D3A9",
            type: "5'UTR",
          },
          {
            direction: 1,
            end: 4655,
            start: 2867,
            name: "Mlp84B mRNA",
            color: "#9EAFD2",
            type: "mRNA",
          },
          {
            direction: 0,
            end: 4964,
            start: 4954,
            color: "#9EAFD2",
            name: "Mlp84B protein_bind",
            type: "protein_bind",
          },
        ],
      },
    ],
    "biobrick/iGEM.BioBrick.xml": [
      {
        name: "BBa_B0034",
        type: "dna",
        seq: "aaagaggagaaa",
        annotations: [
          {
            name: "forward-5",
            start: 5,
            end: 8,
            type: "conserved",
            direction: 1,
          },
        ],
      },
    ],
    "fasta/multi_test.fas": [
      { name: "Sequence_1", type: "dna", seq: "ACTGCCCCCCCCC", annotations: [] },
      { name: "Sequence_2", type: "dna", seq: "GTCAgggggggggg", annotations: [] },
    ],
    "genbank/pBbE0c-RFP_1.gb": [
      {
        name: "pBbE0c-RFP",
        type: "dna",
        seq: "cagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagttcatgcgtttcaaagttcgtatggaaggttccgttaacggtcacgagttcgaaatcgaaggtgaaggtgaaggtcgtccgtacgaaggtacccagaccgctaaactgaaagttaccaaaggtggtccgctgccgttcgcttgggacatcctgtccccgcagttccagtacggttccaaagcttacgttaaacacccggctgacatcccggactacctgaaactgtccttcccggaaggtttcaaatgggaacgtgttatgaacttcgaagacggtggtgttgttaccgttacccaggactcctccctgcaagacggtgagttcatctacaaagttaaactgcgtggtaccaacttcccgtccgacggtccggttatgcagaaaaaaaccatgggttgggaagcttccaccgaacgtatgtacccggaagacggtgctctgaaaggtgaaatcaaaatgcgtctgaaactgaaagacggtggtcactacgacgctgaagttaaaaccacctacatggctaaaaaaccggttcagctgccgggtgcttacaaaaccgacatcaaactggacatc",
        annotations: [
          {
            direction: -1,
            end: 564,
            name: "colE1 origin",
            start: 1201,
            type: "rep_origin",
          },
          {
            direction: 1,
            end: 15,
            name: "T0",
            start: 1889,
            type: "terminator",
          },
          {
            direction: -1,
            end: 30,
            name: "CmR",
            start: 2010,
            type: "gene",
          },
          {
            direction: 1,
            end: 255,
            name: "RFP cassette",
            start: 2811,
            type: "gene",
          },
        ],
      },
    ],
    "jbei/pBbE0c-RFP.linear.seq": [
      {
        name: "pBbE0c-RFP",
        type: "dna",
        seq: "cagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagttcatgcgtttcaaagttcgtatggaaggttccgttaacggtcacgagttcgaaatcgaaggtgaaggtgaaggtcgtccgtacgaaggtacccagaccgctaaactgaaagttaccaaaggtggtccgctgccgttcgcttgggacatcctgtccccgcagttccagtacggttccaaagcttacgttaaacacccggctgacatcccggactacctgaaactgtccttcccggaaggtttcaaatgggaacgtgttatgaacttcgaagacggtggtgttgttaccgttacccaggactcctccctgcaagacggtgagttcatctacaaagttaaactgcgtggtaccaactt",
        annotations: [
          {
            name: "colE1 origin",
            start: 1201,
            end: 1884,
            direction: -1,
            type: "rep_origin",
            color: undefined,
          },
          {
            name: "T0",
            start: 1889,
            end: 1995,
            direction: 1,
            type: "terminator",
            color: undefined,
          },
          {
            name: "CmR",
            start: 2010,
            end: 2670,
            direction: -1,
            type: "gene",
            color: undefined,
          },
          {
            name: "RFP cassette",
            start: 2811,
            end: 915,
            direction: 1,
            type: "gene",
            color: undefined,
          },
        ],
      },
    ],
    "snapgene/pBbB8c-GFP.dna": [
      {
        name: "pBbB8c-GFP",
        seq: "gacgtcttatgacaacttgacggctacatcattcactttttcttcacaaccggcacggaactcgctcgggctggccccggtgcattttttaaatacccgcgagaaatagagttgatcgtcaaaaccaacattgcgaccgacggtggcgataggcatccgggtggtgctcaaaagcagcttcgcctggctgatacgttggtcctcgcgccagcttaagacgctaatccctaactgctggcggaaaagatgtgacagacgcgacggcgacaagcaaacatgctgtgcgacgctggcgatatcaaaattgctgtctgccaggtgatcgctgatgtactgacaagcctcgcgtacccgattatccatcggtggatggagcgactcgttaatcgcttccatgcgccgcagtaacaattgctcaagcagatttatcgccagcagctccgaatagcgcccttccccttgcccggcgttaatgatttgcccaaacaggtcgctgaaatgcggctggtgcgcTtcatccgggcgaaagaaccccgtattggcaaatattgacggccagttaagccattcatgccagtaggcgcgcggacgaaagtaaacccactggtgataccattcgcgagcctccggatgacgaccgtagtgatgaatctctcctggcgggaacagcaaaatatcacccggtcggcaaacaaattctcgtccctgatttttcaccaccccctgaccgcgaatggtgagattgagaatataacctttcattcccagcggtcggtcgataaaaaaatcgagataaccgttggcctcaatcggcgttaaacccgccaccagatgggcattaaacgagtatcccggcagcaggggatcattttgcgcttcagccatacttttcatactcccgccattcagagaagaaaccaattgtccatattgcatcagacattgccgtcactgcgtcttttactggctcttctcgctaaccaaaccggtaaccccgcttattaaaagcattctgtaacaaagcgggaccaaagccatgacaaaaacgcgtaacaaaagtgtctataatcacggcagaaaagtccacattgattatttgcacggcgtcacactttgctatgtttttttgggaattcaaaagatcttttaagaaggagatatacatatgagtaaaggagaagaacttttcactggagttgtcccaattcttgttgaattagatggtgatgttaaGgggcacaaattttctgtcagtggagagggtgaaggtgatgcaacatacggaaaacttacccttaaatttatttgcactactggaaaactacctgttccgtggccaacacttgtcactactttctcttatggtgttcaatgcttttcccgttatccggatcacatgaaacggcatgactttttcaagagtgccatgcccgaaggttatgtacaggaacgcactatatctttcaaagatgacgggaactacaagacgcgtgctgaagtcaagtttgaaggtgatacccttgttaatcgtatcgagttaaaaggtattgattttaaagaagatggaaacattctcggacacaaactggagtacaactataactcacacaatgtatacatcacggcagacaaacaaaagaatggaatcaaagctaacttcaaaattcgccacaacattgaagatggctccgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtccacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctctacaaataaggatccaaactcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctaggctacagccgatagtctggaacagcgcacttacgggttgctgcgcaacccaagtgctaccggcgcggcagcgtgacccgtgtcggcggctccaacggctcgccatcgtccagaaaacacggctcatcgggcatcggcaggcgctgctgcccgcgccgttcccattcctccgtttcggtcaaggctggcaggtctggttccatgcccggaatgccgggctggctgggcggctcctcgccggggccggtcggtagttgctgctcgcccggatacagggtcgggatgcggcgcaggtcgccatgccccaacagcgattcgtcctggtcgtcgtgatcaaccaccacggcggcactgaacaccgacaggcgcaactggtcgcggggctggccccacgccacgcggtcattgaccacgtaggccaacacggtgccggggccgttgcttggaaagtgtcttctggctgaccaccacggcgttctggtggcccatctgcgccacgaggtgatgcagcagcattgccgccgtgggtttcctcgcaataagcccggcccacgcctcatgcgctttgcgttccgtttgcacccagtgaccgggcttgttcttggcttgaatgccgatttctctggactgcgtggccatgcttatctccatgcggtaggggtgccgcacggttgcggcaccatgcgcaatcagctgcaacttttcggcagcgcgacaacaattatgcgttgcgtaaaagtggcagtcaattacagattttctttaacctacgcaatgagctattgcggggggtgccgcaatgagctgttgcgtaccccccttttttaagttgttgatttttaagtctttcgcatttcgccctatatctagttctttggtgcccaaagaagggcacccctgcggggttcccccacgccttcggcgcggctccccctccggcaaaaagtggcccctccggggcttgttgatcgactgcgcggccttcggccttgcccaaggtggcgctgcccccttggaacccccgcactcgccgccgtgaggctcggggggcaggcgggcgggcttcgcccttcgactgcccccactcgcataggcttgggtcgttccaggcgcgtcaaggccaagccgctgcgcggtcgctgcgcgagccttgacccgccttccacttggtgtccaaccggcaagcgaagcgcgcaggccgcaggccggaggcactagtgcttggattctcaccaataaaaaacgcccggcggcaaccgagcgttctgaacaaaCccagatggagttctgaggtcattactggatctatcaacaggagtccaagcgagctcgatatcaaattacgccccgccctgccactcatcgcagtactgttgtaattcattaagcattctgccgacatggaagccatcacaaacggcatgatgaacctgaatcgccagcggcatcagcaccttgtcgccttgcgtataatatttgcccatggtgaaaacgggggcgaagaagttgtccatattggccacgtttaaatcaaaactggtgaaactcacccagggattggctgagacgaaaaacatattctcaataaaccctttagggaaataggccaggttttcaccgtaacacgccacatcttgcgaatatatgtgtagaaactgccggaaatcgtcgtggtattcactccagagcgatgaaaacgtttcagtttgctcatggaaaacggtgtaacaagggtgaacactatcccatatcaccagctcaccgtctttcattgccatacgaaattccggatgagcattcatcaggcgggcaagaatgtgaataaaggccggataaaacttgtgcttatttttctttacggtctttaaaaaggccgtaatatccagctgaacggtctggttataggtacattgagcaactgactgaaatgcctcaaaatgttctttacgatgccattgggatatatcaacggtggtatatccagtgatttttttctccattttagcttccttagctcctgaaaatctcgataactcaaaaaatacgcccggtagtgatcttatttcattatggtgaaagttggaacctcttacgtgccgatcaacgtctcattttcgccagatatc",
        type: "dna",
        annotations: [
          {
            name: "araC",
            start: 6,
            end: 884,
            direction: -1,
            type: "CDS",
          },
          {
            name: "GFPuv",
            start: 1165,
            end: 1881,
            direction: 1,
            type: "CDS",
          },
          {
            name: "rrnB T1 terminator",
            start: 1914,
            end: 1985,
            direction: 0,
            type: "terminator",
          },
          {
            name: "T7Te terminator",
            start: 2001,
            end: 2028,
            direction: 0,
            type: "terminator",
          },
          {
            name: "lambda t0 terminator",
            start: 3264,
            end: 3358,
            direction: 0,
            type: "terminator",
          },
          {
            name: "CmR",
            start: 3379,
            end: 4038,
            direction: -1,
            type: "CDS",
          },
          {
            name: "cat promoter",
            start: 4039,
            end: 4141,
            direction: -1,
            type: "promoter",
          },
        ],
      },
    ],
  }).forEach(([name, e]) => {
    it(`meets expectations: ${name}`, async () => {
      const parseOptions = {} as ParseOptions;
      parseOptions.source = fs.readFileSync(allFiles[name]);
      parseOptions.fileName = name;

      const result = await parseFile((parseOptions.source as Buffer).toString("utf8"), parseOptions);

      expect(result).toEqual(e);
    });
  });
});

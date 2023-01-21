import * as fs from "fs";

import { ParseOptions } from ".";
import parseFile from "./parseFile";

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
    "benchling/benchling1.json": [
      {
        annotations: [
          {
            color: "#F58A5E",
            direction: -1,
            end: 2344,
            name: "Mlp84B protein_bind",
            start: 2334,
            type: "protein_bind",
          },
          {
            color: "#F8D3A9",
            direction: 0,
            end: 2946,
            name: "Mlp84B 5'UTR",
            start: 2867,
            type: "5'UTR",
          },
          {
            color: "#9EAFD2",
            direction: 1,
            end: 4655,
            name: "Mlp84B mRNA",
            start: 2867,
            type: "mRNA",
          },
          {
            color: "#9EAFD2",
            direction: 0,
            end: 4964,
            name: "Mlp84B protein_bind",
            start: 4954,
            type: "protein_bind",
          },
        ],
        name: "AF090832",
        seq: "tgatcaaacctaaagagtgggacagagagtactactatattcgtttcactcgccaaaagttttgaac",
        type: "dna",
      },
    ],
    "biobrick/iGEM.BioBrick.xml": [
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
    ],
    "fasta/multi_test.fas": [
      { annotations: [], name: "Sequence_1", seq: "ACTGCCCCCCCCC", type: "dna" },
      { annotations: [], name: "Sequence_2", seq: "GTCAgggggggggg", type: "dna" },
    ],
    "genbank/pBbE0c-RFP_1.gb": [
      {
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
        name: "pBbE0c-RFP",
        seq: "cagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagttcatgcgtttcaaagttcgtatggaaggttccgttaacggtcacgagttcgaaatcgaaggtgaaggtgaaggtcgtccgtacgaaggtacccagaccgctaaactgaaagttaccaaaggtggtccgctgccgttcgcttgggacatcctgtccccgcagttccagtacggttccaaagcttacgttaaacacccggctgacatcccggactacctgaaactgtccttcccggaaggtttcaaatgggaacgtgttatgaacttcgaagacggtggtgttgttaccgttacccaggactcctccctgcaagacggtgagttcatctacaaagttaaactgcgtggtaccaacttcccgtccgacggtccggttatgcagaaaaaaaccatgggttgggaagcttccaccgaacgtatgtacccggaagacggtgctctgaaaggtgaaatcaaaatgcgtctgaaactgaaagacggtggtcactacgacgctgaagttaaaaccacctacatggctaaaaaaccggttcagctgccgggtgcttacaaaaccgacatcaaactggacatc",
        type: "dna",
      },
    ],
    "genbank/pBbS0c-RFP.gb": [
      {
        annotations: [],
        name: "pBbS0c-RFP",
        seq: "ttgacagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagttcatgcgtttcaaagttcgtatggaaggttccgttaacggtcacgagttcgaaatcgaaggtgaaggtgaaggtcgtccgtacgaaggtacccagaccgctaaactgaaagttaccaaaggtggtccgctgccgttcgcttgggacatcctgtccccgcagttccagtacggttccaaagcttacgttaaacacccggctgacatcccggactacctgaaactgtccttcccggaaggtttcaaatgggaacgtgttatgaacttcgaagacggtggtgttgttaccgttacccaggactcctccctgcaagacggtgagttcatctacaaagttaaactgcgtggtaccaacttcccgtccgacggtccggttatgcagaaaaaaaccatgggttgggaagcttccaccgaacgtatgtacccggaagacggtgctctgaaaggtgaaatcaaaatgcgtctgaaactgaaagacggtggtcactacgacgctgaagttaaaaccacctacatggctaaaaaaccggttcagctgccgggtgcttacaaaaccgacatcaaactggacatcacctcccacaacgaagactacaccatcgttgaacagtacgaacgtgctgaaggtcgtcactccaccggtgcttaataacgctgatagtgctagtgtagatcgctactagagccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatatactagaagcggccgggatcctaactcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgtttttgcgtgagccatgagaacgaaccattgagatcatacttactttgcatgtcactcaaaaattttgcctcaaaactggtgagctgaatttttgcagttaaagcatcgtgtagtgtttttcttagtccgttatgtaggtaggaatctgatgtaatggttgttggtattttgtcaccattcatttttatctggttgttctcaagttcggttacgagatccatttgtctatctagttcaacttggaaaatcaacgtatcagtcgggcggcctcgcttatcaaccaccaatttcatattgctgtaagtgtttaaatctttacttattggtttcaaaacccattggttaagccttttaaactcatggtagttattttcaagcattaacatgaacttaaattcatcaaggctaatctctatatttgccttgtgagttttcttttgtgttagttcttttaataaccactcataaatcctcatagagtatttgttttcaaaagacttaacatgttccagattatattttatgaatttttttaactggaaaagataaggcaatatctcttcactaaaaactaattctaatttttcgcttgagaacttggcatagtttgtccactggaaaatctcaaagcctttaaccaaaggattcctgatttccacagttctcgtcatcagctctctggttgctttagctaatacaccataagcattttccctactgatgttcatcatctgagcgtattggttataagtgaacgataccgtccgttctttccttgtagggttttcaatcgtggggttgagtagtgccacacagcataaaattagcttggtttcatgctccgttaagtcatagcgactaatcgctagttcatttgctttgaaaacaactaattcagacatacatctcaattggtctaggtgattttaatcactataccaattgagatgggctagtcaatgataattactagtccttttcccgggtgatctgggtatctgtaaattctgctagacctttgctggaaaacttgtaaattctgctagaccctctgtaaattccgctagacctttgtgtgttttttttgtttatattcaagtggttataatttatagaataaagaaagaataaaaaaagataaaaagaatagatcccagccctgtgtataactcactactttagtcagttccgcagtattacaaaaggatgtcgcaaacgctgtttgctcctctacaaaacagaccttaaaaccctaaaggcttaagtagcaccctcgcaagctcgggcaaatcgctgaatattccttttgtctccgaccatcaggcacctgagtcgctgtctttttcgtgacattcagttcgctgcgctcacggctctggcagtgaatgggggtaaatggcactacaggcgccttttatggattcatgcaaggaaactacccataatacaagaaaagcccgtcacgggcttctcagggcgttttatggcgggtctgctatgtggtgctatctgactttttgctgttcagcagttcctgccctctgattttccagtctgaccacttcggattatcccgtgacaggtcattcagactggctaatgcacccagtaaggcagcggtatcatcaacaggcttacccgtcttactgtccctagtgcttggattctcaccaataaaaaacgcccggcggcaaccgagcgttctgaacaaatccagatggagttctgaggtcattactggatctatcaacaggagtccaagcgagctcgatatcaaattacgccccgccctgccactcatcgcagtactgttgtaattcattaagcattctgccgacatggaagccatcacaaacggcatgatgaacctgaatcgccagcggcatcagcaccttgtcgccttgcgtataatatttgcccatggtgaaaacgggggcgaagaagttgtccatattggccacgtttaaatcaaaactggtgaaactcacccagggattggctgagacgaaaaacatattctcaataaaccctttagggaaataggccaggttttcaccgtaacacgccacatcttgcgaatatatgtgtagaaactgccggaaatcgtcgtggtattcactccagagcgatgaaaacgtttcagtttgctcatggaaaacggtgtaacaagggtgaacactatcccatatcaccagctcaccgtctttcattgccatacgaaattccggatgagcattcatcaggcgggcaagaatgtgaataaaggccggataaaacttgtgcttatttttctttacggtctttaaaaaggccgtaatatccagctgaacggtctggttataggtacattgagcaactgactgaaatgcctcaaaatgttctttacgatgccattgggatatatcaacggtggtatatccagtgatttttttctccattttagcttccttagctcctgaaaatctcgataactcaaaaaatacgcccggtagtgatcttatttcattatggtgaaagttggaacctcttacgtgccgatcaacgtctcattttcgccagatatcgaattcatgagatct",
        type: "dna",
      },
    ],
    "jbei/pBbE0c-RFP.linear.seq": [
      {
        annotations: [
          {
            color: undefined,
            direction: -1,
            end: 1884,
            name: "colE1 origin",
            start: 1201,
            type: "rep_origin",
          },
          {
            color: undefined,
            direction: 1,
            end: 1995,
            name: "T0",
            start: 1889,
            type: "terminator",
          },
          {
            color: undefined,
            direction: -1,
            end: 2670,
            name: "CmR",
            start: 2010,
            type: "gene",
          },
          {
            color: undefined,
            direction: 1,
            end: 915,
            name: "RFP cassette",
            start: 2811,
            type: "gene",
          },
        ],
        name: "pBbE0c-RFP",
        seq: "cagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagttcatgcgtttcaaagttcgtatggaaggttccgttaacggtcacgagttcgaaatcgaaggtgaaggtgaaggtcgtccgtacgaaggtacccagaccgctaaactgaaagttaccaaaggtggtccgctgccgttcgcttgggacatcctgtccccgcagttccagtacggttccaaagcttacgttaaacacccggctgacatcccggactacctgaaactgtccttcccggaaggtttcaaatgggaacgtgttatgaacttcgaagacggtggtgttgttaccgttacccaggactcctccctgcaagacggtgagttcatctacaaagttaaactgcgtggtaccaactt",
        type: "dna",
      },
    ],
    "sbol/v1/example.xml": [
      {
        annotations: [
          {
            direction: 1,
            end: 18,
            name: "TetR 1",
            start: 0,
            type: "http://purl.obolibrary.org/obo/SO_0000409",
          },
        ],
        name: "T9002",
        seq: "tcc",
        type: "dna",
      },
    ],
    "sbol/v1/j5.SBOL.xml": [
      {
        annotations: [
          {
            direction: 1,
            end: 62,
            name: "signal_peptide",
            start: 0,
            type: "http://purl.obolibrary.org/obo/SO_0000316",
          },
        ],
        name: "signal_pep",
        seq: "ggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgc",
        type: "dna",
      },
    ],
    "sbol/v2/BBa_I0462.xml": [
      {
        annotations: [
          {
            end: 11,
            name: "BBa_B0034_annotation",
            start: 0,
          },
          {
            end: 773,
            name: "BBa_C0062_annotation",
            start: 18,
          },
          {
            end: 935,
            name: "BBa_B0015_annotation",
            start: 807,
          },
        ],
        name: "BBa_I0462",
        seq: "aaagaggagaaatactagatgaaaaacataaatgccgacgacacatacagaataattaataaaattaaagcttgtagaagcaataatgatattaatcaatgcttatctgatatgactaaaatggtacattgtgaatattatttactcgcgatcatttatcctcattctatggttaaatctgatatttcaatcctagataattaccctaaaaaatggaggcaatattatgatgacgctaatttaataaaatatgatcctatagtagattattctaactccaatcattcaccaattaattggaatatatttgaaaacaatgctgtaaataaaaaatctccaaatgtaattaaagaagcgaaaacatcaggtcttatcactgggtttagtttccctattcatacggctaacaatggcttcggaatgcttagttttgcacattcagaaaaagacaactatatagatagtttatttttacatgcgtgtatgaacataccattaattgttccttctctagttgataattatcgaaaaataaatatagcaaataataaatcaaacaacgatttaaccaaaagagaaaaagaatgtttagcgtgggcatgcgaaggaaaaagctcttgggatatttcaaaaatattaggttgcagtgagcgtactgtcactttccatttaaccaatgcgcaaatgaaactcaatacaacaaaccgctgccaaagtatttctaaagcaattttaacaggagcaattgattgcccatactttaaaaattaataacactgatagtgctagtgtagatcactactagagccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttata",
        type: "dna",
      },
    ],
    "sbol/v2/CreateAndRemoveModel.xml": [
      {
        annotations: [],
        name: "someSequence",
        seq: "ACGTURYSWKMBDHVN",
        type: "unknown",
      },
    ],
    "sbol/v2/singleSequence.xml": [
      {
        annotations: [],
        name: "pLacSeq",
        seq: "ACGTURYSWKMBDHVN",
        type: "unknown",
      },
    ],
    "snapgene/pBbB8c-GFP.dna": [
      {
        annotations: [
          {
            direction: -1,
            end: 884,
            name: "araC",
            start: 6,
            type: "CDS",
          },
          {
            direction: 1,
            end: 1881,
            name: "GFPuv",
            start: 1165,
            type: "CDS",
          },
          {
            direction: 0,
            end: 1985,
            name: "rrnB T1 terminator",
            start: 1914,
            type: "terminator",
          },
          {
            direction: 0,
            end: 2028,
            name: "T7Te terminator",
            start: 2001,
            type: "terminator",
          },
          {
            direction: 0,
            end: 3358,
            name: "lambda t0 terminator",
            start: 3264,
            type: "terminator",
          },
          {
            direction: -1,
            end: 4038,
            name: "CmR",
            start: 3379,
            type: "CDS",
          },
          {
            direction: -1,
            end: 4141,
            name: "cat promoter",
            start: 4039,
            type: "promoter",
          },
        ],
        name: "pBbB8c-GFP",
        seq: "gacgtcttatgacaacttgacggctacatcattcactttttcttcacaaccggcacggaactcgctcgggctggccccggtgcattttttaaatacccgcgagaaatagagttgatcgtcaaaaccaacattgcgaccgacggtggcgataggcatccgggtggtgctcaaaagcagcttcgcctggctgatacgttggtcctcgcgccagcttaagacgctaatccctaactgctggcggaaaagatgtgacagacgcgacggcgacaagcaaacatgctgtgcgacgctggcgatatcaaaattgctgtctgccaggtgatcgctgatgtactgacaagcctcgcgtacccgattatccatcggtggatggagcgactcgttaatcgcttccatgcgccgcagtaacaattgctcaagcagatttatcgccagcagctccgaatagcgcccttccccttgcccggcgttaatgatttgcccaaacaggtcgctgaaatgcggctggtgcgcTtcatccgggcgaaagaaccccgtattggcaaatattgacggccagttaagccattcatgccagtaggcgcgcggacgaaagtaaacccactggtgataccattcgcgagcctccggatgacgaccgtagtgatgaatctctcctggcgggaacagcaaaatatcacccggtcggcaaacaaattctcgtccctgatttttcaccaccccctgaccgcgaatggtgagattgagaatataacctttcattcccagcggtcggtcgataaaaaaatcgagataaccgttggcctcaatcggcgttaaacccgccaccagatgggcattaaacgagtatcccggcagcaggggatcattttgcgcttcagccatacttttcatactcccgccattcagagaagaaaccaattgtccatattgcatcagacattgccgtcactgcgtcttttactggctcttctcgctaaccaaaccggtaaccccgcttattaaaagcattctgtaacaaagcgggaccaaagccatgacaaaaacgcgtaacaaaagtgtctataatcacggcagaaaagtccacattgattatttgcacggcgtcacactttgctatgtttttttgggaattcaaaagatcttttaagaaggagatatacatatgagtaaaggagaagaacttttcactggagttgtcccaattcttgttgaattagatggtgatgttaaGgggcacaaattttctgtcagtggagagggtgaaggtgatgcaacatacggaaaacttacccttaaatttatttgcactactggaaaactacctgttccgtggccaacacttgtcactactttctcttatggtgttcaatgcttttcccgttatccggatcacatgaaacggcatgactttttcaagagtgccatgcccgaaggttatgtacaggaacgcactatatctttcaaagatgacgggaactacaagacgcgtgctgaagtcaagtttgaaggtgatacccttgttaatcgtatcgagttaaaaggtattgattttaaagaagatggaaacattctcggacacaaactggagtacaactataactcacacaatgtatacatcacggcagacaaacaaaagaatggaatcaaagctaacttcaaaattcgccacaacattgaagatggctccgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtccacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctctacaaataaggatccaaactcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctaggctacagccgatagtctggaacagcgcacttacgggttgctgcgcaacccaagtgctaccggcgcggcagcgtgacccgtgtcggcggctccaacggctcgccatcgtccagaaaacacggctcatcgggcatcggcaggcgctgctgcccgcgccgttcccattcctccgtttcggtcaaggctggcaggtctggttccatgcccggaatgccgggctggctgggcggctcctcgccggggccggtcggtagttgctgctcgcccggatacagggtcgggatgcggcgcaggtcgccatgccccaacagcgattcgtcctggtcgtcgtgatcaaccaccacggcggcactgaacaccgacaggcgcaactggtcgcggggctggccccacgccacgcggtcattgaccacgtaggccaacacggtgccggggccgttgcttggaaagtgtcttctggctgaccaccacggcgttctggtggcccatctgcgccacgaggtgatgcagcagcattgccgccgtgggtttcctcgcaataagcccggcccacgcctcatgcgctttgcgttccgtttgcacccagtgaccgggcttgttcttggcttgaatgccgatttctctggactgcgtggccatgcttatctccatgcggtaggggtgccgcacggttgcggcaccatgcgcaatcagctgcaacttttcggcagcgcgacaacaattatgcgttgcgtaaaagtggcagtcaattacagattttctttaacctacgcaatgagctattgcggggggtgccgcaatgagctgttgcgtaccccccttttttaagttgttgatttttaagtctttcgcatttcgccctatatctagttctttggtgcccaaagaagggcacccctgcggggttcccccacgccttcggcgcggctccccctccggcaaaaagtggcccctccggggcttgttgatcgactgcgcggccttcggccttgcccaaggtggcgctgcccccttggaacccccgcactcgccgccgtgaggctcggggggcaggcgggcgggcttcgcccttcgactgcccccactcgcataggcttgggtcgttccaggcgcgtcaaggccaagccgctgcgcggtcgctgcgcgagccttgacccgccttccacttggtgtccaaccggcaagcgaagcgcgcaggccgcaggccggaggcactagtgcttggattctcaccaataaaaaacgcccggcggcaaccgagcgttctgaacaaaCccagatggagttctgaggtcattactggatctatcaacaggagtccaagcgagctcgatatcaaattacgccccgccctgccactcatcgcagtactgttgtaattcattaagcattctgccgacatggaagccatcacaaacggcatgatgaacctgaatcgccagcggcatcagcaccttgtcgccttgcgtataatatttgcccatggtgaaaacgggggcgaagaagttgtccatattggccacgtttaaatcaaaactggtgaaactcacccagggattggctgagacgaaaaacatattctcaataaaccctttagggaaataggccaggttttcaccgtaacacgccacatcttgcgaatatatgtgtagaaactgccggaaatcgtcgtggtattcactccagagcgatgaaaacgtttcagtttgctcatggaaaacggtgtaacaagggtgaacactatcccatatcaccagctcaccgtctttcattgccatacgaaattccggatgagcattcatcaggcgggcaagaatgtgaataaaggccggataaaacttgtgcttatttttctttacggtctttaaaaaggccgtaatatccagctgaacggtctggttataggtacattgagcaactgactgaaatgcctcaaaatgttctttacgatgccattgggatatatcaacggtggtatatccagtgatttttttctccattttagcttccttagctcctgaaaatctcgataactcaaaaaatacgcccggtagtgatcttatttcattatggtgaaagttggaacctcttacgtgccgatcaacgtctcattttcgccagatatc",
        type: "dna",
      },
    ],
  }).forEach(([name, e]) => {
    it(`parses correctly: ${name}`, async () => {
      const parseOptions = {} as ParseOptions;
      parseOptions.source = fs.readFileSync(allFiles[name]);
      parseOptions.fileName = name;

      const result = await parseFile((parseOptions.source as Buffer).toString("utf8"), parseOptions);

      expect(result).toEqual(e);
    });
  });
});

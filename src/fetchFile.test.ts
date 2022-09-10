import fetchFile from "./fetchFile";

describe("Fetches files", () => {
  Object.entries({
    BBa_J23100: {
      annotations: [],
      name: "BBa_J23100",
      seq: "ttgacggctagctcagtcctaggtacagtgctagc",
      type: "dna",
    },
    NC_011521: {
      annotations: [
        {
          direction: -1,
          end: 285,
          name: "HS566_RS00005",
          start: 6,
          type: "gene",
        },
        {
          direction: -1,
          end: 285,
          name: "HS566_RS00005",
          start: 6,
          type: "CDS",
        },
        {
          direction: -1,
          end: 470,
          name: "HS566_RS00010",
          start: 284,
          type: "gene",
        },
        {
          direction: -1,
          end: 470,
          name: "HS566_RS00010",
          start: 284,
          type: "CDS",
        },
        {
          direction: -1,
          end: 718,
          name: "HS566_RS00015",
          start: 472,
          type: "gene",
        },
        {
          direction: -1,
          end: 718,
          name: "HS566_RS00015",
          start: 472,
          type: "CDS",
        },
        {
          direction: -1,
          end: 957,
          name: "HS566_RS00020",
          start: 714,
          type: "gene",
        },
        {
          direction: -1,
          end: 957,
          name: "HS566_RS00020",
          start: 714,
          type: "CDS",
        },
        {
          direction: -1,
          end: 1830,
          name: "HS566_RS00025",
          start: 960,
          type: "gene",
        },
        {
          direction: -1,
          end: 1830,
          name: "HS566_RS00025",
          start: 960,
          type: "CDS",
        },
        {
          direction: -1,
          end: 2137,
          name: "HS566_RS00030",
          start: 1912,
          type: "gene",
        },
        {
          direction: -1,
          end: 2137,
          name: "HS566_RS00030",
          start: 1912,
          type: "CDS",
        },
        {
          direction: 1,
          end: 2596,
          name: "HS566_RS00060",
          start: 2215,
          type: "gene",
        },
        {
          direction: 1,
          end: 2596,
          name: "HS566_RS00060",
          start: 2215,
          type: "CDS",
        },
        {
          direction: 1,
          end: 3210,
          name: "HS566_RS00040",
          start: 2592,
          type: "gene",
        },
        {
          direction: 1,
          end: 3210,
          name: "HS566_RS00040",
          start: 2592,
          type: "CDS",
        },
        {
          direction: 1,
          end: 3935,
          name: "HS566_RS00045",
          start: 3293,
          type: "gene",
        },
        {
          direction: 1,
          end: 3935,
          name: "HS566_RS00045",
          start: 3293,
          type: "CDS",
        },
        {
          direction: 1,
          end: 5135,
          name: "HS566_RS00050",
          start: 4418,
          type: "gene",
        },
        {
          direction: 1,
          end: 5135,
          name: "HS566_RS00050",
          start: 4418,
          type: "CDS",
        },
        {
          direction: 1,
          end: 5967,
          name: "HS566_RS00055",
          start: 5307,
          type: "gene",
        },
        {
          direction: 1,
          end: 5967,
          name: "HS566_RS00055",
          start: 5307,
          type: "CDS",
        },
      ],
      name: "NC_011521",
      seq: "cccatcttaagacttcacaagacttgtgaaatcagaccactgctcaatgcggaacgcccgaatatcgcggacagaagacggaaaccaaggcagagcttttagctcgttgatggctgaaaacaggttagccatatcttcgttttggcaggtgtacaaacttccctgaatgcgggtaaagccgaatttccgcagggtgtatccaatatccgcgtaggcttgggaaatgcctttcggatggttttgagcggtatcggcaaccaccaaatcaaaagaaatcgcgtacattaggcagcctttgggtcttgaacgatgtgggacagtttgtattgcgtgtgttcgccgctttccggcagttcaatatttacgagccaatcgccgtccggaagctgttcggcaggcgtgccgacgatgtacatcacgccgtaatcgccaaaggtgcggattgaaccggtggggatagtggtttgcatggttagttctcctgttgggtttggttttcaggctggtttgtcatgtacaaaacccgttgggcagctttttcggctgttgtgcgtttgatgccgtcaggcagaaaaattctccattttttggctagaactatatctgcaagatcatcaaccgttgcgcttttcaaagcaggatttgcgttaatttccgaatacagaaaatctttgaatgccgagtacagagcatcgcggtttattgcgtatcttgtcatgctgtttcgctttggttgtcagtttcagacggcataggcttgccgcgcctgtaccaagtggcgcgggaaatgccgaagtgttcccacggtttatcgcggctgatagagttttcggctaggtagtcggcgcgggattgcgaccatgcccgaaaaacggttcttgtggaacagccgaagcgttttgccagttctttagccgtaacgtctcgcttggtggttttcagttttggataggccatatttcaaagctccgtgatgatttttgttctgcctgcattgatggttgttttccgcaaactattccgatgagcctgcaattccgaaaaccgtcgattgctggctgcaatatcaaacttgtaccaaacccagttagcgattgatttggagatacatttcacttctttttcccacatcgggacagggaaatccccatttacccgcatacactggtaatgcacttctttcagccagccttgcaccgtgtagccctgctgtttgaacgccaacacgtttttgtgcgcccaacggctcacaaggttaaacaccgtgcaatttctgcttaatccgaccgcttccacgttagagcgaccgatatagggcttaaacttgtctaaatccacgaaatccgcaagatactccaaatcgtagcccctgattgcgtcaggaacgccgcgcagcgtcagccaatgcggatgttcgggatttttcgtaatcagcgatacaaagcccacatcaccgcgcaatttcgccttatatgctgcttcaagtgcagcaagatagcgcagggctttttgtctcccaccgtattccgccgtcagcacaggcgcggaaagcgcataggcaaggtgtgcgccgccgttttccctgttgattgccgcccaagcaggcataggcagattattgtcttcccaagccaaccccgccccttcgtaatccaagtcaaagagcataaacacacgcagatgcgacggattgacttggatgtagcgacgtttgatggcggcagcgtaagagcgcaccagcataggcgcttctttgaaatctttgcagtatggcttgtgtgggatacgttcttgcaagaagaggtcgggttgggtgtataattggctcatgttgtatctcgaaacccccgtgcagattggcgtttggcgggggttttgctttgtctaagatttgcagattgtatgcttgtttttaagatgatacaactatgtcaaaataaccataatcagataacagcccgataggggttcttatttcaaaattttccaatccgcaatttagcgaagccagcaggcgaagcggtaaagcttggagcgcagcagcgcgacctaagccggccagcagggcggcgttttgggggaaacatgaaaccagttccgacagggcggcgtgcgtgttcttcccggagttcttcatggagtatcggcgaaatgccgtgatgaaatgccgtttttttgagcagaaagcagtcaaaaacaggggtattttgcccttttgacaggttcgagtgccgccgaaaagcgaacaaagcaactcatcatccgagtcagcccgaccgagtttgagactttgacccgacagaagacccatccgaatttagcccgctacattcgggagcgggttttggaagatggcaaagcatccgacaaaaaaaccgtcaaattccaattcccgcccgaagtcgtgcgcgtccttgcaggcatgggtaacaacctgaaccaaatagccaaggccctgaacaccgccgcaaaggtcggcacgttgggcaatgtggaagcactcaaggcgacgaccgagctggcagcgttggaacgttccttaaattccctacgggattttttagccaaagaaaagaacggatggcagtcccaatgattgtgcagtttttcaatagggggaaaggcggcgggagtggtccgatagactatcttctaggcaaagaccgcgaccgagaagaagccagattattacgcggcgaccccgaagaaaccgccgccctgataaacagcagcgattacgccaagaaatacaccgccggctgcctgagctttgaagaaagcaacatccccgccgaacagaaacacgccctgatggacagcttcgaagagtgtatttttgcaggcttggacaaagaccaatacaactgcctatgggtagaacaccgagacaaagggcgtttggaactcaacttcgtgataccgaacatcgagcttttgagcggaaagcggttacagccctactactacgccgccgacagaggaagagtggacgcatggcgcaccatgcagaacctgacgcacggatacagcgacccagacgaccccgccaaacggcagagcatgacccaagccaaagacctgccgagaaacacgcaggaagccgcacagagcatcacagagcatcacagacggcttagaagccctagccctatcaggcaagctaaaaagccgcgcagacgtgctggaaacgctggaaaaggtaggttttgaaatatcacgagcgaccatcagcagcatcagcatcaagaacccggacccaaaagggcgcaacatccgactgaaaggcgcactgtatgagcaagatttccgatttggcgaagaccttcgagcagacatcacgcaccgaagccgccagcatagagcaacaaacgaaagcagacttagagacgttacggaaaaatatcaacgaggcattgaagcaaagcgagcagaaaataaccgccgatataaacgcccggcagttacgcatgagcaaggcagtattcaagccctatctgtggagcttgctaggtatatcggcggcagggttgatagtcatagcagggctgttcatagcgatatggagcgtcaagaacgagctggacgacttgaaacagcagagagccgaagcagagcgcaccctagacctgttggaaaccaagaccaaaggtttgacactggaaaattgcccagtcgagaacagcaaagcaacgcgggtatgcgtagcgaccgagaagcgaatgctggacgcgttagcggaattagagagcaatcacgcagcaatcgagcagcgaatgatgaaagccttaacgcacttgggcgaaaggttggcagagctagagcaggaaaacacgagtttagcgcagcagctagcgagcttggcagccgagttagagcggcagagcgaaatacagcaacggcagagcgaaatcttgaatcaactagccaaacgataagccaacgacacaaacgaacccaaagcaggggatggggaatgagccgatgattaccgagaacgaacgcgacaggcgaacagccgcatggctgatagagacctacggggcagaagccgtagcggaagcagaaacccgcattgcgggtgcgagaaagccctatccgagcgatatcgccaaagtattgggggctagcctacccgaagccctaaaacgcacagaaaacgccgcagcgcgccaaaaactggcagggctgcggcggatttggacggtaaggcagttaagacttcacaaacttgtgggatctggaattcgagctcggtacccggggatccccggggccgtctgaagacggccagtgccaagcttactccccatccccctgttgacaattaatcatcggctcgtataatgtgtggaattgtgatcggataacaatttcacacaggaaacaggatcctctagatttaagaaggagatatacatatgagtaaaggagaagaacttttcactggagttgtcccaattcttgttgaattagatggtgatgttaatgggcacaaattttctgtcagtggagagggtgaaggtgatgcaacatacggaaaacttacccttaaatttatttgcactactggaaaactacctgttccatggccaacacttgtcactactttcggttatggtgttcaatgctttgcgagatacccagatcatatgaaacagcatgactttttcaagagtgccatgcctgaaggttatgtacaggaaagaactatatttttcaaagatgacgggaactacaagacacgtgctgaagtcaagtttgaaggtgatacccttgttaatagaatcgagttaaaaggtattgattttaaagaagatggaaacattcttggacacaaattggaatacaactataactcacacaatgtatacatcatggcagacaaacaaaagaatggaatcaaagttaacttcaaaattagacacaacattgaagatggaagcgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtccacacaatctgccctttcgaaagatcccaacgaaaagagagaccacatggtccttcttgagtttgtaacagctgctgggattacacatggcatggatgaactatacaaataaatgtccagacctcctgcaggcatgcaagctagatcccccgggctgcagtactccccatccccctgttgacaattaatcatcggctcgtataatgtgtggaattgtgagcggataacaatttcacacaggaaacaggatcgatccgagattttcaggagctaaggaagctaaaatggagaaaaaaatcactggatataccaccgttgatatatcccaatggcatcgtaaagaacattttgaggcatttcagtcagttgctcaatgtacctataaccaaaccgttcagctggatattacggcctttttaaagaccgtaaagaaaaataagcacaagttttatccggcctttattcacattcttgcccgcctgatgaatgctcatccggaattccgtatggcaatgaaagacggtgagctggtgatatgggatagtgttcacccttgttacaccgttttccatgagcaaactgaaacgttttcatcgctctggagtgaataccacgacgatttccggcagtttctacacatatattcgcaagatgtggcgtgttacggtgaaaacctggcctatttccctaaagggtttattgagaatatgtttttcgtctcagccaatccctgggtgagtttcaccagttttgatttaaacgtggccaatatggacaacttcttcgcccccgttttcaccatgggcaaatattatacgcaaggcgacaaggtgctgatgccgctggcgattcaggttcatcatgccgtttgtgatggcttccatgtcggcagaatgcttaatgaattacaacagtactgcgatgagtggcagggcggggcgtaatttttttaaggcagttattggtgcccttaaacgcctggttgctacgcctgaataagtgataataagcggatgaatggcagaaattcggatcgatc",
      type: "dna",
    },
  }).forEach(([name, e]) => {
    it(`fetches: ${name}`, async () => {
      const result = await fetchFile(name);

      expect(result).toEqual(e);
    });
  });

  it("throws error for bad accession", async () => {
    try {
      await fetchFile("asdf");
      fail("expected error");
    } catch (err) {
      // expected
    }
  });
});

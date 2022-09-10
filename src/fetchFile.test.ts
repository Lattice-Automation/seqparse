import fetchFile from "./fetchFile";

describe("Fetches files", () => {
  Object.entries({
    BBa_J23100: {
      name: "BBa_J23100",
      seq: "ttgacggctagctcagtcctaggtacagtgctagc",
      annotations: [],
      type: "dna",
    },
    NC_011521: {
      name: "NC_011521",
      type: "dna",
      seq: "cccatcttaagacttcacaagacttgtgaaatcagaccactgctcaatgcggaacgcccgaatatcgcggacagaagacggaaaccaaggcagagcttttagctcgttgatggctgaaaacaggttagccatatcttcgttttggcaggtgtacaaacttccctgaatgcgggtaaagccgaatttccgcagggtgtatccaatatccgcgtaggcttgggaaatgcctttcggatggttttgagcggtatcggcaaccaccaaatcaaaagaaatcgcgtacattaggcagcctttgggtcttgaacgatgtgggacagtttgtattgcgtgtgttcgccgctttccggcagttcaatatttacgagccaatcgccgtccggaagctgttcggcaggcgtgccgacgatgtacatcacgccgtaatcgccaaaggtgcggattgaaccggtggggatagtggtttgcatggttagttctcctgttgggtttggttttcaggctggtttgtcatgtacaaaacccgttgggcagctttttcggctgttgtgcgtttgatgccgtcaggcagaaaaattctccattttttggctagaactatatctgcaagatcatcaaccgttgcgcttttcaaagcaggatttgcgttaatttccgaatacagaaaatctttgaatgccgagtacagagcatcgcggtttattgcgtatcttgtcatgctgtttcgctttggttgtcagtttcagacggcataggcttgccgcgcctgtaccaagtggcgcgggaaatgccgaagtgttcccacggtttatcgcggctgatagagttttcggctaggtagtcggcgcgggattgcgaccatgcccgaaaaacggttcttgtggaacagccgaagcgttttgccagttctttagccgtaacgtctcgcttggtggttttcagttttggataggccatatttcaaagctccgtgatgatttttgttctgcctgcattgatggttgttttccgcaaactattccgatgagcctgcaattccgaaaaccgtcgattgctggctgcaatatcaaacttgtaccaaacccagttagcgattgatttggagatacatttcacttctttttcccacatcgggacagggaaatccccatttacccgcatacactggtaatgcacttctttcagccagccttgcaccgtgtagccctgctgtttgaacgccaacacgtttttgtgcgcccaacggctcacaaggttaaacaccgtgcaatttctgcttaatccgaccgcttccacgttagagcgaccgatatagggcttaaacttgtctaaatccacgaaatccgcaagatactccaaatcgtagcccctgattgcgtcaggaacgccgcgcagcgtcagccaatgcggatgttcgggatttttcgtaatcagcgatacaaagcccacatcaccgcgcaatttcgccttatatgctgcttcaagtgcagcaagatagcgcagggctttttgtctcccaccgtattccgccgtcagcacaggcgcggaaagcgcataggcaaggtgtgcgccgccgttttccctgttgattgccgcccaagcaggcataggcagattattgtcttcccaagccaaccccgccccttcgtaatccaagtcaaagagcataaacacacgcagatgcgacggattgacttggatgtagcgacgtttgatggcggcagcgtaagagcgcaccagcataggcgcttctttgaaatctttgcagtatggcttgtgtgggatacgttcttgcaagaagaggtcgggttgggtgtataattggctcatgttgtatctcgaaacccccgtgcagattggcgtttggcgggggttttgctttgtctaagatttgcagattgtatgcttgtttttaagatgatacaactatgtcaaaataaccataatcagataacagcccgataggggttcttatttcaaaattttccaatccgcaatttagcgaagccagcaggcgaagcggtaaagcttggagcgcagcagcgcgacctaagccggccagcagggcggcgttttgggggaaacatgaaaccagttccgacagggcggcgtgcgtgttcttcccggagttcttcatggagtatcggcgaaatgccgtgatgaaatgccgtttttttgagcagaaagcagtcaaaaacaggggtattttgcccttttgacaggttcgagtgccgccgaaaagcgaacaaagcaactcatcatccgagtcagcccgaccgagtttgagactttgacccgacagaagacccatccgaatttagcccgctacattcgggagcgggttttggaagatggcaaagcatccgacaaaaaaaccgtcaaattccaattcccgcccgaagtcgtgcgcgtccttgcaggcatgggtaacaacctgaaccaaatagccaaggccctgaacaccgccgcaaaggtcggcacgttgggcaatgtggaagcactcaaggcgacgaccgagctggcagcgttggaacgttccttaaattccctacgggattttttagccaaagaaaagaacggatggcagtcccaatgattgtgcagtttttcaatagggggaaaggcggcgggagtggtccgatagactatcttctaggcaaagaccgcgaccgagaagaagccagattattacgcggcgaccccgaagaaaccgccgccctgataaacagcagcgattacgccaagaaatacaccgccggctgcctgagctttgaagaaagcaacatccccgccgaacagaaacacgccctgatggacagcttcgaagagtgtatttttgcaggcttggacaaagaccaatacaactgcctatgggtagaacaccgagacaaagggcgtttggaactcaacttcgtgataccgaacatcgagcttttgagcggaaagcggttacagccctactactacgccgccgacagaggaagagtggacgcatggcgcaccatgcagaacctgacgcacggatacagcgacccagacgaccccgccaaacggcagagcatgacccaagccaaagacctgccgagaaacacgcaggaagccgcacagagcatcacagagcatcacagacggcttagaagccctagccctatcaggcaagctaaaaagccgcgcagacgtgctggaaacgctggaaaaggtaggttttgaaatatcacgagcgaccatcagcagcatcagcatcaagaacccggacccaaaagggcgcaacatccgactgaaaggcgcactgtatgagcaagatttccgatttggcgaagaccttcgagcagacatcacgcaccgaagccgccagcatagagcaacaaacgaaagcagacttagagacgttacggaaaaatatcaacgaggcattgaagcaaagcgagcagaaaataaccgccgatataaacgcccggcagttacgcatgagcaaggcagtattcaagccctatctgtggagcttgctaggtatatcggcggcagggttgatagtcatagcagggctgttcatagcgatatggagcgtcaagaacgagctggacgacttgaaacagcagagagccgaagcagagcgcaccctagacctgttggaaaccaagaccaaaggtttgacactggaaaattgcccagtcgagaacagcaaagcaacgcgggtatgcgtagcgaccgagaagcgaatgctggacgcgttagcggaattagagagcaatcacgcagcaatcgagcagcgaatgatgaaagccttaacgcacttgggcgaaaggttggcagagctagagcaggaaaacacgagtttagcgcagcagctagcgagcttggcagccgagttagagcggcagagcgaaatacagcaacggcagagcgaaatcttgaatcaactagccaaacgataagccaacgacacaaacgaacccaaagcaggggatggggaatgagccgatgattaccgagaacgaacgcgacaggcgaacagccgcatggctgatagagacctacggggcagaagccgtagcggaagcagaaacccgcattgcgggtgcgagaaagccctatccgagcgatatcgccaaagtattgggggctagcctacccgaagccctaaaacgcacagaaaacgccgcagcgcgccaaaaactggcagggctgcggcggatttggacggtaaggcagttaagacttcacaaacttgtgggatctggaattcgagctcggtacccggggatccccggggccgtctgaagacggccagtgccaagcttactccccatccccctgttgacaattaatcatcggctcgtataatgtgtggaattgtgatcggataacaatttcacacaggaaacaggatcctctagatttaagaaggagatatacatatgagtaaaggagaagaacttttcactggagttgtcccaattcttgttgaattagatggtgatgttaatgggcacaaattttctgtcagtggagagggtgaaggtgatgcaacatacggaaaacttacccttaaatttatttgcactactggaaaactacctgttccatggccaacacttgtcactactttcggttatggtgttcaatgctttgcgagatacccagatcatatgaaacagcatgactttttcaagagtgccatgcctgaaggttatgtacaggaaagaactatatttttcaaagatgacgggaactacaagacacgtgctgaagtcaagtttgaaggtgatacccttgttaatagaatcgagttaaaaggtattgattttaaagaagatggaaacattcttggacacaaattggaatacaactataactcacacaatgtatacatcatggcagacaaacaaaagaatggaatcaaagttaacttcaaaattagacacaacattgaagatggaagcgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtccacacaatctgccctttcgaaagatcccaacgaaaagagagaccacatggtccttcttgagtttgtaacagctgctgggattacacatggcatggatgaactatacaaataaatgtccagacctcctgcaggcatgcaagctagatcccccgggctgcagtactccccatccccctgttgacaattaatcatcggctcgtataatgtgtggaattgtgagcggataacaatttcacacaggaaacaggatcgatccgagattttcaggagctaaggaagctaaaatggagaaaaaaatcactggatataccaccgttgatatatcccaatggcatcgtaaagaacattttgaggcatttcagtcagttgctcaatgtacctataaccaaaccgttcagctggatattacggcctttttaaagaccgtaaagaaaaataagcacaagttttatccggcctttattcacattcttgcccgcctgatgaatgctcatccggaattccgtatggcaatgaaagacggtgagctggtgatatgggatagtgttcacccttgttacaccgttttccatgagcaaactgaaacgttttcatcgctctggagtgaataccacgacgatttccggcagtttctacacatatattcgcaagatgtggcgtgttacggtgaaaacctggcctatttccctaaagggtttattgagaatatgtttttcgtctcagccaatccctgggtgagtttcaccagttttgatttaaacgtggccaatatggacaacttcttcgcccccgttttcaccatgggcaaatattatacgcaaggcgacaaggtgctgatgccgctggcgattcaggttcatcatgccgtttgtgatggcttccatgtcggcagaatgcttaatgaattacaacagtactgcgatgagtggcagggcggggcgtaatttttttaaggcagttattggtgcccttaaacgcctggttgctacgcctgaataagtgataataagcggatgaatggcagaaattcggatcgatc",
      annotations: [
        {
          name: "HS566_RS00005",
          start: 6,
          end: 285,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00005",
          start: 6,
          end: 285,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00010",
          start: 284,
          end: 470,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00010",
          start: 284,
          end: 470,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00015",
          start: 472,
          end: 718,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00015",
          start: 472,
          end: 718,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00020",
          start: 714,
          end: 957,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00020",
          start: 714,
          end: 957,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00025",
          start: 960,
          end: 1830,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00025",
          start: 960,
          end: 1830,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00030",
          start: 1912,
          end: 2137,
          direction: -1,
          type: "gene",
        },
        {
          name: "HS566_RS00030",
          start: 1912,
          end: 2137,
          direction: -1,
          type: "CDS",
        },
        {
          name: "HS566_RS00060",
          start: 2215,
          end: 2596,
          direction: 1,
          type: "gene",
        },
        {
          name: "HS566_RS00060",
          start: 2215,
          end: 2596,
          direction: 1,
          type: "CDS",
        },
        {
          name: "HS566_RS00040",
          start: 2592,
          end: 3210,
          direction: 1,
          type: "gene",
        },
        {
          name: "HS566_RS00040",
          start: 2592,
          end: 3210,
          direction: 1,
          type: "CDS",
        },
        {
          name: "HS566_RS00045",
          start: 3293,
          end: 3935,
          direction: 1,
          type: "gene",
        },
        {
          name: "HS566_RS00045",
          start: 3293,
          end: 3935,
          direction: 1,
          type: "CDS",
        },
        {
          name: "HS566_RS00050",
          start: 4418,
          end: 5135,
          direction: 1,
          type: "gene",
        },
        {
          name: "HS566_RS00050",
          start: 4418,
          end: 5135,
          direction: 1,
          type: "CDS",
        },
        {
          name: "HS566_RS00055",
          start: 5307,
          end: 5967,
          direction: 1,
          type: "gene",
        },
        {
          name: "HS566_RS00055",
          start: 5307,
          end: 5967,
          direction: 1,
          type: "CDS",
        },
      ],
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

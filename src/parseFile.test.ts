import * as fs from "fs";

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

  // convert an array of files at one time
  it("converts multiple files at once", async () => {
    const files = Object.keys(allFiles)
      .filter(f => !f.includes("empty"))
      .slice(0, 3);

    try {
      const result = await parseFile(files.map(f => fs.readFileSync(allFiles[f], "utf8")));

      expect(typeof result).toEqual(typeof []);
      result.forEach(seqs => {
        expect(typeof seqs).toEqual(typeof {});
        expect(seqs.name).toMatch(/.{2,}/);
        expect(seqs.seq).toMatch(/.{2,}/);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
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
  it("parses benchling annotation direction", async () => {
    const result = await parseFile(fs.readFileSync(allFiles["benchling/benchling1.json"], "utf8"));

    expect(result.length).toEqual(1);

    expect(result[0].annotations).toEqual([
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
    ]);
  });

  /**
   * table-test of file names to expected output
   */
  Object.entries({
    "sbol/v2/singleSequence.xml": {
      name: "pLacSeq",
      seq: "ACGTURYSWKMBDHVN",
      annotations: [],
      type: "unknown",
    },
    "sbol/v2/CreateAndRemoveModel.xml": {
      name: "someSequence",
      seq: "ACGTURYSWKMBDHVN",
      annotations: [],
      type: "unknown",
    },
    "sbol/v2/BBa_I0462.xml": {
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
  }).forEach(([name, e]) => {
    it(`meets expectations: ${name}`, async () => {
      const result = await parseFile(fs.readFileSync(allFiles[name], "utf8"));

      expect(result[0]).toEqual(e);
    });
  });
});

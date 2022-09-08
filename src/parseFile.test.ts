import * as fs from "fs";

import parseFile from "./parseFile";

describe("Converts files to seqs (IO)", () => {
  const types = ["genbank", "fasta", "jbei", "benchling", "snapgene"];
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
      it(`converts: ${file} ${i}`, async () => {
        const fileString = fs.readFileSync(allFiles[file], "utf8");

        // does it include a name, seq, and source?
        try {
          const result = await parseFile(fileString, allFiles[file]);
          expect(typeof result).toEqual(typeof []);
          expect(typeof result[0]).toEqual(typeof {});
          expect(result[0].name).toMatch(/.{2,}/);
          expect(result[0].seq).toMatch(/[atgcATGC]{10,}/);
        } catch (err) {
          console.error(err);
          throw err;
        }
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
    [
      {
        direction: -1,
        end: 2344,
        start: 2334,
      },
      {
        direction: 0,
        end: 2946,
        start: 2867,
      },
      {
        direction: 1,
        end: 4655,
        start: 2867,
      },
      {
        direction: 0,
        end: 4964,
        start: 4954,
      },
    ].forEach((a, i) => {
      expect(result[0].annotations[i].start).toEqual(a.start);
      expect(result[0].annotations[i].end).toEqual(a.end);
      expect(result[0].annotations[i].direction).toEqual(a.direction);
    });
  });
});

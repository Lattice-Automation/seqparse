#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import pino from "pino";
import pretty from "pino-pretty";

import seqparse from ".";

/** use LOG_LEVEL=debug to get a bit of debug logging */
const stream = pretty({
  colorize: true,
});
let logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  stream
);

/** bail, log an example */
const exit = () => {
  console.error(`# Example USAGE:

# parsing a file
seqparse gene.fa

# parsing a file from stdin
cat gene.fa | seqparse

# downloading and parsing a file from NCBI
seqparse FJ172221`);
  process.exit(1);
};

/** input can be a file name as first arg or stdin */
let input: string | null = null;
if (process.argv[2]) {
  input = process.argv[2];
  logger = logger.child({ arg: true });
  logger.debug(null, "reading from arg");
} else {
  logger = logger.child({ stdin: true });
  try {
    logger.debug(null, "attempting to read stdin");
    input = readFileSync(process.stdin.fd, "utf-8").toString();
    logger.debug(null, "successfully read stdin");
  } catch (err) {
    // only a debug here because am assuming the user just didn't pass anything
    logger.debug({ err }, "failed to read stdin");
    exit();
  }
}

/** throw, no input detected */
if (!input || !input.length) {
  logger.error(null, "no input detected");
  exit();
  process.exit(1);
}

/** check if file, if so, read */
const isFile = existsSync(input);
logger = logger.child({ isFile });

let fileContents: string | null = null;
if (isFile) {
  logger = logger.child({ fileName: input });
  try {
    logger.debug(null, "attempting to read file");
    fileContents = readFileSync(input).toString();
    logger = logger.child({ length: fileContents.length, prefix: fileContents.substring(0, 50) });
    logger.debug(null, "successfully read file");
  } catch (err) {
    logger.error({ err }, "failed to read file");
    exit();
  }
}

/** parse, write to stdout */
logger.debug(null, "attempting to parse input");
seqparse(fileContents || input, isFile ? { fileName: input } : {})
  .then(r => {
    logger.debug(null, "successfully parsed file");
    console.log(JSON.stringify(r, null, 2));
  })
  .catch(err => {
    logger.error({ err }, "failed to parse input");
    exit();
  });

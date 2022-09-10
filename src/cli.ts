#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";
import pino from "pino";
import pretty from "pino-pretty";

import seqparse from ".";
import { ParseOptions } from "./parseFile";

/** use LOG_LEVEL=debug for some debugging help */
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

# parse a file
seqparse gene.fa

# parse a file from stdin
cat gene.fa | seqparse

# fetch and parse a file from NCBI of iGEM by accession
seqparse FJ172221`);
  process.exit(1);
};

/** input can be a file name as first arg or stdin */
const parseOptions = {} as ParseOptions;

let input: string | null = null;
if (process.argv[2]) {
  input = process.argv[2];
  logger = logger.child({ arg: true });
  logger.debug(null, "reading from arg");
} else {
  logger = logger.child({ stdin: true });
  try {
    logger.debug(null, "attempting to read stdin");
    parseOptions.source = readFileSync(process.stdin.fd);
    parseOptions.fileName = "Unknown";
    input = (parseOptions.source as Buffer).toString("utf-8");
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
  parseOptions.fileName = input;
  try {
    logger.debug(null, "attempting to read file");
    parseOptions.source = readFileSync(input);
    fileContents = (parseOptions.source as Buffer).toString("utf-8");
    logger = logger.child({ length: fileContents.length, prefix: fileContents.substring(0, 50) });
    logger.debug(null, "successfully read file");
  } catch (err) {
    logger.error({ err }, "failed to read file");
    exit();
  }
}

/** parse, write to stdout */
logger.debug(null, "attempting to parse input");
seqparse(fileContents || input, parseOptions)
  .then(r => {
    logger.debug(null, "successfully parsed file");
    console.log(JSON.stringify(r, null, 2));
  })
  .catch(err => {
    logger.error({ err }, "failed to parse input");
    exit();
  });

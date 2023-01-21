#!/usr/bin/env node
import { existsSync, readFileSync } from "fs";

import seqparse, { ParseOptions } from ".";

/** a crappy but dependency-free log implementation */
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const debug = (msg: string) => {
  if (LOG_LEVEL !== "debug") {
    return;
  }
  console.log(`[DEBUG] ${msg}`);
};

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
  debug("reading from arg");
} else {
  debug("reading from stdin");
  try {
    parseOptions.source = readFileSync(process.stdin.fd);
    parseOptions.fileName = "Unknown";
    input = (parseOptions.source as Buffer).toString("utf-8");
    debug("successfully read stdin");
  } catch (err) {
    // only a debug here because am assuming the user just didn't pass anything
    debug("failed to read stdin");
    exit();
  }
}

/** throw, no input detected */
if (!input || !input.length) {
  console.error("no input detected");
  exit();
  process.exit(1);
}

/** check if file, if so, read */
const isFile = existsSync(input);

let fileContents: string | null = null;
if (isFile) {
  parseOptions.fileName = input;
  try {
    debug("attempting to read file");
    parseOptions.source = readFileSync(input);
    fileContents = (parseOptions.source as Buffer).toString("utf-8");
    debug("successfully read file");
  } catch (err) {
    console.error("failed to read file", err);
    exit();
  }
}

/** parse, write to stdout */
debug("parsing");
seqparse(fileContents || input, parseOptions)
  .then(r => {
    debug("successfully parsed");
    console.log(JSON.stringify(r, null, 2));
  })
  .catch(err => {
    console.error("failed to parse input", err);
    exit();
  });

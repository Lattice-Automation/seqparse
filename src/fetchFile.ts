import fetch, { Response } from "node-fetch";

import { Seq } from ".";
import parseFile from "./parseFile";

/**
 * Get a remote sequence from NCBI or the iGEM registry.
 */
export default async (accession: string): Promise<Seq> => {
  // The user doesn't specify the target registry, so we have to infer it from the passed accession: iGEM or NCBI
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.startsWith("BB")) {
    // it's a BioBrick... target the iGEM repo
    if (typeof window !== "undefined" && typeof process === "undefined") {
      // use this hack to get around a no-CORS setting on iGEM webserver, pending fix on their side
      url = `https://cors-anywhere.herokuapp.com/http://parts.igem.org/cgi/xml/part.cgi?part=${accession.trim()}`;
    } else {
      url = `http://parts.igem.org/cgi/xml/part.cgi?part=${accession.trim()}`;
    }
  }

  // Request the XML from the webserver
  let body = "";
  let response: Response;
  try {
    response = await fetch(url);
    body = await response.text();
  } catch (err) {
    throw new Error(`Failed to get part: accession=${accession} url=${url} err=${err}`);
  }
  if (!response.ok || !body.length) {
    throw new Error(`Failed to get part, no body returned: accession=${accession} url=${url}`);
  }

  return (await parseFile(body))[0];
};

/** returns whether the passed ID is an accession in iGEM or NCBI */
export const isAccession = (accession: string): boolean => {
  if (accession.startsWith("BB")) {
    return true; // biobrick
  }
  if (accession.length < 14 && accession.match(/^[a-z0-9_\-.]+$/i)) {
    return true;
  }
  return false;
};

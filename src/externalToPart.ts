import { Part } from "./elements";
import fileToParts from "./filesToParts";

/**
 * Get a remote sequence/part from NCBI or the iGEM registry.
 */
export default async (accession: string): Promise<Part> => {
  // The user doesn't specify the target registry, so we have to infer it from the passed accession: iGEM or NCBI
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eefetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.startsWith("BB")) {
    // it's a BioBrick... target the iGEM repo
    if (typeof window === "undefined") {
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

  // Convert to a part
  const parts = await fileToParts(body);
  return parts[0];
};

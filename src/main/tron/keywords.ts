/*
 *  @Author: José Sánchez-Gallego (gallegoj@uw.edu)
 *  @Date: 2022-11-06
 *  @Filename: keywords.ts
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */

import { Keyword } from './types';

function evaluateKeyword(value: string) {
  if (value === '') return undefined;

  switch (value) {
    case 'F':
    case 'f':
      return false;
    case 'T':
    case 't':
      return true;
    default:
      break;
  }
  if (!Number.isNaN(Number(value))) {
    return Number(value);
  }
  const match = value.match(/^["]+(.*)["]+$|^(?!")(.+)(?<!")$/);
  if (match) {
    return match[1] || match[2];
  }
  return value;
}

const lineRegex = new RegExp(
  '(?<commander>(?:\\.?\\w+)+)\\s+' +
    '(?<commandId>\\d+)\\s+' +
    '(?<sender>\\w+)\\s+' +
    '(?<code>[diwfe:DIWFE>])\\s*' +
    '(?<keywords>.+)?'
);

export default function parseLine(
  line: string
): [RegExpMatchArray | null, Keyword[]] {
  const lineTrimmed = line.trim();
  if (!lineTrimmed) return [null, []];

  const lineMatched = lineTrimmed.match(lineRegex);
  if (!lineMatched || !lineMatched.groups) return [null, []];

  if (lineMatched.groups.keywords) {
    const matchedKeywords = lineMatched.groups.keywords;

    const keywords = matchedKeywords
      .split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((kw: string) => {
        let key: string;
        let values: string;

        const kwMatched = kw.trim().match(/(?<key>\w+)=(?<values>.+)/);
        if (!kwMatched || !kwMatched.groups) {
          // Case where the keyword does not have a value (e.g. loggedIn).
          key = kw;
          values = '';
        } else {
          key = kwMatched.groups.key;
          values = kwMatched.groups.values;
        }

        // Select all groups split by , except when the comma is inside quotes,
        // but be careful about strings that contain quotes as a single
        // character (yes, it's messy). This regex seems to produce empty
        // matches so filter out undefined values.
        const rawValues = values
          .split(/(?!\B(")[^(")]*),(?![^(")]*(")\B)/)
          .filter((x) => x !== undefined);

        const keyword: Keyword = {
          name: key,
          sender: lineMatched.groups?.sender,
          commander: lineMatched.groups?.commander,
          values: rawValues
            .map((value) => {
              return evaluateKeyword(value);
            })
            .filter((x) => x !== undefined),
        };
        return keyword;
      });

    return [lineMatched, keywords];
  }

  return [lineMatched, []];
}

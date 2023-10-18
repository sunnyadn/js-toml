import { createToken } from 'chevrotain';
import { nonAscii } from './patterns.js';
import XRegExp from 'xregexp';

const commentStartChar = /#/;
const nonEol = XRegExp.build('\t|[\x20-\x7E]|{{nonAscii}}', { nonAscii });
const comment = XRegExp.build('{{commentStartChar}}{{nonEol}}*', {
  commentStartChar,
  nonEol,
});

export const Comment = createToken({
  name: 'Comment',
  pattern: comment,
  group: 'comment',
});

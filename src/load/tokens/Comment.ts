import { createToken } from 'chevrotain';
import XRegExp = require('xregexp');
import { nonAscii } from './patterns';

const commentStartChar = /#/;
const nonEol = XRegExp.build('\t|[\x20-\x7F]|{{nonAscii}}', { nonAscii });
const comment = XRegExp.build('{{commentStartChar}}{{nonEol}}*', {
  commentStartChar,
  nonEol,
});

export const Comment = createToken({
  name: 'Comment',
  pattern: comment,
  group: 'comment',
});

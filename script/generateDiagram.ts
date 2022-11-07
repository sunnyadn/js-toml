import { createSyntaxDiagramsCode } from 'chevrotain';
import { writeFileSync } from 'fs';
import { Parser } from '../src/load/parser';

const parser = new Parser();

const outputDiagram = () => {
  const serializedGrammar = parser.getSerializedGastProductions();

  const htmlText = createSyntaxDiagramsCode(serializedGrammar);

  writeFileSync('syntax-diagram.html', htmlText);
};

outputDiagram();

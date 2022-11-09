import { createSyntaxDiagramsCode } from 'chevrotain';
import { writeFileSync } from 'fs';
import { parser } from '../src/load/parser';

const outputDiagram = () => {
  const serializedGrammar = parser.getSerializedGastProductions();

  const htmlText = createSyntaxDiagramsCode(serializedGrammar);

  writeFileSync('syntax-diagram.html', htmlText);
};

outputDiagram();

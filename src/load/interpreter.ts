import {Parser} from "./parser";

const parser = new Parser();

const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

export class Interpreter extends BaseCstVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  toml(ctx) {
    const obj = this.visit(ctx.expression);
    return {...obj};
  }

  expression(ctx) {
    return this.visit(ctx.keyValue);
  }

  keyValue(ctx) {
    const key = this.visit(ctx.key);
    const value = this.visit(ctx.value);
    return {[key]: value};
  }

  key(ctx) {
    return this.visit(ctx.simpleKey);
  }

  simpleKey(ctx) {
    return ctx.UnquotedKey[0].image;
  }

  value(ctx) {
    return this.visit(ctx.string);
  }

  string(ctx) {
    return this.visit(ctx.basicString);
  }

  basicString(ctx) {
    const result = ctx.BasicString[0].image;
    return result.substring(1, result.length - 1);
  }
}

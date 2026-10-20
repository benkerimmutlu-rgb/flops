const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
module.exports = function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), module, module.exports,
  );
  return module.exports;
};

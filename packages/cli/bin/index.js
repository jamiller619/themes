#!/usr/bin/env node

// src/index.ts
import yargs from "yargs";

// src/theme/build.ts
import fs from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import chalk from "chalk";
import debug2 from "debug";
import mapObject, { mapObjectSkip } from "map-obj";
import { toCustomPropertiesString } from "object-to-css-variables";

// src/colors/expand.ts
import * as RadixColors from "@radix-ui/colors";

// src/colors/Colors.ts
var colorSteps = [
  "base",
  "bgSubtle",
  "bg",
  "bgHover",
  "bgActive",
  "line",
  "border",
  "borderHover",
  "solid",
  "solidHover",
  "text",
  "textContrast"
];

// src/colors/expand.ts
function expand(colorScheme) {
  const result = {};
  const steps = RadixColors[colorScheme];
  if (steps == null) {
    throw new Error(
      `"${colorScheme}" isn't available from @radix-ui/colors. Check spelling.`
    );
  }
  const colors = Object.values(RadixColors[colorScheme]);
  for (let i = 0; i < colors.length; i += 1) {
    result[colorSteps[i]] = colors[i];
  }
  return result;
}

// src/modular-scale/createScales.ts
import debug from "debug";

// src/utils/calcModifier.ts
function calcModifier(idx) {
  const numx = Math.abs(idx) - 0 - 1;
  const size = idx === 0 ? "m" : idx > 0 ? "l" : "s";
  if (numx > 0) {
    return `${new Array(numx).fill("x").reduce((a, c) => `${a}${c}`, "")}${size}`;
  }
  return size;
}

// src/modular-scale/ratios.ts
var ratios_default = {
  minorSecond: 16 / 15,
  majorSecond: 1.125,
  minorThird: 1.2,
  majorThird: 1.25,
  perfectFourth: 4 / 3,
  augmentedFourth: 1.414,
  perfectFifth: 1.5,
  minorSixth: 1.6,
  goldenSection: 1.61803398875,
  majorSixth: 5 / 3,
  minorSeventh: 16 / 9,
  majorSeventh: 1.875,
  octave: 2,
  majorTenth: 2.5,
  majorEleventh: 8 / 3,
  majorTwelfth: 3,
  doubleOctave: 4
};

// src/modular-scale/createScales.ts
var log = debug("modular-scale.create");
var defaultOptions = {
  base: 16,
  ratio: ratios_default.perfectFifth,
  points: 10,
  pointStart: -3
};
var toCamelCase = (str) => {
  return str.replace(/-([a-z])/gi, function(_, group) {
    return group.toUpperCase();
  });
};
var parseRatio = (ratio) => {
  const raw = ratio ?? defaultOptions.ratio;
  if (typeof raw === "string" && raw.includes("-")) {
    log(`Found hyphen-cased ratio "${raw}"`);
    const camelCased = toCamelCase(raw);
    log(`Camel cased: "${camelCased}"`);
    return ratios_default[camelCased];
  }
  return typeof raw === "string" ? ratios_default[raw] : raw;
};
var parseOpts = (opts) => {
  const base = opts?.base ?? defaultOptions.base;
  const ratio = parseRatio(opts?.ratio);
  if (ratio == null) {
    throw new Error(`Unknown ratio "${opts?.ratio}"`);
  }
  const points = Number(opts?.points ?? defaultOptions.points);
  const pointStart = Number(opts?.pointStart ?? defaultOptions.pointStart);
  const pointRange = [pointStart, pointStart + points];
  return {
    base,
    ratio,
    pointRange
  };
};
var calcScale = (point, opts) => {
  const { base, ratio } = opts;
  const isBaseArr = Array.isArray(base);
  if (!isBaseArr || base.length === 1) {
    const bv = Number(isBaseArr ? base[0] : base);
    return Math.pow(ratio, point) * bv;
  }
  const nbase = [...base.map(Number)];
  const baseHigh = Math.pow(ratio, 1) * nbase[0];
  for (let i = 1; i < base.length; i++) {
    while (nbase[i] / 1 < nbase[0] / 1) {
      nbase[i] = Math.pow(ratio, 1) * nbase[i];
    }
    while (nbase[i] / 1 >= baseHigh / 1) {
      nbase[i] = Math.pow(ratio, -1) * nbase[i];
    }
  }
  nbase.sort();
  const rBase = Math.round(
    (point / nbase.length - Math.floor(point / nbase.length)) * nbase.length
  );
  return Math.pow(ratio, Math.floor(point / nbase.length)) * nbase[rBase];
};
function create(scaleOptions) {
  const opts = parseOpts(scaleOptions);
  log("Parsed opts %O", opts);
  const values = {};
  const unit = scaleOptions?.unit ?? "px";
  for (let i = opts.pointRange[0]; i < opts.pointRange[1]; i += 1) {
    const scale = Number(calcScale(i, opts).toFixed(3));
    const modifier = calcModifier(i);
    log(scale, modifier);
    values[modifier] = `${scale}${unit}`;
  }
  return values;
}

// src/theme/schema.json
var schema_default = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    ThemeValue: {
      anyOf: [
        {
          type: "number"
        },
        {
          type: "array",
          items: {
            type: "number"
          }
        },
        {
          type: "string"
        },
        {
          type: "array",
          items: {
            type: "string"
          }
        },
        {
          $ref: "#/definitions/CustomUnit"
        },
        {
          $ref: "#/definitions/Scale"
        },
        {
          $ref: "#/definitions/Scale%3CCustomUnit%3E"
        }
      ]
    },
    CustomUnit: {
      type: "object",
      properties: {
        value: {
          type: [
            "number",
            "string"
          ]
        },
        unit: {
          type: "string"
        }
      },
      required: [
        "value",
        "unit"
      ],
      additionalProperties: false
    },
    Scale: {
      type: "object",
      properties: {
        body: {
          type: [
            "number",
            "string"
          ]
        },
        heading: {
          type: [
            "number",
            "string"
          ]
        }
      },
      additionalProperties: false
    },
    "Scale<CustomUnit>": {
      type: "object",
      properties: {
        body: {
          $ref: "#/definitions/CustomUnit"
        },
        heading: {
          $ref: "#/definitions/CustomUnit"
        }
      },
      additionalProperties: false
    },
    Theme: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        fonts: {
          type: "object",
          additionalProperties: false,
          properties: {
            monospace: {
              type: "string"
            },
            body: {
              type: "string"
            },
            heading: {
              type: "string"
            }
          }
        },
        radii: {
          type: "array",
          items: {
            $ref: "#/definitions/ThemeValue"
          }
        },
        fontWeights: {
          type: "object",
          additionalProperties: false,
          properties: {
            bold: {
              type: "number"
            },
            body: {
              type: [
                "number",
                "string"
              ]
            },
            heading: {
              type: [
                "number",
                "string"
              ]
            }
          }
        },
        lineHeights: {
          $ref: "#/definitions/Scale"
        },
        colors: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        },
        scale: {
          $ref: "#/definitions/ModularScaleOptions"
        },
        fontSize: {
          $ref: "#/definitions/ThemeValue"
        },
        space: {
          $ref: "#/definitions/ThemeValue"
        }
      },
      required: [
        "name",
        "colors"
      ],
      additionalProperties: false
    },
    "Scale<string>": {
      type: "object",
      properties: {
        body: {
          type: "string"
        },
        heading: {
          type: "string"
        }
      },
      additionalProperties: false
    },
    ModularScaleOptions: {
      type: "object",
      properties: {
        base: {
          anyOf: [
            {
              type: "number"
            },
            {
              type: "array",
              items: {
                type: "number"
              }
            }
          ]
        },
        ratio: {
          type: [
            "string",
            "number"
          ]
        },
        points: {
          type: "number"
        },
        pointStart: {
          type: "number"
        },
        field: {
          type: "string"
        },
        fields: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },
      additionalProperties: false
    }
  }
};

// src/theme/build.ts
var log2 = debug2("theme.build");
var ajv = new Ajv();
var marks = {
  pass: "\u2714\uFE0F ",
  fail: "\u274C"
};
var readFile = async (path2) => {
  try {
    const file = await fs.readFile(path2, {
      encoding: "utf-8"
    });
    return JSON.parse(file);
  } catch {
    throw new Error(`Unable to find "${path2}". Are you sure it exists?`);
  }
};
var parseValue = (value, convertToPx = true) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return `${value}${convertToPx ? "px" : ""}`;
  }
  if (value != null && "value" in value && "unit" in value) {
    return `${value.value}${value.unit}`;
  }
  if (Array.isArray(value)) {
    return value.reduce((acc, curr, i) => {
      const modifier = calcModifier(i);
      acc[modifier] = convertToPx ? `${curr}px` : curr;
      return acc;
    }, {});
  }
};
var convertThemeToCSSProperties = (theme) => {
  return `:root {
 ${toCustomPropertiesString(theme).replaceAll(";", ";\n")}}`;
};
async function build(input, opts) {
  const themeFilePath = path.resolve(opts.theme);
  const cssPropertiesFilePath = path.resolve(opts.css);
  log2(`Parsed build options: %O`, {
    themeFilePath,
    cssPropertiesFilePath
  });
  const data = await readFile(input);
  const valid = ajv.validate(schema_default, data);
  if (!valid) {
    console.log(marks.fail, chalk.red("Failed JSON schema validation"));
    return console.error(ajv.errors);
  }
  console.log(marks.pass, chalk.green(`Passed JSON schema validation`));
  const { colors, scale, name, ...theme } = data;
  const result = mapObject(theme, (key, value) => {
    if (value == null) {
      return mapObjectSkip;
    }
    const parsedValue = parseValue(value);
    if (parsedValue == null) {
      return mapObjectSkip;
    }
    return [key, parsedValue];
  });
  const scales = create(scale);
  const expandedColors = Object.entries(colors).map(([key, value]) => {
    return [key, expand(value)];
  });
  const outputTheme = {
    ...theme,
    ...result,
    scale: scales,
    colors: expandedColors.reduce((acc, curr) => {
      acc[curr[0]] = curr[1];
      return acc;
    }, {})
  };
  if (scale?.field) {
    outputTheme[scale.field] = scales;
  } else if (scale?.fields) {
    for (const field of scale.fields) {
      outputTheme[field] = scales;
    }
  }
  await fs.writeFile(themeFilePath, JSON.stringify(outputTheme, null, 2));
  console.log(
    marks.pass,
    chalk.green(`Theme saved: ${chalk.dim(themeFilePath)}`)
  );
  await fs.writeFile(
    cssPropertiesFilePath,
    convertThemeToCSSProperties(outputTheme)
  );
  console.log(
    marks.pass,
    chalk.green(`CSS Properties saved: ${chalk.dim(cssPropertiesFilePath)}`)
  );
  console.log(marks.pass, chalk.green(`Done!`));
}

// src/index.ts
var { argv } = yargs(process.argv.slice(2)).usage("Usage: -i <input file> -o <output dir>").option("input", {
  alias: "i",
  describe: "Input file path",
  type: "string",
  demandOption: true
}).option("theme", {
  alias: "t",
  describe: "The path used to save the generated theme file",
  type: "string",
  demandOption: true,
  default: "./theme.json"
}).option("css", {
  alias: "c",
  describe: "The path used to save the generated css properties file",
  type: "string",
  demandOption: true,
  default: "./_variables.css"
});
try {
  const options = await argv;
  await build(options.input, {
    css: options.css,
    theme: options.theme
  });
} catch (err) {
  console.error(err);
}
//# sourceMappingURL=index.js.map

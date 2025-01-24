console.clear();

// Figma Plugin Code for Exporting Colors as Flutter Code
figma.showUI(__uiFiles__["export"], {
  width: 500,
  height: 500,
  themeColors: true,
});

// Generate Flutter enum declaration for modes
function generateModeEnum(collectionName: string, modes: { modeId: string; name: string }[]): string {
  const modeNames = modes.map(mode => `  ${toCamelCase(mode.name)}`).join(',\n');
  return `enum ${collectionName}Mode {
${modeNames}
}`;
}

async function generateVariableValues(variable: Variable, collectionName: string, modes: Mode[]): Promise<string> {
  if (modes.length === 0) {
    return '';
  }
  const { name, resolvedType, valuesByMode } = variable;
  const variableName = toCamelCase(name);
  const modeToValue = new Map<string, string>();

  let firstValue;
  let isSingleValue = true;

  for (const mode of modes) {
    const modeName = toCamelCase(mode.name);
    const modeValue = valuesByMode[mode.modeId];
    let strValue: string = '';
    if (isVariableAlias(modeValue)) {
      const currentVar = await figma.variables.getVariableByIdAsync(modeValue.id);
      if (currentVar === null) {
        continue;
      }
      strValue = toCamelCase(currentVar.name);
      modeToValue.set(modeName, toCamelCase(currentVar.name));
    } else if (isRGB(modeValue)) {
      strValue = `const Color(0x${rgbToHex(modeValue)})`;
    }

    if (strValue === '') {
      continue;
    }

    modeToValue.set(modeName, strValue);
    if (firstValue === undefined) {
      firstValue = strValue;
    } else if (firstValue !== strValue) {
      isSingleValue = false;
    }
  }

  if (modeToValue.size === 0) {
    return '';
  }

  if (isSingleValue) {
    return `  static Color ${variableName} = ${firstValue};`;
  } else {
    return `  static Color ${variableName}(${collectionName}Mode mode) {
    switch (mode) {
${Array.from(modeToValue.entries())
          .map(([modeName, value]) => `      case ${collectionName}Mode.${modeName}: return ${value};`)
          .join('\n')}
    }
  }`;
  }
}

type Mode = {
  modeId: string;
  name: string;
}

// Process collection to generate Flutter code representing colors
async function processCollection(collection: {
  name: string;
  modes: Mode[];
  variableIds: string[];
}, collectionPrefix: string | undefined): Promise<string> {
  let colors: string[] = [];

  for (const variableId of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (variable === null) {
      continue;
    }
    colors.push(await generateVariableValues(variable, collection.name, collection.modes));
  }
  
  colors = colors.filter(color => color !== '');

  if (colors.length === 0) {
    return '';
  }

  const collectionName = toTitleCase(collection.name);
  let modeDeclaration = collection.modes.length > 0 ?  `${generateModeEnum(collectionName, collection.modes)}\n\n` : '';
  return `${modeDeclaration}class ${collectionPrefix}${collectionName} {
${colors.join('\n')}
}`;
}


// Get all color variables and their modes from Figma
async function extractCollectionColors(collectionPrefix: string | undefined): Promise<string> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionStrings: string[] = [];

  for (const collection of collections) {
    const str = await processCollection(collection, collectionPrefix);
    collectionStrings.push(str);
  }

  return `import 'dart:ui';\n\n${collectionStrings.join('\n\n')}`;
}

// Convert Figma RGB to Flutter-compatible hex
function rgbToHex(rgb: RGB | RGBA): string | null {
  const a =  hasAlpha(rgb) ? rgb.a : 1;
  const { r, g, b } = rgb;
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  const hex = [toHex(a), toHex(r), toHex(g), toHex(b)].join("");
  return `${hex.toUpperCase()}`;
}

// Listen for UI messages
figma.ui.onmessage = async (msg: { type: string, collectionPrefix: string | undefined }) => {
  if (msg.type === 'EXPORT') {
    // Extract colors from the Figma document
    const result = await extractCollectionColors(msg.collectionPrefix);

    // Send the Flutter code back to the UI
    figma.ui.postMessage({ type: 'EXPORT_RESULT', code: result });
  }
};

// Utility function to convert to camelCase
function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

// Utility function to convert to titlecase
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

function isRGB(value: VariableValue): value is RGB | RGBA {
  return (
      typeof value === 'object' &&
      'r' in value &&
      'g' in value &&
      'b' in value
  );
}

function hasAlpha(value: RGB | RGBA): value is RGBA {
  return (
      typeof value === 'object' &&
      'a' in value
  );
}

function isVariableAlias(value: VariableValue): value is VariableAlias {
  return (
      typeof value === 'object' &&
      'type' in value &&
      value.type === 'VARIABLE_ALIAS' &&
      'id' in value
  );
}

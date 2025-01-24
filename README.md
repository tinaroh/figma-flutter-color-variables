# Figma Color Variables to Flutter

A Figma plugin that exports color variables to Flutter-compatible code. This plugin helps maintain color consistency between your Figma design system and Flutter codebase by automatically converting Figma color variables into type-safe Flutter color definitions.

## Features

- Exports Figma color variables as Flutter color constants
- Supports mode variants (such as light/dark mode)
- Generates enums for color modes, constants for colors, or aliases as camelCase
- Supports prefix name for classes

## Usage

1. Open your Figma file containing color variables
2. Run the plugin from Plugins > Flutter Color Variables
3. (Optional) Enter a prefix for the generated color classes
4. Click "Export" to generate the Flutter code
5. Copy the generated code into your Flutter project with "Copy All"

## Example Output

The plugin generates Flutter code in the following format:

```dart
import 'dart:ui';

enum ColorsMode {
  lightMode,
  darkMode
}

class Colors {
  // Single-value colors
  static Color primaryColor = const Color(0xFF000000);
  
  // Mode-dependent colors
  static Color backgroundColor(ColorsMode mode) {
    switch (mode) {
      case ColorsMode.lightMode:
        return const Color(0xFFFFFFFF);
      case ColorsMode.darkMode:
        return const Color(0xFF000000);
    }
  }
}
```

## Development

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:

  npm install -g typescript

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

  npm install --save-dev @figma/plugin-typings

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "npm: watch". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

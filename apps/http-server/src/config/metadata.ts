export const defaultMetadata = {
  framework: "Vite",
  rootDir: "/",
  buildandoutputSettings: {
    dependencyInstallationCommand: "npm install",
    buildCommand: "npm run build",
    outDir: "/dist",
  },
  environmentVariables: [
    {
      variablename: "SECRET_VARIABLE_1",
      variablevalue: "SECRET_VALUE_1",
    },
  ],
};

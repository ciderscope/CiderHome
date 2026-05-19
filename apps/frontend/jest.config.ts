import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@cuverie/shared$": "<rootDir>/../../packages/shared/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/test/styleMock.ts"
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { module: "CommonJS", jsx: "react-jsx" } }]
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"]
};

export default config;

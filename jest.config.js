module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  setupFiles: ["./jest.js"],
  testEnvironment: "jsdom",
};

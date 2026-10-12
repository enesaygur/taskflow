if (!process.env.DATABASE_URL?.includes("test")) {
  throw new Error(
    "Refusing to run tests: DATABASE_URL does not point to a test database",
  );
}
#!/usr/bin/env node

/**
 * Dependency Update Safety Verification Script
 *
 * This script runs after dependency updates to ensure critical compatibility
 * requirements are maintained. It checks:
 * 1. TypeScript version compatibility
 * 2. React version compatibility
 * 3. Key library version alignment
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Verifying dependency update safety...");

const rootPkgPath = path.join(process.cwd(), "package.json");
const backendPkgPath = path.join(process.cwd(), "backend-api", "package.json");

// Load package.json files
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath, "utf8"));

// Check React compatibility
const reactVersion = rootPkg.dependencies["react"];
const reactDomVersion = rootPkg.dependencies["react-dom"];

if (reactVersion !== reactDomVersion) {
  console.error("❌ Error: react and react-dom versions must match!");
  console.error(
    `   Found: react@${reactVersion}, react-dom@${reactDomVersion}`
  );
  process.exit(1);
}

// Check Supabase compatibility across packages
const frontendSupabaseVersion = rootPkg.dependencies["@supabase/supabase-js"];
const backendSupabaseVersion = backendPkg.dependencies["@supabase/supabase-js"];

if (frontendSupabaseVersion !== backendSupabaseVersion) {
  console.warn(
    "⚠️ Warning: Supabase versions differ between frontend and backend"
  );
  console.warn(`   Frontend: @supabase/supabase-js@${frontendSupabaseVersion}`);
  console.warn(`   Backend: @supabase/supabase-js@${backendSupabaseVersion}`);
}

// Check TypeScript version compatibility
const rootTsVersion = rootPkg.devDependencies["typescript"];
const backendTsVersion = backendPkg.devDependencies["typescript"];

if (rootTsVersion !== backendTsVersion) {
  console.warn("⚠️ Warning: TypeScript versions differ between packages");
  console.warn(`   Root: typescript@${rootTsVersion}`);
  console.warn(`   Backend: typescript@${backendTsVersion}`);
}

// Verify the build still works
try {
  console.log("🧪 Testing build compatibility...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✅ TypeScript compilation successful");
} catch (error) {
  console.error(
    "❌ Error: TypeScript compilation failed after dependency update"
  );
  process.exit(1);
}

// Verify tests pass
try {
  console.log("🧪 Running tests to verify compatibility...");
  execSync("npm test", { stdio: "inherit" });
  console.log("✅ All tests passed");
} catch (error) {
  console.error("❌ Error: Tests failed after dependency update");
  process.exit(1);
}

console.log("✅ Dependency update verified successfully");

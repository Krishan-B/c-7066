#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const glob = promisify(require("glob"));

// Headers that browsers restrict for security reasons
const FORBIDDEN_HEADERS = new Set([
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
  "user-agent",
]);

// Patterns that might indicate header manipulation
const HEADER_PATTERNS = [
  // Fetch API patterns
  {
    pattern: /headers:\s*{[^}]*['"]([^'"]+)['"]/g,
    description: "Fetch API headers object",
  },
  // Axios patterns
  {
    pattern: /headers\.common\[['"](.*?)['"]\]/g,
    description: "Axios common headers",
  },
  {
    pattern: /headers:\s*{[^}]*['"]([^'"]+)['"]/g,
    description: "Axios config headers",
  },
  // General header assignment patterns
  {
    pattern: /\.setRequestHeader\(['"](.*?)['"]/g,
    description: "XMLHttpRequest setRequestHeader",
  },
];

async function findFiles(baseDir) {
  const patterns = [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
  ];

  return await glob(patterns.join("|"), { cwd: baseDir });
}

async function analyzeFile(filePath, baseDir) {
  const issues = [];
  const fullPath = path.join(baseDir, filePath);
  const content = await readFile(fullPath, "utf8");

  // Check each pattern against file content
  for (const { pattern, description } of HEADER_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const headerName = match[1].toLowerCase();
      if (FORBIDDEN_HEADERS.has(headerName)) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          file: filePath,
          line: lineNumber,
          header: match[1],
          context: description,
          suggestion: getSuggestion(headerName),
        });
      }
    }
  }

  return issues;
}

function getSuggestion(headerName) {
  switch (headerName) {
    case "user-agent":
      return "Use navigator.userAgent for detection or pass as x-client-user-agent custom header";
    case "content-length":
      return "Content-Length is automatically set by the browser";
    case "host":
      return "Host header is automatically set by the browser";
    case "referer":
      return "Use Referrer-Policy header instead of manually setting Referer";
    default:
      return "This header cannot be set from client-side JavaScript";
  }
}

async function main() {
  try {
    // Determine workspace root (assumed to be two levels up from this script)
    const baseDir = path.resolve(__dirname, "..", "..");

    console.log("\n🔍 Scanning for unsafe header usage...\n");

    // Find all relevant files
    const files = await findFiles(baseDir);

    // Analyze each file
    const allIssues = [];
    for (const file of files) {
      const issues = await analyzeFile(file, baseDir);
      allIssues.push(...issues);
    }

    // Report findings
    if (allIssues.length === 0) {
      console.log("✅ No unsafe header usage detected!\n");
      process.exit(0);
    } else {
      console.log("⚠️  Found potentially unsafe header usage:\n");

      allIssues.forEach(({ file, line, header, context, suggestion }) => {
        console.log(`File: ${file}:${line}`);
        console.log(`Header: ${header}`);
        console.log(`Context: ${context}`);
        console.log(`Suggestion: ${suggestion}`);
        console.log("---");
      });

      console.log(`\nTotal issues found: ${allIssues.length}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error running header analysis:", error);
    process.exit(1);
  }
}

// Run the analysis
main();

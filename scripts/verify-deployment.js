#!/usr/bin/env node

/**
 * Post-deployment verification script for Wordy Kids
 * Usage: node scripts/verify-deployment.js https://your-app.onrender.com
 */

import https from "https";
import http from "http";

const APP_URL = process.argv[2] || "http://localhost:10000";
const isHttps = APP_URL.startsWith("https");
const client = isHttps ? https : http;

console.log("🔍 Verifying Wordy Kids deployment...");
console.log(`�� Target URL: ${APP_URL}\n`);

const tests = [
  {
    name: "Health Check",
    path: "/health",
    expected: { status: "healthy" },
  },
  {
    name: "API Ping",
    path: "/api/ping",
    expected: { message: /ping/i },
  },
  {
    name: "Frontend Loading",
    path: "/",
    expectedHeaders: { "content-type": /text\/html/ },
  },
  {
    name: "Static Assets",
    path: "/favicon.svg",
    expectedStatus: 200,
  },
];

async function runTest(test) {
  return new Promise((resolve) => {
    const url = new URL(test.path, APP_URL);

    const req = client.request(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const result = {
          name: test.name,
          status: res.statusCode,
          headers: res.headers,
          data: data,
        };

        try {
          if (test.expected) {
            const parsed = JSON.parse(data);
            result.parsed = parsed;
          }
        } catch (e) {
          // Not JSON, that's ok
        }

        resolve(result);
      });
    });

    req.on("error", (error) => {
      resolve({
        name: test.name,
        error: error.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: test.name,
        error: "Timeout after 10s",
      });
    });

    req.end();
  });
}

function validateResult(test, result) {
  if (result.error) {
    return { passed: false, message: `❌ Error: ${result.error}` };
  }

  if (test.expectedStatus && result.status !== test.expectedStatus) {
    return {
      passed: false,
      message: `❌ Expected status ${test.expectedStatus}, got ${result.status}`,
    };
  }

  if (test.expected) {
    for (const [key, expected] of Object.entries(test.expected)) {
      const actual = result.parsed?.[key];
      if (expected instanceof RegExp) {
        if (!expected.test(actual)) {
          return {
            passed: false,
            message: `❌ ${key} doesn't match pattern ${expected}`,
          };
        }
      } else if (actual !== expected) {
        return {
          passed: false,
          message: `❌ ${key} mismatch. Expected: ${expected}, Got: ${actual}`,
        };
      }
    }
  }

  if (test.expectedHeaders) {
    for (const [header, expected] of Object.entries(test.expectedHeaders)) {
      const actual = result.headers[header];
      if (expected instanceof RegExp) {
        if (!expected.test(actual)) {
          return {
            passed: false,
            message: `❌ Header ${header} doesn't match pattern ${expected}`,
          };
        }
      }
    }
  }

  return { passed: true, message: "✅ Passed" };
}

async function runAllTests() {
  console.log("Running verification tests...\n");

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);

    const result = await runTest(test);
    const validation = validateResult(test, result);

    console.log(validation.message);

    if (validation.passed) {
      passed++;
    } else {
      failed++;
      if (result.parsed) {
        console.log(`   Response: ${JSON.stringify(result.parsed, null, 2)}`);
      }
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All tests passed! Deployment is healthy.");

    console.log("\n📋 Next steps:");
    console.log("1. Run Lighthouse audit in browser");
    console.log("2. Test signup/login flow manually");
    console.log("3. Verify no plaintext passwords in localStorage");
    console.log("4. Check Builder.io assets load correctly");

    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Check the issues above.");
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error("💥 Script error:", error);
  process.exit(1);
});

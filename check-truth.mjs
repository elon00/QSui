import fs from "node:fs";

const checks = [
  {
    file: "README.md",
    forbidden: [
      /is_pqc_verified:\s*true/,
      /High-dimensional lattice verification stub/,
      /pqc_signature_scheme:\s*b"ML-DSA-87/,
      /EU MiCA Compliance.*audited/i,
    ],
  },
  {
    file: "server.ts",
    forbidden: [
      /Registered as an algorithmic utility token/i,
      /Non-Security Consumptive Utility Token/i,
      /100% immune to Shor/i,
      /checkpoint:\s*"38914500"/,
      /model:\s*"gemini-3\.7-flash"/,
      /deploymentVerifiedByThisEndpoint:\s*true/,
    ],
  },
];

let failed = false;
for (const { file, forbidden } of checks) {
  const body = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.test(body)) {
      console.error(`TRUTH CHECK FAIL: ${file} matches ${rule}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("TRUTH CHECK PASS");

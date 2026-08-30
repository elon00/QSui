import fs from "node:fs";
const files=["README.md","move/sources/quantum_sui.move"];
const forbidden=[
 /is_pqc_verified:\s*true/,
 /High-dimensional lattice verification stub/,
 /pqc_signature_scheme:\s*b"ML-DSA-87/,
 /EU MiCA Compliance.*audited/i
];
let failed=false;
for(const file of files){
 const body=fs.readFileSync(file,"utf8");
 for(const rule of forbidden){if(rule.test(body)){console.error(`TRUTH CHECK FAIL: ${file} matches ${rule}`);failed=true}}
}
if(failed)process.exit(1);
console.log("TRUTH CHECK PASS");

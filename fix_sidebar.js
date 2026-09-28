const fs = require("fs");
let code = fs.readFileSync("components/Sidebar.tsx", "utf8");

const menuItemRegex = /const MenuItem = \(\{[\s\S]*?\n  \);/m;
const match = code.match(menuItemRegex);

if (match) {
  code = code.replace(match[0], ""); // Remove from inside
  
  // Insert right before export function Sidebar
  code = code.replace("export function Sidebar", match[0] + "\n\nexport function Sidebar");
  
  fs.writeFileSync("components/Sidebar.tsx", code);
  console.log("Moved MenuItem outside");
}

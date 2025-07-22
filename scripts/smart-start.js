const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Function to get current IP
function getCurrentIP() {
  const interfaces = os.networkInterfaces();

  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    for (const alias of networkInterface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return null;
}

// Function to read current IP from config
function getCurrentConfigIP() {
  const configPath = path.join(__dirname, "../src/constants/api.ts");
  try {
    const content = fs.readFileSync(configPath, "utf8");
    const match = content.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error reading config:", error.message);
    return null;
  }
}

// Function to update IP in config files
function updateIPInFiles(newIP) {
  const files = ["src/services/axios.customize.ts", "src/constants/api.ts"];

  files.forEach((file) => {
    const filePath = path.join(__dirname, "..", file);
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const oldUrlPattern = /http:\/\/\d+\.\d+\.\d+\.\d+:3000\/api/g;
      const newUrl = `http://${newIP}:3000/api`;

      content = content.replace(oldUrlPattern, newUrl);
      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  });
}

// Main execution
try {
  const currentSystemIP = getCurrentIP();
  const currentConfigIP = getCurrentConfigIP();

  if (
    currentSystemIP &&
    currentConfigIP &&
    currentSystemIP !== currentConfigIP
  ) {
    updateIPInFiles(currentSystemIP);
  } else if (currentSystemIP && !currentConfigIP) {
    updateIPInFiles(currentSystemIP);
  }

  // Start Expo with the updated configuration
  execSync("npx expo start --clear", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Error during startup:", error.message);
  process.exit(1);
}

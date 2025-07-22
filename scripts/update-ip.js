#!/usr/bin/env node

/**
 * Utility script to update the backend API URL with the current IP address
 * Usage: node update-ip.js [new-ip]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Files to update
const FILES_TO_UPDATE = [
  "src/services/axios.customize.ts",
  "src/constants/api.ts",
];

// Get current IP address
function getCurrentIP() {
  try {
    if (process.platform === "win32") {
      const output = execSync("ipconfig", { encoding: "utf8" });
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes("IPv4 Address")) {
          const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match) {
            return match[1];
          }
        }
      }
    } else {
      // For macOS/Linux
      const output = execSync("ifconfig", { encoding: "utf8" });
      const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        return match[1];
      }
    }
  } catch (error) {
    console.error("Error getting IP address:", error.message);
  }
  return null;
}

// Update IP address in files
function updateIPInFiles(oldIP, newIP) {
  const oldUrl = `http://${oldIP}:3000/api`;
  const newUrl = `http://${newIP}:3000/api`;

  console.log(`Updating IP from ${oldIP} to ${newIP}`);

  let updatedFiles = 0;

  FILES_TO_UPDATE.forEach((filePath) => {
    const fullPath = path.join(__dirname, "..", filePath);

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const updatedContent = content.replace(new RegExp(oldUrl, "g"), newUrl);

        if (content !== updatedContent) {
          fs.writeFileSync(fullPath, updatedContent);
          console.log(`✅ Updated: ${filePath}`);
          updatedFiles++;
        } else {
          console.log(`⚠️  No changes needed: ${filePath}`);
        }
      } else {
        console.log(`❌ File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  });

  return updatedFiles;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  let newIP = args[0];

  if (!newIP) {
    // Auto-detect current IP
    newIP = getCurrentIP();
    if (!newIP) {
      console.error(
        "❌ Could not detect current IP address. Please provide IP manually."
      );
      console.log("Usage: node update-ip.js [new-ip]");
      process.exit(1);
    }
    console.log(`📡 Detected current IP: ${newIP}`);
  }

  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(newIP)) {
    console.error("❌ Invalid IP address format");
    process.exit(1);
  }

  // Find current IP in files
  const firstFile = path.join(__dirname, "..", FILES_TO_UPDATE[0]);
  let currentIP = null;

  if (fs.existsSync(firstFile)) {
    const content = fs.readFileSync(firstFile, "utf8");
    const match = content.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):3000/);
    if (match) {
      currentIP = match[1];
    }
  }

  if (!currentIP) {
    console.error("❌ Could not find current IP in configuration files");
    process.exit(1);
  }

  if (currentIP === newIP) {
    console.log("✅ IP address is already up to date");
    process.exit(0);
  }

  console.log(`🔄 Updating IP address from ${currentIP} to ${newIP}`);

  const updatedFiles = updateIPInFiles(currentIP, newIP);

  if (updatedFiles > 0) {
    console.log(`\n✅ Successfully updated ${updatedFiles} files`);
    console.log("🔄 Please restart your app to apply changes");
  } else {
    console.log("⚠️  No files were updated");
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateIPInFiles, getCurrentIP };

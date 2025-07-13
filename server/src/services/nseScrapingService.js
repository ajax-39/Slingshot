// NSE scraping service with enhanced error handling and debugging
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class NSEScrapingService {
  constructor() {
    this.downloadsDir = path.join(__dirname, "../../downloads");
    this.ensureDownloadsDirectory();
  }

  ensureDownloadsDirectory() {
    if (!fs.existsSync(this.downloadsDir)) {
      fs.mkdirSync(this.downloadsDir, { recursive: true });
      Logger.info("Created downloads directory: %s", this.downloadsDir);
    }
  }

  async downloadMarketData() {
    let browser = null;
    const startTime = Date.now();

    try {
      Logger.start("Initiating NSE market data download...");

      // Launch browser with comprehensive settings
      browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Configure page settings
      await this.configurePage(page);

      // Navigate to NSE website
      await this.navigateToNSE(page);

      // Find and trigger download
      const downloadedFile = await this.triggerDownloadAndWait(page);

      const duration = Date.now() - startTime;
      Logger.success("NSE data download completed in %dms", duration);

      return {
        success: true,
        data: downloadedFile.content,
        filename: downloadedFile.filename,
        size: downloadedFile.size,
        downloadTime: duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        "NSE download failed after %dms: %s",
        duration,
        error.message
      );
      throw new Error(`Download failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
        Logger.debug("Browser closed");
      }
    }
  }

  async launchBrowser() {
    Logger.debug("Launching Puppeteer browser...");

    const browserOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-extensions",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    };

    // Add Windows-specific settings
    if (process.platform === "win32") {
      browserOptions.args.push("--disable-features=TranslateUI");
    }

    const browser = await puppeteer.launch(browserOptions);
    Logger.debug("Browser launched successfully");
    return browser;
  }

  async configurePage(page) {
    Logger.debug("Configuring page settings...");

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Try to set download behavior, but don't fail if it doesn't work
    try {
      const client = await page.createCDPSession();
      await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: this.downloadsDir,
      });
      Logger.debug("Download behavior configured successfully");
    } catch (error) {
      Logger.warn(
        "Could not configure download behavior, will rely on default browser downloads: %s",
        error.message
      );
    }

    // Add request interception for debugging (optional)
    try {
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        Logger.debug("Request: %s %s", request.method(), request.url());
        request.continue();
      });

      page.on("response", (response) => {
        Logger.debug("Response: %d %s", response.status(), response.url());
      });
      Logger.debug("Request interception configured");
    } catch (error) {
      Logger.warn("Could not set up request interception: %s", error.message);
    }

    Logger.debug("Page configuration completed");
  }

  async navigateToNSE(page) {
    const nseUrl =
      "https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20TOTAL%20MARKET";
    Logger.info("Navigating to NSE website: %s", nseUrl);

    try {
      await page.goto(nseUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      Logger.success("Successfully navigated to NSE website");

      // Wait for page to be fully loaded
      await page.waitForTimeout(3000);

      // Check if page loaded correctly
      const title = await page.title();
      Logger.debug("Page title: %s", title);

      if (
        title.toLowerCase().includes("error") ||
        title.toLowerCase().includes("not found")
      ) {
        throw new Error(`Page load issue detected. Title: ${title}`);
      }
    } catch (error) {
      Logger.error("Navigation failed: %s", error.message);
      throw new Error(`Failed to navigate to NSE website: ${error.message}`);
    }
  }

  async triggerDownloadAndWait(page) {
    Logger.info(
      "Searching for download button and monitoring for file download..."
    );

    // Clear any existing files in downloads directory
    this.clearDownloadsDirectory();

    // Record initial file count
    const initialFiles = this.getDownloadedFiles();
    Logger.debug(
      "Initial files in download directory: %d",
      initialFiles.length
    );

    // Find and click download button
    await this.findAndClickDownloadButton(page);

    // Wait for file to appear with polling
    const maxWaitTime = 30000; // 30 seconds
    const pollInterval = 1000; // 1 second
    let waitTime = 0;

    while (waitTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      waitTime += pollInterval;

      const currentFiles = this.getDownloadedFiles();
      const newFiles = currentFiles.filter(
        (file) => !initialFiles.includes(file)
      );

      if (newFiles.length > 0) {
        Logger.success("New file detected: %s", newFiles[0]);
        // Wait a bit more to ensure download is complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
        break;
      }

      if (waitTime % 5000 === 0) {
        Logger.debug(
          "Still waiting for download... (%ds elapsed)",
          waitTime / 1000
        );
      }
    }

    // Process the downloaded file
    return await this.processDownloadedFile();
  }

  getDownloadedFiles() {
    try {
      const files = fs.readdirSync(this.downloadsDir);
      return files.filter((file) => file.endsWith(".csv"));
    } catch (error) {
      Logger.debug("Error reading download directory: %s", error.message);
      return [];
    }
  }

  async findAndClickDownloadButton(page) {
    Logger.info("Searching for download button...");

    // Multiple selector strategies for finding the download button
    const downloadSelectors = [
      'button[title*="Download" i]',
      'a[href*="csv" i]',
      'button[aria-label*="download" i]',
      ".download-csv",
      '[data-testid="download-csv"]',
      'button[class*="download" i]',
      'a[class*="download" i]',
      'button:has-text("Download")',
      'a:has-text("CSV")',
    ];

    let downloadTriggered = false;

    for (const selector of downloadSelectors) {
      try {
        Logger.debug("Trying selector: %s", selector);

        const element = await page.$(selector);
        if (element) {
          await element.click();
          downloadTriggered = true;
          Logger.success("Download triggered with selector: %s", selector);
          break;
        }
      } catch (error) {
        Logger.debug("Selector %s failed: %s", selector, error.message);
        continue;
      }
    }

    // Fallback: search for text-based selectors
    if (!downloadTriggered) {
      Logger.debug("Trying text-based fallback methods...");

      try {
        const clickResult = await page.evaluate(() => {
          const elements = Array.from(
            document.querySelectorAll("button, a, span, div")
          );
          const downloadElement = elements.find((element) => {
            const text = element.textContent?.toLowerCase() || "";
            const title = element.title?.toLowerCase() || "";
            const ariaLabel =
              element.getAttribute("aria-label")?.toLowerCase() || "";

            return (
              text.includes("download") ||
              text.includes("csv") ||
              title.includes("download") ||
              ariaLabel.includes("download") ||
              text.includes("export")
            );
          });

          if (downloadElement) {
            downloadElement.click();
            return true;
          }
          return false;
        });

        if (clickResult) {
          downloadTriggered = true;
          Logger.success("Download triggered with text-based fallback");
        }
      } catch (error) {
        Logger.debug("Text-based fallback failed: %s", error.message);
      }
    }

    if (!downloadTriggered) {
      // Take a screenshot for debugging
      const screenshotPath = path.join(
        this.downloadsDir,
        "debug-screenshot.png"
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      Logger.warn("Screenshot saved for debugging: %s", screenshotPath);

      throw new Error("Could not find or trigger download button on the page");
    }

    Logger.info("Download button clicked, waiting for file...");
    await page.waitForTimeout(3000); // Give time for download to start
  }

  clearDownloadsDirectory() {
    try {
      const files = fs.readdirSync(this.downloadsDir);
      files.forEach((file) => {
        if (file.endsWith(".csv")) {
          fs.unlinkSync(path.join(this.downloadsDir, file));
          Logger.debug("Cleared old CSV file: %s", file);
        }
      });
    } catch (error) {
      Logger.warn("Error clearing downloads directory: %s", error.message);
    }
  }

  async processDownloadedFile() {
    Logger.info("Processing downloaded file...");

    // Wait a bit more for download to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const files = fs.readdirSync(this.downloadsDir);
    const csvFiles = files.filter((file) => file.endsWith(".csv"));

    Logger.debug("Found %d CSV files in downloads directory", csvFiles.length);

    if (csvFiles.length === 0) {
      // List all files for debugging
      Logger.debug("All files in downloads directory: %j", files);
      throw new Error(
        "No CSV file was downloaded. Check if the download button works correctly."
      );
    }

    // Get the most recent CSV file
    const latestFile = csvFiles
      .map((file) => ({
        name: file,
        path: path.join(this.downloadsDir, file),
        time: fs.statSync(path.join(this.downloadsDir, file)).mtime,
      }))
      .sort((a, b) => b.time - a.time)[0];

    Logger.success(
      "Found downloaded file: %s (%d bytes)",
      latestFile.name,
      fs.statSync(latestFile.path).size
    );

    // Read file content
    const fileContent = fs.readFileSync(latestFile.path);
    const fileSize = fileContent.length;

    // Validate file content
    if (fileSize === 0) {
      throw new Error("Downloaded file is empty");
    }

    if (fileSize < 100) {
      Logger.warn(
        "Downloaded file is very small (%d bytes), might be invalid",
        fileSize
      );
    }

    // Clean up the downloaded file
    fs.unlinkSync(latestFile.path);
    Logger.debug("Cleaned up downloaded file");

    return {
      content: fileContent,
      filename: "nse_market_data.csv",
      size: fileSize,
    };
  }
}

export default NSEScrapingService;

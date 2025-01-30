import puppeteer from "puppeteer";

export const connectToSite = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      userDataDir:
        "/Users/xabaras666/Library/Application Support/Google/Chrome/Profile 3",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-infobars"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.messenger.com", {
      waitUntil: "networkidle0",
    });

    return { browser, page };
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const sendMessage = async (page, message) => {
  try {
    await page.keyboard.type(message);
    await page.keyboard.press("Enter");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

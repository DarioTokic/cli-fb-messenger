import * as cheerio from "cheerio";
import delay from "delay";
import blessed from "blessed";
import { connectToSite, sendMessage } from "./functions/index.js";
import {
  conversationsExtractor,
  messagesExtractor,
  currentConversationExtractor,
} from "./functions/extractors.js";

(async () => {
  try {
    const store = {
      browser: {},
      page: {},
      $: {},
      conversations: [],
      messages: [],
      messagesString: "",
      conversation: {},
    };

    const startMutationObserver = async () => {
      await store.page.evaluate(() => {
        const observer = new MutationObserver(() => {
          // Send a signal back to Puppeteer to refresh the cheerio content
          console.log("contentChanged");
          window.postMessage("contentChanged", "*");
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      });

      store.page.on("console", async (msg) => {
        if (msg.text() === "contentChanged") {
          const content = await store.page.content(); // Get the updated HTML content
          store.$ = cheerio.load(content); // Update cheerio with the latest content

          store.conversations = await conversationsExtractor(store.$);
          store.conversation = await currentConversationExtractor(store.$);
          store.messages = await messagesExtractor(store.$);
          store.messagesString = store.messages
            .map((message) => message.message)
            .join("\n");
        }
      });
    };

    const { browser: browserTemp, page: pageTemp } = await connectToSite();
    store.browser = browserTemp;
    store.page = pageTemp;
    store.$ = cheerio.load(await store.page.content());

    // Start the mutation observer to monitor changes
    startMutationObserver();

    const changeConversation = async (link) => {
      await store.page.evaluate((newPath) => {
        history.pushState({}, "", newPath);
        window.dispatchEvent(new Event("popstate"));
      }, link);

      store.$ = cheerio.load(await store.page.content());

      store.conversation = await currentConversationExtractor(store.$);
      store.conversation = await currentConversationExtractor(store.$);
      store.messages = await messagesExtractor(store.$);
    };

    // Extract current conversation
    store.conversation = await currentConversationExtractor(store.$);

    // Extract conversations
    store.conversations = await conversationsExtractor(store.$);

    // Extract messages
    store.messages = await messagesExtractor(store.$);

    // Create a screen object
    const screen = blessed.screen({
      smartCSR: true,
      title: "Messenger CLI",
    });

    // Create a layout grid
    const grid = new blessed.layout({
      parent: screen,
      width: "100%",
      height: "100%",
      layout: "layout",
    });

    // Header
    const header = blessed.box({
      parent: grid,
      top: 0,
      left: 0,
      width: "100%",
      height: "5%",
      content: `CLI Facebook Messenger - ${store.conversation.name}`,
      tags: true,
      align: "center",
      style: { fg: "white", bg: "blue", bold: true, align: "center" },
    });

    // Sidebar for chat list
    const chatListGrid = blessed.layout({
      parent: grid,
      top: "5%",
      left: 0,
      width: "30%",
      height: "97%",
    });

    const chatListHeader = blessed.box({
      parent: chatListGrid,
      top: 0,
      width: "95%",
      height: "10px",
      content: "Chats",
      tags: true,
      align: "center",
      style: {
        fg: "white",
        bg: "red",
        bold: true,
      },
    });

    const chatList = blessed.list({
      parent: chatListGrid,
      top: "10%",
      left: 0,
      width: "95%",
      height: "99%",
      items: store.conversations.map((conversation) => conversation.name),
      keys: true,
      border: "line",
      style: {
        fg: "white",
        border: { fg: "white" }, // Default border color
        selected: {
          bg: "blue",
        },
        focus: {
          border: { fg: "green" }, // Green border when focused
        },
      },
    });

    // Current chat box
    const chatBox = blessed.box({
      parent: grid,
      top: "10%",
      left: "30%",
      width: "71%",
      height: "97%",
      content: "Chat messages for [Current Chat]...",
      tags: true,
      align: "center",
      border: "line",
      style: {
        fg: "white",
        bold: true,
      },
    });

    // Messages box
    const messagesBox = blessed.box({
      parent: chatBox,
      top: 0,
      left: 0,
      width: "98%",
      height: "85%",
      content: store.messagesString,
      tags: true,
      align: "center",
      border: "line",
      style: {
        fg: "white",
        bold: true,
      },
    });

    // Message input box
    const messageInput = blessed.textbox({
      parent: chatBox,
      top: "85%",
      left: 0,
      width: "98%",
      height: "13%",
      content: "Type message here...",
      tags: true,
      inputOnFocus: true,
      border: "line",
      style: {
        fg: "white",
        border: { fg: "white" }, // Default border color
        selected: {
          bg: "blue",
        },
        focus: {
          border: { fg: "green" }, // Green border when focused
        },
      },
    });

    // Allow navigating the chat list
    chatList.focus();
    chatList.on("select", async (item, index) => {
      const link = store.conversations[index].link;

      await changeConversation(link);

      header.setContent(`Messenger CLI - ${store.conversation.name}`);
      store.messagesString = store.messages
        .map((message) => message.message)
        .join("\n");
      messagesBox.setContent(store.messagesString);

      screen.render();
      messageInput.focus();
    });

    // Allow sending messages
    messageInput.key("enter", async () => {
      const message = messageInput.getValue();
      await sendMessage(store.page, message);
      await delay(500);
      store.messages = await messagesExtractor(store.$);
      store.messagesString = store.messages
        .map((message) => message.message)
        .join("\n");
      messagesBox.setContent(store.messagesString);

      messageInput.clearValue();
      messageInput.focus();
      screen.render();
    });

    // Quit on Ctrl+C
    screen.key(["escape", "C-c"], async () => {
      await store.browser.close();
      process.exit(0);
    });
    chatList.key(["escape", "C-c"], async () => {
      await store.browser.close();
      process.exit(0);
    });

    // Render the screen
    screen.render();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

import * as cheerio from "cheerio";
import delay from "delay";
import blessed from "blessed";
import { connectToSite, sendMessage } from "./functions/index.js";
import {
  conversationsExtractor,
  messagesExtractor,
  currentConversationExtractor,
} from "./functions/extractors.js";
import {
  createGrid,
  createHeader,
  createChatListGrid,
  createChatListHeader,
  createChatList,
  createChatBox,
  createMessagesBox,
  createMessageInput,
  updateMessages,
  updateChatList,
} from "./functions/layout.js";

(async () => {
  try {
    const store = {
      browser: {},
      page: {},
      $: {},
      conversations: [],
      messages: [],
      conversation: {},
    };

    // Create a screen object
    const screen = blessed.screen({
      smartCSR: true,
      title: "Messenger CLI",
    });

    // Create a layout
    const grid = createGrid(screen);
    const header = createHeader(grid);
    const chatListGrid = createChatListGrid(grid);
    const chatListHeader = createChatListHeader(chatListGrid);
    const chatList = createChatList(chatListGrid);
    const chatBox = createChatBox(grid);
    const messagesBox = createMessagesBox(chatBox);
    const messageInput = createMessageInput(chatBox);

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
          updateMessages(messagesBox, store.messages);
          updateChatList(chatList, store.conversations, screen);
        }
      });
    };

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

    const { browser: browserTemp, page: pageTemp } = await connectToSite();
    store.browser = browserTemp;
    store.page = pageTemp;
    store.$ = cheerio.load(await store.page.content());

    // Start the mutation observer to monitor changes
    startMutationObserver();

    // Extract current conversation, conversations and messages
    store.conversation = await currentConversationExtractor(store.$);
    store.conversations = await conversationsExtractor(store.$);
    store.messages = await messagesExtractor(store.$);

    updateChatList(chatList, store.conversations, screen);
    updateMessages(messagesBox, store.messages);

    // Allow navigating the chat list
    chatList.focus();
    chatList.on("select", async (item, index) => {
      const link = store.conversations[index].link;

      await changeConversation(link);

      header.setContent(`Messenger CLI - ${store.conversation.name}`);
      updateMessages(messagesBox, store.messages);

      screen.render();
      messageInput.focus();
    });

    // Allow sending messages
    messageInput.key("enter", async () => {
      const message = messageInput.getValue();
      await sendMessage(store.page, message);
      await delay(500);
      store.messages = await messagesExtractor(store.$);
      updateMessages(messagesBox, store.messages);

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

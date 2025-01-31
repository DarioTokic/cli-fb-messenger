import blessed from "blessed";

export const createGrid = (parent) => {
  return new blessed.layout({
    parent: parent,
    width: "100%",
    height: "100%",
    layout: "layout",
  });
};

export const createHeader = (parent) => {
  return blessed.box({
    parent: parent,
    top: 0,
    left: 0,
    width: "100%",
    height: "5%",
    content: `CLI Facebook Messenger - Chats`,
    tags: true,
    align: "center",
    style: { fg: "white", bg: "blue", bold: true, align: "center" },
  });
};

export const createChatListGrid = (parent) => {
  return blessed.layout({
    parent: parent,
    top: "5%",
    left: 0,
    width: "30%",
    height: "97%",
  });
};

export const createChatListHeader = (parent) => {
  return blessed.box({
    parent: parent,
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
};

export const createChatList = (parent) => {
  return blessed.list({
    parent: parent,
    top: "10%",
    left: 0,
    width: "95%",
    height: "99%",
    items: [],
    keys: true,
    vi: true,
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
};

export const createChatBox = (parent) => {
  return blessed.box({
    parent: parent,
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
};

export const createMessagesBox = (parent) => {
  return blessed.box({
    parent: parent,
    top: 0,
    left: 0,
    width: "98%",
    height: "85%",
    tags: true,
    valign: "bottom",
    border: "line",
    type: "box",
    style: {
      fg: "white",
      bold: true,
      focus: {
        border: { fg: "green" }, // Green border when focused
      },
    },
  });
};

export const createMessageInput = (parent) => {
  return blessed.textbox({
    parent: parent,
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
};

export const createMessageBubble = (
  parent,
  bottomOffset,
  estimatedHeight,
  message,
) => {
  const messageBubble = blessed.box({
    parent: parent,
    bottom: bottomOffset,
    width: "50%",
    height: estimatedHeight,
    content: message.message,
    tags: true,
    border: "line",
    style: {
      fg: "white",
      bold: true,
      border: { fg: "blue" },
    },
  });

  // Align left or right dynamically
  if (message.sender === "You sent") {
    messageBubble.right = 0; // Align to the right
  } else {
    messageBubble.left = 0; // Align to the left
  }

  return messageBubble;
};

export const updateMessages = (messagesBox, messages) => {
  // Clear existing messages before adding new ones
  messagesBox.children.forEach((child) => messagesBox.remove(child));

  // Calculate actual message box width
  const screenWidth = messagesBox.screen.width;
  const chatBoxWidth = Math.floor((screenWidth * 71) / 100); // 71% of screen width
  const messagesBoxWidth = Math.floor((chatBoxWidth * 98) / 100); // 98% of chatBox width

  // Set message width as 50% of available messagesBox width
  const messageWidth = Math.floor(messagesBoxWidth * 0.5);
  let bottomOffset = 0;

  // Iterate in reverse to add messages from the bottom up
  messages.reverse().forEach((message) => {
    if (message.message === "") return;

    // Estimate message height based on text length
    let estimatedHeight = Math.ceil(message.message.length / messageWidth + 2);

    const messageBubble = createMessageBubble(
      messagesBox,
      bottomOffset,
      estimatedHeight,
      message,
    );

    bottomOffset += estimatedHeight;
  });

  messagesBox.screen.render(); // Re-render the screen
};

export const updateChatList = (chatList, conversations, screen) => {
  chatList.setItems(conversations.map((conversation) => conversation.name));
  screen.render(); // Re-render to show updated list
};

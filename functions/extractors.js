export const conversationsExtractor = async ($) => {
  const conversations = [];
  const conversationNodes = $(
    ".x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x10wlt62.x1n2onr6 > div > div > .x1n2onr6 > .x78zum5.xdt5ytf",
  );

  conversationNodes.each((index, element) => {
    const link = $(element).find("a").attr("href");
    const name = $(element)
      .find(".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft")
      .first()
      .text();
    const lastMessage = $(element)
      .find(".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft")
      .eq(1)
      .text();

    conversations.push({ link, name, lastMessage });
  });

  return conversations;
};

export const currentConversationExtractor = async ($) => {
  const headerDiv = $(
    ".x9f619.x1ja2u2z.x78zum5.x1n2onr6.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.xexx8yu.xykv574.xbmpl8g.x4cne27.xifccgj",
  );
  const name = headerDiv.find("h2").text();
  const active = headerDiv
    .find(
      ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xlh3980.xvmahel.x1n0sxbx.x1nxh6w3.x1fcty0u.xi81zsa.x1yc453h.x4zkp8e.x676frb.xq9mrsl",
    )
    .text();

  return { name, active };
};

export const messagesExtractor = async ($) => {
  const messages = [];
  const messageNodes = $(
    ".x78zum5.xdt5ytf.x1iyjqo2.x2lah0s.xl56j7k.x121v3j4 > div",
  );

  messageNodes.each((index, element) => {
    let message = $(element)
      .find(
        ".html-div.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp.x11i5rnm.x12nagc.x1mh8g0r.x1yc453h.x126k92a.xyk4ms5",
      )
      .text();

    if (message === "") {
      message = $(element)
        .find(
          ".html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x78zum5.xh8yej3",
        )
        .text();
    }

    const sender = $(element)
      .find(
        ".html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs.xzpqnlu.x1hyvwdk.xjm9jq1.x6ikm8r.x10wlt62.x10l6tqk.x1i1rx1s",
      )
      .text();
    let time = $(element)
      .find(
        ".html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs.x1xf6ywa",
      )
      .text();

    messages.push({ message, sender, time });
  });

  return messages;
};

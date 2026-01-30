// Demo script to add test messages for search functionality testing
export function addTestMessages(chatStore) {
  const testMessages = [
    {
      type: "text",
      content: "你好，这是一个测试消息",
      role: "own",
      user: chatStore.userList[0] // 你自己
    },
    {
      type: "text", 
      content: "Hello, this is a test message for search functionality",
      role: "other",
      user: chatStore.userList[1] // 小甜甜
    },
    {
      type: "text",
      content: "搜索功能测试：关键词高亮显示",
      role: "own",
      user: chatStore.userList[0]
    },
    {
      type: "text",
      content: "The search feature should highlight keywords in yellow",
      role: "other", 
      user: chatStore.userList[1]
    },
    {
      type: "voice",
      content: "语音转文字测试消息，包含关键词：测试",
      role: "own",
      user: chatStore.userList[0]
    },
    {
      type: "text",
      content: "Navigation should work with Previous/Next buttons",
      role: "other",
      user: chatStore.userList[1]
    },
    {
      type: "text",
      content: "键盘快捷键：Enter下一个，Shift+Enter上一个，Esc清除",
      role: "own",
      user: chatStore.userList[0]
    },
    {
      type: "text",
      content: "搜索结果应该显示计数，例如：3/8",
      role: "other",
      user: chatStore.userList[1]
    }
  ];

  // Add messages with delays to simulate real conversation
  testMessages.forEach((message, index) => {
    setTimeout(() => {
      chatStore.sentChat(message);
    }, index * 500);
  });

  console.log('Added test messages for search functionality');
}
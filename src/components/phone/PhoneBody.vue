<template>
  <div class="phone-body" :class="{'dark': appearance.darkMode}" ref="phoneBodyRef" @contextmenu.stop="handlePhoneBodyContextMenu">
    <!-- 搜索框 -->
    <div class="search-container" :class="{'dark': appearance.darkMode}">
      <a-input
        v-model:value="searchKeyword"
        placeholder="搜索对话内容"
        @input="handleSearch"
        @keyup.enter="handleNext"
        @keyup.shift.enter="handlePrev"
        @keyup.esc="clearSearch"
      />
      <div class="search-controls">
        <a-button @click="handlePrev" :disabled="currentMatchIndex < 0">上一个</a-button>
        <a-button @click="handleNext" :disabled="currentMatchIndex >= matchCount - 1">下一个</a-button>
        <a-button @click="clearSearch">清除</a-button>
      </div>
      <div class="search-count" v-if="matchCount > 0">
        {{ currentMatchIndex + 1 }}/{{ matchCount }}
      </div>
    </div>
    <div class="wechat-content">
      <div class="wechat-item" :id="chat.id" v-for="chat in useChatStore.chatList" :key="chat.id" :class="{'wechat-item-right': chat.role === 'own', 'wechat-item-rejected': chat.role === 'own' && chat.rejected, 'wechat-item-notice-box': !showAvatar(chat), 'active': useContextMenuStore.activeChatId === chat.id, 'search-match': isMatch(chat)}" @contextmenu.stop="e => rightClicked(e, chat.id)">
        <div class="wechat-item-avatar" v-if="showAvatar(chat)">
          <img :src="chat.user.avatar" alt="">
        </div>
        <div>
          <div class="wechat-item-name" v-if="useSystemStore.appearance.showChatName && !['time', 'takeAPat', 'revoke', 'system'].includes(chat.type)">
            {{ chat.user.nickname }}
          </div>
          <div class="wechat-item-text" v-if="chat.type === 'text'" v-html="renderTextWithHighlight(chat.content, emojiBase64)"></div>
          <div class="wechat-item-text wechat-item-image" v-else-if="chat.type === 'image'">
            <img :src="chat.content" alt="">
          </div>
          <div class="wechat-item-text wechat-item-trans" :class="{'wechat-item-trans-received': chat.received}" v-else-if="chat.type === 'transferAccounts'">
            <div class="wechat-item-trans-content">
              <i></i> 
              <div>
                <span>¥{{ chat.money.toFixed(2) }}</span> 
                <span class="font" v-if="chat.received">已被领取</span>
                <span class="font" v-else-if="!chat.content">转账给{{ chat.role === 'own' ? useUserStore.activeUser.nickname : "你" }}</span>
                <span class="font" v-else>{{ chat.content }}</span>
              </div>
            </div>
            <div class="wechat-item-trans-bottom">
              <span>微信转账</span>
            </div>
          </div>
          <div class="wechat-item-text wechat-item-trans" :class="{'wechat-item-trans-received': chat.received}" v-else-if="chat.type === 'redEnvelope'">
            <div class="wechat-item-trans-content wechat-item-redp-content">
              <i></i> 
              <div>
                <!-- <span>¥{{ chat.money.toFixed(2) }}</span>  -->
                <span>{{ chat.content || "恭喜发财，大吉大利" }}</span>
                <span class="font" v-if="chat.received">已领取</span>
              </div>
            </div>
            <div class="wechat-item-trans-bottom">
              <span>微信红包</span>
            </div>
          </div>
          <div class="wechat-item-notice" v-else-if="chat.type === 'receive' && chat.receivedChatType === 'redEnvelope'">
            <i></i>{{ chat.role === 'own' ? "你" : useUserStore.activeUser.nickname }}领取了{{ chat.role === 'own' ? useUserStore.activeUser.nickname : "你" }}的<em>红包</em>
          </div>
          <div class="wechat-item-text wechat-item-trans wechat-item-trans-received" v-else-if="chat.type === 'receive' && chat.receivedChatType === 'transferAccounts'">
            <div class="wechat-item-trans-content">
              <i></i> 
              <div>
                <span>¥{{ chat.money.toFixed(2) }}</span> 
                <span class="font">已收款</span>
              </div>
            </div>
            <div class="wechat-item-trans-bottom">
              <span>微信转账</span>
            </div>
          </div>
          <!-- <div class="wechat-item-text wechat-item-voice" v-else-if="chat.type === 'voice'">
            <i></i> 
            <span>{{ chat.duration }}"</span>
            <div :style="{width: chat.duration * 5 + 'px'}"></div>
            <em v-if="!chat.received"></em>
          </div> -->
          <div class="wechat-item-voice-wrapper" v-else-if="chat.type === 'voice'">
            <div class="wechat-item-text wechat-item-voice">
              <i></i> 
              <span>{{ chat.duration }}"</span>
              <div :style="{width: chat.duration * 5 + 'px'}"></div>
              <em v-if="!chat.received"></em>
            </div>
            <div class="wechat-item-text wechat-item-voice-text" v-if="chat.content">{{ chat.content }}</div>
          </div>
          <div class="wechat-item-text wechat-item-av" v-else-if="chat.type === 'avInvite'">
            <i :class="[chat.invateType]"></i>
            <span v-if="chat.state === 'success'">通话时长 {{ chat.duration }}</span>
            <span v-else>{{ chat.role === "other" ? "对方" : "" }}{{ filterLabel(avInviteStates, chat.state) }}</span>
          </div>
          <div class="wechat-item-text wechat-item-businessCard" v-else-if="chat.type === 'businessCard'">
            <div class="info">
              <img :src="chat.image" alt="">
              <p>{{ chat.content }}</p>
            </div>
            <span>个人名片</span>
          </div>
          <div class="wechat-item-notice bg" :class="{'bold': chat.type === 'takeAPat' && chat.patBold}" v-else-if="['time', 'takeAPat', 'revoke', 'system'].includes(chat.type)">
            <span v-if="chat.type !== 'revoke'">{{ chat.content }}</span>
            <span v-else>{{ chat.role === 'own' ? "你" : useUserStore.activeUser.nickname }}撤回了一条消息</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import useStore from "@/store";
const { useSystemStore, useUserStore, useChatStore, useContextMenuStore } = useStore();
import useAutoScrollBottom from "@/hooks/useAutoScrollBottom";
import { renderText, filterLabel } from "@/utils/utils";
import { avInviteStates } from "@/utils/enum";

const props = defineProps({
  appearance: {
    type: Object,
    default: () => {},
  },
  emojiBase64: {
    type: Object,
    default: () => {},
  },
})

// 搜索相关变量
const searchKeyword = ref("");
const matchCount = ref(0);
const currentMatchIndex = ref(-1);
const matchedChatIds = ref([]);

// 渲染文本并高亮搜索关键词
const renderTextWithHighlight = (text, emojiBase64) => {
  if (!searchKeyword.value) {
    return renderText(text, emojiBase64);
  }
  
  let replacedText = text;
  
  // 先处理表情
  replacedText = replacedText.replace(/\[.*?\]/g, (match) => {
    const emoticon = match.trim().replace('[', '').replace(']', '');
    if (emojiBase64.hasOwnProperty(emoticon)) {
      const imageUrl = emojiBase64[emoticon];
      return `<img class="emoji-img" style="width:58px;margin:8px 4px 2px;vertical-align:bottom;" src="data:image/png;base64,${imageUrl}" alt="${emoticon}">`;
    }
    return match;
  });
  
  // 高亮搜索关键词
  const keyword = searchKeyword.value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&'); // 转义正则特殊字符
  const regex = new RegExp(`(${keyword})`, 'gi');
  replacedText = replacedText.replace(regex, '<span class="search-highlight">$1</span>');
  
  // 处理换行
  replacedText = replacedText.replace(/\n/g, "<br />");
  
  return replacedText;
};

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value) {
    clearSearch();
    return;
  }
  
  const chatList = useChatStore.chatList;
  const keyword = searchKeyword.value.toLowerCase();
  matchedChatIds.value = chatList
    .filter(chat => chat.type === 'text' && chat.content.toLowerCase().includes(keyword))
    .map(chat => chat.id);
  
  matchCount.value = matchedChatIds.value.length;
  currentMatchIndex.value = matchCount.value > 0 ? 0 : -1;
  
  if (matchCount.value > 0) {
    scrollToMatch(0);
  }
};

// 滚动到匹配项
const scrollToMatch = (index) => {
  if (index < 0 || index >= matchedChatIds.value.length) return;
  
  const chatId = matchedChatIds.value[index];
  const targetElement = document.getElementById(chatId);
  if (targetElement) {
    // 添加定位强调效果
    targetElement.classList.add('search-highlight-item');
    setTimeout(() => {
      targetElement.classList.remove('search-highlight-item');
    }, 1000);
    
    // 滚动到目标元素
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

// 下一个匹配项
const handleNext = () => {
  if (currentMatchIndex.value < matchCount.value - 1) {
    currentMatchIndex.value++;
    scrollToMatch(currentMatchIndex.value);
  }
};

// 上一个匹配项
const handlePrev = () => {
  if (currentMatchIndex.value > 0) {
    currentMatchIndex.value--;
    scrollToMatch(currentMatchIndex.value);
  }
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = "";
  matchCount.value = 0;
  currentMatchIndex.value = -1;
  matchedChatIds.value = [];
};

// 判断是否为匹配项
const isMatch = (chat) => {
  return matchedChatIds.value.includes(chat.id);
};

// 监听对话列表变化，更新搜索结果
watch(() => useChatStore.chatList, () => {
  if (searchKeyword.value) {
    handleSearch();
  }
}, { deep: true });

const handlePhoneBodyContextMenu = (e) => {
  e.preventDefault();
  useContextMenuStore.hideContextMenu();
  useContextMenuStore.activeChatId = "";
}

const rightClicked = (e, chatId) => {
  e.preventDefault();
  useContextMenuStore.showContextMenu(e.clientX, e.clientY, chatId);
};

const phoneBodyRef = ref(null)
useAutoScrollBottom(phoneBodyRef)

// watch(() => useContextMenuStore.activeChatId, (newVal) => {
//   if (newVal) {
//     const targetElement = document.getElementById(newVal);
//     if (targetElement) {
//       targetElement.scrollIntoView({
//         behavior: "smooth",
//         block: "nearest", // start center end nearest
//       });
//     }
//   }
// })

const showAvatar = (chat) => {
  return !['time', 'takeAPat', 'revoke', 'system'].includes(chat.type) && !(chat.type === 'receive' && chat.receivedChatType === 'redEnvelope') 
}
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none;
}
.phone-body {
  position: absolute;
  top: 264px;
  bottom: 269px;
  left: 0;
  right: 0;
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
  overflow-y: scroll;
  
  .search-container {
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 20px;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &.dark {
      background-color: #333;
      
      .ant-input {
        background-color: #444;
        border-color: #555;
        color: #fff;
      }
    }
    
    .search-controls {
      display: flex;
      gap: 5px;
    }
    
    .search-count {
      margin-left: auto;
      font-size: 14px;
      color: #666;
      
      &.dark {
        color: #ccc;
      }
    }
  }
  
  .search-highlight {
    background-color: #ffff00;
    font-weight: bold;
  }
  
  .search-highlight-item {
    animation: highlight 1s ease-in-out;
  }
  
  @keyframes highlight {
    0%, 100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(255, 255, 0, 0.2);
    }
  }
  
  .wechat-content {
    .wechat-item {
      padding: 25px 36px;
      position: relative;
      display: flex;
      &:hover, &.active {
        background-color: rgba(0, 0, 0, .15);
      }
      .wechat-item-name {
        margin: 0 0 12px 162px;
      }
      .wechat-item-avatar {
        width: 123px;
        height: 123px;
        background: #f1f1f1;
        border-radius: 15px;
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        background-position: center;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .wechat-item-voice-wrapper {
        display: flex;
        flex-direction: column;
      }
      .wechat-item-text {
        background: #fff;
        padding: 28px 38px;
        font-size: 48px;
        border-radius: 15px;
        margin-right: 140px;
        word-break: break-all;
        margin-left: 160px;
        display: inline-block;
        position: relative;
        line-height: normal;
        min-height: 123px;
        .emoji-img {
          width: 24px !important;
          height: 24px !important;
        }
        &:after {
          content: '';
          background: #fff;
          width: 24px;
          height: 24px;
          border-bottom-left-radius: 4px;
          top: 50px;
          left: -12px;
          position: absolute;
          transform: rotate(45deg);
        }
        &.wechat-item-image {
          border: 1px #d5d5d5 solid;
          padding: 0;
          background: none !important;
          img {
            max-width: 420px;
            max-height: 420px;
            border-radius: 15px;
            overflow: hidden;
          }
          &:after {
            display: none;
          }
        }
        &.wechat-item-trans {
          background: #f79c46 !important;
          width: 700px;
          padding-top: 0;
          padding-bottom: 0;
          .wechat-item-trans-content {
            display: flex;
            height: 192px;
            align-items: center;
            position: relative;
            i {
              width: 120px;
              height: 120px;
              background: url(@/assets/images/content/wechat-trans-icon1.png) no-repeat;
            }
            div {
              flex: 1;
              display: flex;
              flex-direction: column;
              margin-left: 30px;
              overflow: hidden;
              span {
                font-size: 48px;
                color: #fff;
                margin-top: -5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .font {
                font-size: 36px;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 4px;
              }
            }
          }
          .wechat-item-redp-content {
            i {
              width: 102px;
              margin-left: 9px;
              background: url(@/assets/images/content/wechat-trans-icon3.png) no-repeat;
            }
          }
          .wechat-item-trans-bottom {
            height: 71px;
            align-items: center;
            display: flex;
            span {
              font-size: 36px;
              color: #faecda;
            }
          }
          &:after {
            content: '';
            background: #f79c46 !important;
          }
        }
        &.wechat-item-trans-received {
          background: #f8e2c6 !important;
          .wechat-item-trans-content {
            i {
              background: url(@/assets/images/content/wechat-trans-icon2.png) no-repeat;
            }
          }
          .wechat-item-redp-content {
            i {
              background: url(@/assets/images/content/wechat-trans-icon4.png) no-repeat;
            }
          }
          .wechat-item-trans-bottom {
            span {
              color: #FFFFFF;
            }
          }
          &:after {
            background: #f8e2c6 !important;
          }
        }
        &.wechat-item-voice {
          display: flex;
          align-items: center;
          max-width: fit-content;
          span {
            font-size: 42px;
            padding-right: 20px;
            width: 120px;
          }
          i {
            width: 34px;
            height: 49px;
            background: url(@/assets/images/content/wechat-voice-icon1-light.png) no-repeat;
            margin-right: 30px;
            margin-left: 16px;
          }
          em {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #e75e58;
            position: absolute;
            right: -61px;
          }
        }
        &.wechat-item-voice-text {
          text-align: justify;
          margin-top: 20px;
          &:after {
            display: none;
          }
        }
        &.wechat-item-av {
          display: flex;
          align-items: center;
          span {
            margin: 0 12px;
          }
          i {
            display: block;
            position: relative;
            top: 2px;
            width: 64px;
            height: 28px;
            background-image: url(@/assets/images/content/wechat-audio-light.png);
            background-repeat: no-repeat;
            background-size: 100%;
            margin: 0px 18px 0 4px;
            &.video {
              width: 64px;
              height: 38px;
              background-image: url(@/assets/images/content/wechat-video-light.png);
            }
          }
        }
        &.wechat-item-businessCard {
          padding: 28px 28px 0;
          width: 60%;
          .info {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #E9E9E9;
            padding-bottom: 28px;
            img {
              width: 108px;
              border-radius: 12px;
              margin-right: 28px;
            }
            p {
              margin: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          span {
            position: relative;
            font-size: 28px;
            top: -8px;
          }
        }
      }
      &.wechat-item-right {
        justify-content: flex-end;
        .wechat-item-name {
          display: none;
        }
        .wechat-item-face {
          right: 0;
        }
        .wechat-item-voice-wrapper {
          align-items: end;
        }
        .wechat-item-text {
          background: #98e970;
          margin-left: 140px;
          margin-right: 160px;
          &:after {
            background: #98e970;
            left: auto;
            right: -10px;
            border-top-right-radius: 4px;
            border-bottom-left-radius: 0;
          }
          &.wechat-item-voice {
            flex-direction: row-reverse;
            span {
              padding-left: 20px;
              padding-right: 0;
            }
            i {
              background: url(@/assets/images/content/wechat-voice-icon2-light.png) no-repeat;
              margin-left: 30px;
              margin-right: 16px;
            }
            em {
              left: -61px;
            }
          }
          &.wechat-item-voice-text {
            color: var(--dark-text-color) !important;
          }
          &.wechat-item-av {
            flex-direction: row-reverse;
            i {
              margin: 0px 4px 0 18px;
              &.video {
                background-image: url(@/assets/images/content/wechat-video-light.png);
              }
            }
          }
          &.wechat-item-businessCard {
            background-color: #FFF;
            &:after {
              background: #FFF;
            }
          }
        }
      }
      &.wechat-item-notice-box {
        padding: 12px 38px;
        justify-content: center;
        .wechat-item-notice {
          font-size: 36px;
          color: #a6a6a6;
          justify-content: center;
          padding: 12px 16px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          &.bg {
            color: var(--light-text-color);
            background-color: rgba(255, 255, 255, 0.6);
          }
          &.bold {
            span {
              font-weight: bold;
            }
          }
          i {
            width: 45px;
            height: 51px;
            background: url(@/assets/images/content/wechat-redp-icon1.png) no-repeat;
            margin-right: 18px;
            margin-top: -5px;
          }
          em {
            font-style: normal;
            color: #ef9d49;
          }
        }
      }
      &.wechat-item-rejected {
        .wechat-item-text:not(.wechat-item-voice-text) {
          position: relative;
          &:before {
            content: "!";
            position: absolute;
            width: 64px;
            text-align: center;
            height: 64px;
            line-height: 64px;
            left: -91px;
            top: 50%;
            margin-top: -32px;
            font-size: 42px;
            color: var(--dark-text-color);
            border-radius: 50%;
            background-color: #FA5151;
          }
          &.wechat-item-voice {
            em {
              display: none;
            }
          }
        }
      }
    }
  }
  &.dark {
    .wechat-content {
      .wechat-item {
        &:hover, &.active {
          background-color: rgba(255, 255, 255, .15);
        }
        .wechat-item-text {
          background: #2b2b2b;
          color: #d5d5d5;
          &:after {
            content: '';
            background: #2b2b2b;
          }
          &.wechat-item-voice {
            i {
              background: url(@/assets/images/content/wechat-voice-icon1-dark.png) no-repeat;
            }
          }
          &.wechat-item-av {
            i {
              background-image: url(@/assets/images/content/wechat-audio-dark.png);
              &.video {
                background-image: url(@/assets/images/content/wechat-video-dark.png);
              }
            }
          }
        }
        &.wechat-item-right {
          .wechat-item-text {
            background: #3eb575;
            color: #000;
            &:after {
              background: #3eb575;
            }
            &.wechat-item-voice {
              i {
                background: url(@/assets/images/content/wechat-voice-icon2-light.png) no-repeat;
              }
            }
            &.wechat-item-av {
              i {
                background-image: url(@/assets/images/content/wechat-audio-light.png);
                &.video {
                  background-image: url(@/assets/images/content/wechat-video-light.png);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
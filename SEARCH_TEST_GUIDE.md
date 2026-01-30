# Search Functionality Test Guide

## How to Test the Search Features

### 1. **Basic Search Test**
1. Open the application
2. Click the search icon (🔍) in the navigation bar
3. Type a keyword (e.g., "测试" or "hello")
4. **Expected Results:**
   - Search results counter should show "1/X" where X is total matches
   - Messages containing the keyword should be highlighted in yellow
   - First result should be automatically scrolled to and highlighted with blue border

### 2. **Navigation Test**
1. With search results displayed:
   - Click "Next" button (↓) - should navigate to next result
   - Click "Previous" button (↑) - should navigate to previous result
   - **Expected Results:**
     - Counter should update (e.g., "2/X", "3/X")
     - Each result should scroll into view with blue border highlight
     - Navigation should wrap around (last → first, first → last)

### 3. **Keyboard Shortcuts Test**
1. With search active:
   - Press `Enter` - should go to next result
   - Press `Shift+Enter` - should go to previous result
   - Press `Escape` - should clear search
   - **Expected Results:** Same as button navigation

### 4. **Sender Filter Test**
1. Type a search keyword
2. Change sender filter dropdown:
   - "全部发送者" - searches all messages
   - "仅自己" - only your messages
   - "仅对方" - only other user's messages
   - Specific user names - only that user's messages
   - **Expected Results:**
     - Search results should update based on filter
     - Counter should reflect filtered results

### 5. **Clear Search Test**
1. Click "清除" button or press `Escape`
   - **Expected Results:**
     - Search input should clear
     - Highlights should disappear
     - Counter should disappear

### 6. **Context Switch Test**
1. Perform a search with results
2. Switch users or load a template
   - **Expected Results:**
     - Search should automatically clear
     - No highlights should remain

## Debug Information

The search functionality includes console logging. Open browser DevTools (F12) to see:
- Search completion: `Search completed: Found X results for "keyword"`
- Navigation: `Navigating to next/previous result: Y/X`
- Scrolling: `Scrolling to element with ID: chat-xxx`

## Common Issues and Solutions

### Issue: Search counter shows "无结果" but messages exist
**Solution:** Check that:
- Messages are text or voice type (images/transfers are not searchable)
- Sender filter is set correctly
- Keyword matches content exactly (case-insensitive)

### Issue: Navigation buttons don't work
**Solution:** Check browser console for errors. Ensure:
- Search results exist (counter > 0)
- No JavaScript errors in console

### Issue: No scrolling or highlighting
**Solution:** Check that:
- Message elements have proper IDs (chat-xxx)
- CSS classes are applied correctly
- Console shows "Scrolling to element" messages

### Issue: Keyword highlighting not visible
**Solution:** Check that:
- `.search-keyword` CSS class exists in global styles
- Yellow highlighting appears on matched text

## Performance Notes

- Search is performed in real-time as you type
- Large conversations (>1000 messages) may have slight delay
- Navigation is optimized for smooth scrolling
- Highlights are automatically cleaned up

## Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Need Help?

If search functionality is not working as expected:
1. Check browser console for errors
2. Verify all files were created/modified correctly
3. Ensure no conflicting CSS styles
4. Test with simple keywords first (e.g., "测试", "hello")
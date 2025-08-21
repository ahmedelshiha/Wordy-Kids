# Audio Pronunciation Bug Fix

## Problem

The audio pronunciation was playing twice when users clicked "Get Hint":

1. Auto-play triggered when hint was shown
2. Another audio call was being triggered somewhere else

## Solution Implemented

### 1. Debounced Audio Function

- Created `playPronunciationDebounced(isManual)` function
- Adds 150ms debounce for auto-play calls
- Allows immediate play for manual speaker button clicks
- Prevents overlapping audio calls

### 2. State Management

- Added `audioPlayedForHint` state to track if audio was already played for current word
- Added `audioDebounce` state to manage timeout cleanup
- Reset states when word changes

### 3. Updated All Audio Triggers

- Manual speaker buttons: Use `playPronunciationDebounced(true)` - allows replay
- Auto-play on hint: Uses `playPronunciationDebounced(false)` - debounced, single play
- Keyboard handler (spacebar): Uses `playPronunciationDebounced(true)` - manual

### 4. Cleanup Logic

- Clear debounce timeout on word change
- Clear debounce timeout on component unmount
- Reset audio flags when new word loads

## Behavior After Fix

✅ **"Get Hint" clicked**: Audio plays exactly once with 150ms debounce
✅ **Speaker icon clicked**: Audio plays immediately (manual replay allowed)
✅ **Spacebar pressed**: Audio plays immediately (manual replay)
✅ **Word changes**: Audio state resets, ready for new word
✅ **Double-click protection**: Debounce prevents rapid duplicate calls

## Testing

Console logs are temporarily added to track audio calls:

- `🔊 Audio call: Manual/Auto`
- `🔊 Playing audio manually`
- `🔊 Audio blocked: already played`
- `🔊 Auto-playing audio after debounce`

Remove console logs after testing is confirmed working.

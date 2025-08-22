# Chrome Web Store Submission Guide

## Files to Include in ZIP Archive

### Required Files:

```
7wtv-extension.zip
├── manifest.json
├── content.js
├── twitch-emoticons.js
├── icon.png (128x128)
└── README.md
```

### Optional Files (for reference):

- store-description.txt
- detailed-description.md
- privacy-policy.md
- terms-of-service.md

## Chrome Web Store Submission Steps

### 1. Create ZIP Archive

- Select all required files
- Create ZIP archive named `7wtv-extension.zip`
- Ensure no extra folders in ZIP

### 2. Chrome Web Store Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with Google account
3. Pay one-time $5 registration fee (if first time)

### 3. Upload Extension

1. Click "Add new item"
2. Upload `7wtv-extension.zip`
3. Fill in store listing information

### 4. Store Listing Information

#### Basic Information:

- **Name**: 7TV Smiles
- **Short Description**: Transform your chat experience with 7TV emotes!
- **Detailed Description**: Use content from `detailed-description.md`
- **Category**: Productivity or Social & Communication
- **Language**: English

#### Images:

- **Icon**: Upload `icon.png` (128x128)
- **Screenshots**: Create 1-5 screenshots (1280x800 or 640x400)
- **Promotional Images**: Optional

#### Privacy:

- **Privacy Policy**: Upload or link to privacy policy
- **Data Usage**: Select "This extension does not handle user data"

### 5. Permissions Justification

Explain why extension needs permissions:

- `activeTab`: "To access chat input fields for emote replacement"
- Host permissions: "To fetch emote data from 7TV API and work on supported websites"

**Note: This extension uses only safe permissions and does not request access to tabs, cookies, or all URLs.**

### 6. Submit for Review

- Review all information
- Submit for Chrome Web Store review
- Review process takes 1-3 business days

## Screenshots to Create

1. Extension working on w.tv chat
2. Autocomplete feature in action
3. Emotes appearing in chat messages
4. Extension settings/options (if any)

## Common Rejection Reasons to Avoid

- Missing privacy policy
- Unclear permission usage
- Poor description
- Broken functionality
- Copyright violations

## After Approval

- Extension will be available in Chrome Web Store
- Users can install directly from store
- Updates can be uploaded through dashboard

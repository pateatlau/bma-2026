# iOS Deployment Guide

This guide covers deploying the BMA 2026 app to the Apple App Store using EAS Build and EAS Submit.

## Prerequisites

### 1. Apple Developer Program

1. Go to [Apple Developer Program](https://developer.apple.com/programs/)
2. Enroll as an individual or organization ($99/year)
3. Wait for approval (usually 24-48 hours)

### 2. App Store Connect Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in required details:
   - **Platforms**: iOS
   - **Name**: BMA 2026
   - **Primary Language**: English
   - **Bundle ID**: Select or create `com.bma.app2026`
   - **SKU**: `bma2026` (unique identifier)
   - **User Access**: Full Access

### 3. Bundle Identifier

The app.config.js already configures the bundle ID:

```javascript
ios: {
  bundleIdentifier: `com.bma.app2026${bundleIdSuffix}`, // .dev, .preview, or empty
}
```

---

## Certificates & Provisioning

EAS handles certificates and provisioning profiles automatically. No manual setup required.

### Automatic (Recommended)

EAS manages everything:

```bash
# First build will prompt to create credentials
eas build --platform ios --profile production
```

### Manual (If Required)

If you need to manage credentials manually:

```bash
eas credentials --platform ios
```

Options:

- View current credentials
- Download certificates
- Upload existing certificates
- Manage provisioning profiles

---

## App Store Listing Requirements

Complete these in App Store Connect before submitting.

### Required Assets

| Asset              | Specification                                    |
| ------------------ | ------------------------------------------------ |
| App icon           | 1024 x 1024 px PNG, no alpha (provided by Expo)  |
| 6.7" screenshots   | 1290 x 2796 px (iPhone 15 Pro Max) - 1-10 images |
| 6.5" screenshots   | 1284 x 2778 px (iPhone 14 Plus) - 1-10 images    |
| 5.5" screenshots   | 1242 x 2208 px (iPhone 8 Plus) - 1-10 images     |
| iPad Pro 12.9"     | 2048 x 2732 px - required if supporting iPad     |
| iPad Pro 11"       | 1668 x 2388 px - required if supporting iPad     |
| App preview videos | Optional, up to 30 seconds, specific resolutions |

### Store Listing Fields

| Field            | Max Length | Notes                         |
| ---------------- | ---------- | ----------------------------- |
| App name         | 30 chars   | BMA 2026                      |
| Subtitle         | 30 chars   | Brief tagline                 |
| Keywords         | 100 chars  | Comma-separated, for search   |
| Description      | 4000 chars | Detailed app description      |
| What's New       | 4000 chars | Release notes for updates     |
| Promotional Text | 170 chars  | Can be updated without review |
| Support URL      | Required   | Link to support page          |
| Privacy Policy   | Required   | Link to privacy policy        |

### App Information

1. **Category**: Select primary and optional secondary category
2. **Age Rating**: Complete the questionnaire
3. **Copyright**: e.g., "2026 BMA"
4. **Content Rights**: Confirm you own or have rights to content

---

## TestFlight Distribution

Use TestFlight for beta testing before App Store release.

### Testing Groups

| Group Type   | Limit  | Review Required | Purpose                                |
| ------------ | ------ | --------------- | -------------------------------------- |
| **Internal** | 100    | No              | Team members (App Store Connect users) |
| **External** | 10,000 | Yes (first)     | Beta testers via email                 |

### Internal Testing

1. Build uploads automatically to TestFlight
2. Internal testers see it immediately
3. No Apple review required
4. Testers must have App Store Connect role

### External Testing

1. Go to **TestFlight** → **External Testing**
2. Create a group (e.g., "Beta Testers")
3. Add testers by email
4. First build requires Beta App Review (~24 hours)
5. Subsequent builds available immediately

### TestFlight Expiration

- Builds expire after 90 days
- Users are notified before expiration
- Upload new builds to continue testing

---

## Release Flow

### Recommended Flow

```
Development Build → Internal TestFlight → External TestFlight → App Store
        ↓                    ↓                    ↓                 ↓
    Local test          Immediate           24h review        1-3 day review
```

### Release Types

| Type              | Description                          |
| ----------------- | ------------------------------------ |
| Manual Release    | You control when the app goes live   |
| Automatic Release | Goes live immediately after approval |
| Phased Release    | 7-day gradual rollout to users       |

---

## Building for iOS

### Development Build (Simulator)

```bash
eas build --platform ios --profile development
```

### Preview Build (TestFlight)

```bash
eas build --platform ios --profile preview
```

### Production Build (App Store)

```bash
eas build --platform ios --profile production
```

---

## Submitting to App Store

### First Release (Manual Recommended)

1. Build production app:

   ```bash
   eas build --platform ios --profile production
   ```

2. Submit to App Store Connect:

   ```bash
   eas submit --platform ios --profile production
   ```

3. In App Store Connect:
   - Complete app information
   - Add screenshots and metadata
   - Set pricing (Free)
   - Submit for review

### Subsequent Releases (Automated)

```bash
# Build and submit in one step
eas build --platform ios --profile production --auto-submit

# Or submit a completed build
eas submit --platform ios --latest
```

---

## EAS Configuration

### Current Configuration (eas.json)

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Configuration Values

| Field         | Where to Find                                         |
| ------------- | ----------------------------------------------------- |
| `appleId`     | Your Apple ID email                                   |
| `ascAppId`    | App Store Connect → App → General → Apple ID (number) |
| `appleTeamId` | Apple Developer Portal → Membership → Team ID         |

### App Store Connect API Key (Recommended for CI/CD)

For automated CI/CD without password prompts:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Integrations** → **App Store Connect API**
2. Click **+** to generate a new key
3. Name: `EAS Submit`
4. Access: **App Manager** role
5. Download the .p8 file (only available once!)
6. Note the **Key ID** and **Issuer ID**

Update `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascApiKeyPath": "./appstore-api-key.p8",
        "ascApiKeyIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "ascApiKeyId": "XXXXXXXXXX"
      }
    }
  }
}
```

> **Security**: Add `appstore-api-key.p8` to `.gitignore`. Never commit this file!

---

## App Store Review Guidelines

### Common Rejection Reasons

1. **Crashes and bugs**: Test thoroughly before submission
2. **Broken links**: Ensure all URLs work
3. **Placeholder content**: Remove all "Lorem ipsum" and test data
4. **Missing privacy policy**: Must be accessible from app and listing
5. **Incomplete metadata**: All fields must be filled
6. **Misleading description**: Description must match app functionality
7. **Login issues**: Provide demo credentials if login required
8. **In-app purchases**: Must use Apple's IAP system

### Review Times

- **New apps**: 24-48 hours typical, up to 7 days
- **Updates**: Usually 24 hours
- **Expedited review**: Available for critical fixes

### Requesting Expedited Review

1. Submit your app normally
2. Go to App Store Connect → your app
3. Click on the build in review
4. Select **Request Expedited Review**
5. Explain the critical issue

---

## App Privacy Details

Required for all apps in App Store Connect.

### Data Types to Declare

| Category     | Examples                       |
| ------------ | ------------------------------ |
| Contact Info | Name, email, phone             |
| Identifiers  | User ID, device ID             |
| Usage Data   | Product interaction, analytics |
| Diagnostics  | Crash logs, performance data   |
| Location     | Precise or coarse location     |
| Purchases    | Purchase history               |

### Privacy Questions

1. **Do you collect data?** - List all data types
2. **Is data linked to user?** - If associated with account
3. **Is data used for tracking?** - Cross-app advertising
4. **Data used for purposes** - Analytics, app functionality, etc.

---

## Version Management

EAS handles version auto-increment:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Check Current Version

```bash
eas build:version:get --platform ios
```

### Set Version Manually

```bash
eas build:version:set --platform ios
```

### Version vs Build Number

- **Version** (e.g., 1.2.0): User-facing, shown in App Store
- **Build Number** (e.g., 42): Internal, increments with each build

---

## Troubleshooting

### Build Fails with Signing Error

```bash
# Reset credentials and try again
eas credentials --platform ios
# Select "Remove credentials" then rebuild
```

### App Rejected for Guideline Violation

1. Read rejection reason in App Store Connect
2. Fix the issue
3. Reply to reviewer with explanation
4. Resubmit

### TestFlight Build Not Appearing

- Processing can take 15-30 minutes
- Check for missing compliance (encryption questions)
- Verify build uploaded successfully in App Store Connect

### Submission Stuck in "Waiting for Review"

- Normal during busy periods (holidays, WWDC)
- Contact Apple if over 7 days
- Consider expedited review for critical fixes

---

## Security Checklist

- [ ] API key file (.p8) is in `.gitignore`
- [ ] Never commit Apple credentials
- [ ] Use GitHub Secrets for CI/CD
- [ ] Use App Store Connect API instead of password
- [ ] Enable two-factor authentication on Apple ID

---

## Useful Commands

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Build and auto-submit
eas build --platform ios --profile production --auto-submit

# Check build status
eas build:list --platform ios

# Manage credentials
eas credentials --platform ios

# OTA update (no store submission needed)
eas update --branch production --message "Bug fix"
```

---

## Cost Summary

| Item                    | Cost      | Frequency     |
| ----------------------- | --------- | ------------- |
| Apple Developer Program | $99       | Annual        |
| EAS Build (Free)        | $0        | 30/month      |
| EAS Build (Production)  | $99/month | Faster builds |

---

## Next Steps Checklist

1. [ ] Enroll in Apple Developer Program ($99/year)
2. [ ] Create app record in App Store Connect
3. [ ] Note Apple ID, ASC App ID, and Team ID
4. [ ] Update eas.json with your values
5. [ ] Create App Store Connect API key for CI/CD
6. [ ] Prepare screenshots for required device sizes
7. [ ] Write app description and keywords
8. [ ] Set up privacy policy URL
9. [ ] Build and upload first TestFlight build
10. [ ] Test with internal testers
11. [ ] Set up external testing group
12. [ ] Complete app privacy details
13. [ ] Submit for App Store review

---

## Related Documentation

- [EAS Submit iOS Documentation](https://docs.expo.dev/submit/ios/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)

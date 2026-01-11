# Android Deployment Guide

This guide covers deploying the BMA 2026 app to the Google Play Store using EAS Build and EAS Submit.

## Prerequisites

### 1. Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the one-time $25 registration fee
3. Complete identity verification (may take 24-48 hours)

### 2. Create App in Play Console

1. Navigate to **All apps** → **Create app**
2. Fill in required details:
   - **App name**: BMA 2026
   - **Default language**: English (India)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept Developer Program Policies

### 3. Service Account for CI/CD

This enables automated submissions via EAS Submit.

#### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name: `eas-submit-service-account`
6. Grant role: **Service Account User**
7. Click **Done**

#### Step 2: Create Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Download the file and save as `google-service-account.json` in project root

> **Security**: Never commit this file! It's already in `.gitignore`.

#### Step 3: Link to Play Console

1. Open [Google Play Console](https://play.google.com/console)
2. Go to **Settings** → **Developer account** → **API access**
3. Click **Link** under "Linked Projects" for your Cloud project
4. Under "Service accounts", find your account and grant **Admin** access

---

## App Store Listing Requirements

Complete these in Play Console before submitting.

### Required Assets

| Asset                      | Specification                                     |
| -------------------------- | ------------------------------------------------- |
| App icon                   | 512 x 512 px PNG (provided automatically by Expo) |
| Feature graphic            | 1024 x 500 px PNG or JPG                          |
| Phone screenshots          | 2-8 images, 16:9 or 9:16 ratio                    |
| 7-inch tablet screenshots  | Up to 8 images (recommended)                      |
| 10-inch tablet screenshots | Up to 8 images (recommended)                      |

### Store Listing

| Field             | Max Length | Notes                     |
| ----------------- | ---------- | ------------------------- |
| App name          | 30 chars   | BMA 2026                  |
| Short description | 80 chars   | Appears in search results |
| Full description  | 4000 chars | Detailed app description  |

### Privacy & Compliance

1. **Privacy Policy URL**: Required for all apps
2. **Data Safety**: Complete the questionnaire about data collection
3. **Content Rating**: Complete IARC questionnaire
4. **Target Audience**: Declare age group (likely 13+)
5. **Ads Declaration**: Declare if app contains ads

---

## Release Tracks

Use tracks to progressively roll out your app.

| Track          | Purpose              | Tester Limit | Play Store Visibility    |
| -------------- | -------------------- | ------------ | ------------------------ |
| **Internal**   | Team testing         | 100          | Hidden                   |
| **Closed**     | Invited beta testers | 500-2000     | Hidden                   |
| **Open**       | Public beta          | Unlimited    | Listed as "Early Access" |
| **Production** | Live release         | All users    | Fully visible            |

### Recommended Release Flow

```plaintext
Internal Testing → Closed Testing → Production (Staged Rollout)
       ↓                 ↓                    ↓
   1-2 days          3-7 days           10% → 50% → 100%
```

---

## Building for Android

### Development Build (for testing)

```bash
# Build development APK for local testing
eas build --platform android --profile development

# Build preview APK for internal distribution
eas build --platform android --profile preview
```

### Production Build (for Play Store)

```bash
# Build production AAB for Play Store
eas build --platform android --profile production
```

> **Note**: Production builds produce AAB (Android App Bundle) format, which is required by Play Store.

---

## Submitting to Play Store

### First Release (Manual)

For the very first submission, manual upload is recommended:

1. Build production app:

   ```bash
   eas build --platform android --profile production
   ```

2. Download the AAB from [EAS Dashboard](https://expo.dev)

3. In Play Console:
   - Go to **Release** → **Production** (or Internal Testing)
   - Click **Create new release**
   - Upload the AAB file
   - Add release notes
   - Click **Review release** → **Start rollout**

### Subsequent Releases (Automated)

After the first successful release, use EAS Submit:

```bash
# Submit latest build to internal track
eas submit --platform android --profile production

# Submit a specific build
eas submit --platform android --latest
```

### Using GitHub Actions

The EAS Release workflow automatically builds on tag push. To add auto-submission:

1. Store service account key as GitHub Secret:
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: Contents of `google-service-account.json`

2. Update `.github/workflows/eas-release.yml` to include submit step (currently commented out)

---

## EAS Configuration

The `eas.json` file configures submission:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### Configuration Options

| Option                    | Values                                    | Description                        |
| ------------------------- | ----------------------------------------- | ---------------------------------- |
| `track`                   | `internal`, `alpha`, `beta`, `production` | Which track to submit to           |
| `releaseStatus`           | `draft`, `completed`                      | Draft allows review before rollout |
| `changesNotSentForReview` | `true`, `false`                           | Skip review for internal/alpha     |

---

## Testing Strategies

### Internal Testing Setup

1. In Play Console, go to **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload your build
4. Under **Testers**, create a list and add email addresses
5. Share the opt-in link with testers

### Closed Testing Setup

1. Go to **Testing** → **Closed testing**
2. Create a track (e.g., "Beta Testers")
3. Add testers by email or Google Group
4. Share opt-in link

---

## Common Issues & Solutions

### Build Fails with Keystore Error

EAS manages keystores automatically. If you need a custom keystore:

```bash
eas credentials
```

### Submission Rejected

Common rejection reasons:

- Missing privacy policy
- Incomplete data safety form
- Policy violation in app content

### App Not Visible in Play Store

- New apps take 24-48 hours for initial review
- Staged rollout may limit visibility
- Check for suspended or rejected status

---

## Version Management

Version codes auto-increment with EAS:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

To check current version:

```bash
eas build:version:get --platform android
```

To set version manually:

```bash
eas build:version:set --platform android
```

---

## Security Checklist

- [ ] Service account JSON is in `.gitignore`
- [ ] Never commit API keys or secrets
- [ ] Use GitHub Secrets for CI/CD credentials
- [ ] Rotate service account keys periodically
- [ ] Use minimum required permissions for service account

---

## Useful Commands

```bash
# Build and submit in one step
eas build --platform android --profile production --auto-submit

# Check build status
eas build:list --platform android

# Check credentials
eas credentials --platform android

# Update app on devices without store submission (OTA)
eas update --branch production --message "Bug fix"
```

---

## Cost Summary

| Item                   | Cost      | Frequency                 |
| ---------------------- | --------- | ------------------------- |
| Google Play Console    | $25       | One-time                  |
| EAS Build (Free)       | $0        | 30 builds/month           |
| EAS Build (Production) | $99/month | More builds, faster queue |

---

## Next Steps

1. [ ] Create Google Play Console account
2. [ ] Create app listing in Play Console
3. [ ] Set up service account and download JSON key
4. [ ] Complete store listing (screenshots, descriptions)
5. [ ] Build and upload first production build
6. [ ] Set up internal testing track
7. [ ] Invite testers and verify installation
8. [ ] Submit for production review

---

## Related Documentation

- [EAS Submit Documentation](https://docs.expo.dev/submit/android/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Play Console Policy Center](https://play.google.com/console/about/guides/releasewithconfidence/)

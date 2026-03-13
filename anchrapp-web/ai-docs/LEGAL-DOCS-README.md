# Legal Documents Setup Guide

## ✅ Documents Created

I've created two comprehensive legal documents for Anchor:

1. **`privacy-policy.md`** - Privacy Policy
2. **`terms-of-service.md`** - Terms of Service

Both documents are:
- ✅ Tailored specifically for Anchor Bible App
- ✅ Include all your third-party services (Supabase, OpenAI, RevenueCat, etc.)
- ✅ Cover subscription terms and pricing
- ✅ Include AI Chat usage policies
- ✅ Compliant with Apple App Store and Google Play requirements
- ✅ Include GDPR and CCPA provisions
- ✅ Ready to use (just need minor customization)

---

## ✅ Customizations Complete

All required customizations have been completed:

### ✅ Email Addresses
- Contact email: **Anchrapp@outlook.com**
- All email references updated in both documents

### ✅ Legal Entity
- Governing Law: **South Carolina**
- Updated in Terms of Service, Section 15

### 📝 Optional Customization
If you have a registered company name or LLC, you can add it at the bottom of both documents (currently shows "Anchor Bible App").

---

## 🌐 How to Publish on Your Website

### Option 1: Convert to HTML (Recommended)

1. **Convert Markdown to HTML**:
   - Use a converter like [Markdown to HTML](https://markdowntohtml.com/)
   - Or use Netlify to automatically render markdown

2. **Create HTML pages**:
   ```html
   <!-- Example: privacy.html -->
   <!DOCTYPE html>
   <html>
   <head>
     <title>Privacy Policy - Anchor</title>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <style>
       body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: system-ui; line-height: 1.6; }
       h1 { color: #1a1a1a; }
       h2 { color: #333; margin-top: 2em; }
     </style>
   </head>
   <body>
     <!-- Paste converted HTML here -->
   </body>
   </html>
   ```

3. **Upload to Netlify**:
   ```bash
   cd anchrapp-web/public
   # Add privacy.html and terms.html
   netlify deploy --prod
   ```

### Option 2: Use a Legal Document Host

Services like:
- [Termly.io](https://termly.io) - Can host your docs
- [iubenda](https://www.iubenda.com) - Professional hosting
- Your own domain (recommended)

---

## 📱 Add Links to Your App

### Update Settings/Profile Screen

Add links to these documents in your app:

```typescript
// In frontend-new/app/settings.tsx or profile screen

<TouchableOpacity 
  onPress={() => Linking.openURL('https://anchrapp.io/privacy')}
>
  <Text>Privacy Policy</Text>
</TouchableOpacity>

<TouchableOpacity 
  onPress={() => Linking.openURL('https://anchrapp.io/terms')}
>
  <Text>Terms of Service</Text>
</TouchableOpacity>
```

### Typical Placement
Add a "Legal" section in your Settings or Profile tab:
```
Settings
  ├── Bible Version
  ├── Notifications
  ├── Account
  └── Legal
      ├── Privacy Policy
      ├── Terms of Service
      └── Licenses
```

---

## 🍎 Add to App Store Listing

When you submit to the App Store:

1. **App Privacy** section:
   - Link to: `https://anchrapp.io/privacy`

2. **App Information**:
   - Terms of Service URL: `https://anchrapp.io/terms`
   - Privacy Policy URL: `https://anchrapp.io/privacy`

3. **Required**: Both URLs must be publicly accessible

---

## ⚖️ Legal Review (Optional)

These documents are comprehensive but not a substitute for legal advice. Consider:

- **DIY Launch**: Use as-is for initial launch (common for indie apps)
- **Legal Review**: Have a lawyer review before launch ($200-500)
- **Update Later**: You can always update as you grow

Most indie developers launch with self-drafted documents and update them later.

---

## 🔄 Keeping Documents Updated

You should update these documents when you:
- Add new third-party services
- Change subscription pricing
- Add new features that collect data
- Expand to new countries
- Change your company structure

Update the "Last Updated" date at the top when you make changes.

---

## ✅ Next Steps

1. **Customize**: Replace email addresses and state
2. **Convert**: Turn markdown into HTML
3. **Host**: Upload to anchrapp.io at `/privacy` and `/terms`
4. **Link**: Add links in your app (Settings/Profile screen)
5. **Test**: Make sure URLs work
6. **App Store**: Add URLs to your App Store Connect listing

---

## 📧 Support

If you have questions about these documents:
- Email: Anchrapp@outlook.com
- Or message me here for clarifications

---

**Estimated Time**: 2-3 hours to customize, convert, and deploy

Once these are live, you can check off "Legal Documents" from your pre-launch checklist! 🎉

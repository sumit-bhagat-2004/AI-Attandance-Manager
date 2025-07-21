# Clerk Setup Instructions - AOT Email Restriction

## 🎯 **Goal: Only Allow @aot.edu.in Email Addresses**

### **Method 1: Clerk Dashboard (Primary - REQUIRED)**

#### **Step 1: Access Your Clerk Dashboard**
1. Visit: https://dashboard.clerk.com
2. Select your project: **"exciting-griffon-54"**

#### **Step 2: Configure Email Domain Restrictions**
1. **Navigate to Restrictions:**
   - Go to **"User & Authentication"** → **"Restrictions"**
   - Or: **"Settings"** → **"Restrictions"**

2. **Enable Email Domain Allowlist:**
   ```
   ✅ Toggle "Enable email domain allowlist" to ON
   📝 Add allowed domain: aot.edu.in
   💾 Click "Save changes"
   ```

3. **Verification:**
   - You should see: "Only users with email addresses from these domains can sign up"
   - Domain listed: `aot.edu.in`

#### **Step 3: Configure Google OAuth**
1. **Go to Social Connections:**
   - **"User & Authentication"** → **"Social Connections"**
   
2. **Enable Google:**
   ```
   🔍 Find "Google" in the list
   ✅ Toggle it ON
   ⚙️ Configure OAuth settings if prompted
   ```

3. **Set OAuth URLs (if needed):**
   - **Development**: `http://localhost:3000`
   - **Production**: Your production domain

#### **Step 4: Configure Sign-in/Sign-up URLs**
1. **Go to Paths:**
   - **"User & Authentication"** → **"Paths"**
   
2. **Set URLs:**
   ```
   Sign-in URL: /sign-in
   Sign-up URL: /sign-up  
   After sign-in: /
   After sign-up: /
   ```

### **Method 2: Additional Code-Level Security (Already Implemented)**

#### **✅ Current Code Protections:**
1. **Middleware Validation** - Double-checks email domain
2. **UI Warnings** - Clear messaging about domain restrictions  
3. **Unauthorized Page** - Custom page for rejected users
4. **Console Logging** - Tracks authorization attempts

#### **🔧 Optional: Webhook Validation** 
For extra security, add webhook secret to `.env.local`:
```bash
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### **⚠️ Important Notes**

#### **Dashboard Configuration is REQUIRED**
- The Clerk dashboard email domain restriction is the **primary security layer**
- Code-level validation is **secondary backup protection**
- Without dashboard configuration, users can still sign up with any email

#### **Testing Instructions**

1. **Enable domain restriction in Clerk dashboard first**
2. **Test with AOT email:**
   ```
   ✅ student@aot.edu.in → Should work
   ✅ faculty@aot.edu.in → Should work
   ```

3. **Test with non-AOT email:**
   ```
   ❌ user@gmail.com → Should be blocked
   ❌ student@other.edu → Should be blocked
   ```

### **🚀 Quick Setup Checklist**

- [ ] **Access Clerk Dashboard** (dashboard.clerk.com)
- [ ] **Enable Email Domain Allowlist**
- [ ] **Add domain: aot.edu.in**
- [ ] **Enable Google OAuth**
- [ ] **Test with AOT email**
- [ ] **Test with non-AOT email** (should be rejected)
- [ ] **Verify unauthorized page shows for rejected users**

### **🧪 Current Application Status**
- ✅ **Clerk keys configured**
- ✅ **Beautiful UI with domain warnings**
- ✅ **Code-level email validation** 
- ✅ **Enhanced middleware protection**
- ✅ **Catch-all routes working**
- ⏳ **Configure email domain allowlist in dashboard** (YOUR NEXT STEP)

Once you complete the dashboard configuration, your application will be fully secured to only allow AOT students!

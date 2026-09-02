# GitHub Par Code Kaise Push Karein

## Quick Guide - 3 Steps

### Step 1: GitHub Personal Access Token Banayein

1. Is link par jayein: https://github.com/settings/tokens
2. **"Generate new token"** → **"Generate new token (classic)"** click karein
3. Settings:
   - **Note**: `Education System Push`
   - **Expiration**: `90 days` (recommended)
   - **Select scopes**: ✅ Check karein **`repo`** (complete control)
4. Scroll down aur **"Generate token"** click karein
5. **Token COPY karein** - ye sirf ek baar dikhega! 
   - Example: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Token Script Mein Paste Karein

1. File open karein: `d:\education-system\push-to-github.ps1`
2. Line 10 par jayein jo dikhti hai aise:
   ```powershell
   $token = "YOUR_TOKEN_HERE"
   ```
3. `YOUR_TOKEN_HERE` ki jagah apna token paste karein:
   ```powershell
   $token = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
4. File **SAVE** karein (Ctrl+S)

### Step 3: Script Run Karein

PowerShell mein ye command run karein:

```powershell
cd d:\education-system
.\push-to-github.ps1
```

**Done!** ✅ Code GitHub par push ho jayega!

---

## Alternative Method: Manual Push

Agar script nahi chalana chahte:

### Method A: Git Credential Manager (Easiest)

```powershell
cd d:\education-system
git push -u origin main
```

Browser window khulega → GitHub login karein → Automatically push hoga

### Method B: Username + Token

```powershell
cd d:\education-system

# Remote update karein (token use karke)
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/shafeeqvibe1/education-system.git

# Push karein
git push -u origin main

# Security: Token remote se remove karein
git remote set-url origin https://github.com/shafeeqvibe1/education-system.git
```

Replace karein:
- `YOUR_USERNAME` → `shafeeqvibe1`
- `YOUR_TOKEN` → Apna generated token

---

## Verification - Push Successful Hua?

1. Browser mein jayein: https://github.com/shafeeqvibe1/education-system
2. Files dikhayi dein to **Success!** ✅
3. Agar empty hai to push nahi hua - dobara try karein

---

## Common Issues & Solutions

### Issue 1: "Authentication failed"
**Reason**: Token galat hai ya expire ho gaya
**Solution**: Naya token generate karein aur dobara try karein

### Issue 2: "Repository not found"
**Reason**: Repository GitHub par exist nahi karti
**Solution**: 
1. GitHub par jayein: https://github.com/new
2. Repository name: `education-system`
3. **Public** ya **Private** select karein
4. **Create repository** click karein (README add MAT karein!)
5. Phir push command dobara run karein

### Issue 3: "Permission denied"
**Reason**: Token mein `repo` scope nahi hai
**Solution**: Token generate karte waqt `repo` checkbox check karein

### Issue 4: "fatal: refusing to merge unrelated histories"
**Solution**:
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## Security Tips 🔒

1. **Token ko kisi se share MAT karein** - ye aapka password jaise hai
2. **Token ko code mein commit MAT karein**
3. Token use karne ke baad remote URL se remove kar dein:
   ```powershell
   git remote set-url origin https://github.com/shafeeqvibe1/education-system.git
   ```
4. Token ko secure jagah save karein (password manager)
5. 90 days baad token expire hoga - naya generate karein

---

## Next Steps After Push

### 1. Verify Code on GitHub
```
https://github.com/shafeeqvibe1/education-system
```

### 2. Deploy on Vercel
Dekhen: `DEPLOYMENT.md` file

### 3. Configure Environment Variables
Vercel dashboard mein add karein:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

---

## Need Help?

### Check Git Status
```powershell
git status
git log --oneline
git remote -v
```

### Force Push (Use Carefully!)
Agar kuch galat ho gaya aur fresh start chahiye:
```powershell
git push -u origin main --force
```
⚠️ Warning: Ye GitHub par existing code overwrite kar dega!

---

## Contact

Issues face ho to:
1. GitHub repository mein issue create karein
2. Error message screenshot lein
3. Kaunsa step fail hua wo note karein

---

**Good Luck!** 🚀

Agar script sahi se run ho gayi to aapka code automatically GitHub par push ho jayega aur aap Vercel par deploy kar sakte hain!

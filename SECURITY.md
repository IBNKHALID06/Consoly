# Security Policy

## 🔐 Security Overview

The Consoly Platform takes security seriously, especially given the sensitive nature of mental health data. This document outlines our security practices and how to report vulnerabilities.

## 🛡️ Security Measures

### **1. API Key Security**
- ✅ **Server-side only**: All API keys are stored server-side using `GOOGLE_AI_API_KEY`
- ❌ **Never client-side**: We never use `NEXT_PUBLIC_` prefixed API keys
- ✅ **Environment variables**: All secrets stored in environment variables
- ✅ **No hardcoded keys**: Zero API keys in source code

### **2. User Data Protection**
- ✅ **Password hashing**: bcrypt with 12 salt rounds
- ✅ **Email encryption**: AES-256-CBC encryption for email storage
- ✅ **Anonymous system**: Numeric IDs instead of personal identifiers
- ✅ **No personal data**: Minimal data collection policy

### **3. Infrastructure Security**
- ✅ **HTTPS enforcement**: All traffic encrypted in transit
- ✅ **Secure headers**: Security headers implemented
- ✅ **Input validation**: All user inputs validated and sanitized
- ✅ **Error handling**: Secure error messages without data leakage

### **4. AI Security**
- ✅ **Content filtering**: AI safety settings enabled
- ✅ **Crisis detection**: Automated crisis intervention
- ✅ **Rate limiting**: Protection against API abuse
- ✅ **Fallback systems**: Graceful degradation when AI unavailable

## 🚨 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes            |
| < 1.0   | ❌ No             |

## 📢 Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### **Immediate Action Required**
1. **DO NOT** create a public GitHub issue
2. **DO NOT** discuss the vulnerability publicly
3. **DO** report it privately using one of the methods below

### **How to Report**
- **Email**: Send details to [security@yourproject.com]
- **GitHub**: Use GitHub's private vulnerability reporting feature
- **Direct Message**: Contact maintainers directly

### **What to Include**
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)
- Your contact information

### **Response Timeline**
- **24 hours**: Initial acknowledgment
- **72 hours**: Preliminary assessment
- **7 days**: Detailed response with timeline
- **30 days**: Fix implementation (for critical issues)

## 🔍 Security Checklist for Contributors

Before submitting code, ensure:

- [ ] No API keys in source code
- [ ] No `NEXT_PUBLIC_` prefixed sensitive variables
- [ ] All user inputs are validated
- [ ] Passwords are properly hashed
- [ ] Sensitive data is encrypted
- [ ] Error messages don't leak information
- [ ] Dependencies are up to date
- [ ] Security tests pass

## 🚫 Common Security Anti-Patterns to Avoid

### **❌ Never Do This:**
\`\`\`javascript
// DON'T: Client-side API key exposure
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

// DON'T: Hardcoded secrets
const secret = "my-secret-key-123"

// DON'T: Plain text passwords
const password = userInput

// DON'T: Unencrypted sensitive data
const email = user.email
\`\`\`

### **✅ Always Do This:**
\`\`\`javascript
// DO: Server-side API key usage
const apiKey = process.env.GOOGLE_AI_API_KEY

// DO: Environment variables
const secret = process.env.ENCRYPTION_KEY

// DO: Hashed passwords
const hashedPassword = await bcrypt.hash(password, 12)

// DO: Encrypted sensitive data
const encryptedEmail = encrypt(email, process.env.ENCRYPTION_KEY)
\`\`\`

## 🔧 Security Configuration

### **Environment Variables (Required)**
\`\`\`bash
# Server-side only (never use NEXT_PUBLIC_ for these)
GOOGLE_AI_API_KEY=your_api_key_here
ENCRYPTION_KEY=your_32_char_encryption_key_here
JWT_SECRET=your_jwt_secret_here
\`\`\`

### **Deployment Security**
- Enable HTTPS/SSL certificates
- Set secure environment variables
- Configure proper CORS policies
- Enable security headers
- Set up monitoring and logging

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

## 🏆 Security Hall of Fame

We recognize security researchers who help improve our platform:

- *Your name could be here!*

## 📞 Emergency Contacts

For critical security issues:
- **Maintainer**: [Your contact information]
- **Security Team**: [Security team contact]
- **Emergency**: [Emergency contact for critical issues]

## 📄 Legal

This security policy is subject to our [Terms of Service] and [Privacy Policy].

---

**Security is everyone's responsibility. Thank you for helping keep Consoly Platform safe!**

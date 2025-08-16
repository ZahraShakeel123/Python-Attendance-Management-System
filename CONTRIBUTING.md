# Contributing to Attendance Management System

Thank you for your interest in contributing to the Attendance Management System! This document provides guidelines for contributing to this project.

## 🤝 How to Contribute

### **1. Fork the Repository**
1. Go to the main repository page
2. Click the "Fork" button in the top right corner
3. This creates a copy of the repository in your GitHub account

### **2. Clone Your Fork**
```bash
git clone https://github.com/YOUR_USERNAME/Attendence_Management.git
cd Attendence_Management
```

### **3. Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bugfix-name
```

### **4. Make Your Changes**
- Follow the coding standards
- Add comments to your code
- Test your changes thoroughly
- Update documentation if needed

### **5. Commit Your Changes**
```bash
git add .
git commit -m "Add: brief description of your changes"
```

### **6. Push to Your Fork**
```bash
git push origin feature/your-feature-name
```

### **7. Create a Pull Request**
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Write a clear description of your changes
5. Submit the pull request

## 📋 Pull Request Guidelines

### **Before Submitting:**
- [ ] Code follows the project's style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No sensitive data is included
- [ ] Changes are properly tested

### **Pull Request Title Format:**
- `Add: new feature description`
- `Fix: bug description`
- `Update: existing feature description`
- `Remove: deprecated feature description`

### **Pull Request Description:**
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No breaking changes

## Screenshots (if applicable)
Add screenshots of UI changes here.
```

## 🛠️ Development Setup

### **Prerequisites**
- Python 3.8+
- PostgreSQL 12+
- Git

### **Local Development**
1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Attendence_Management.git
   cd Attendence_Management
   ```

2. **Set up the database**
   ```bash
   psql -U postgres -f setup_database.sql
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   - Copy `config.env.example` to `config.env`
   - Update database credentials

5. **Run the application**
   ```bash
   python app.py
   ```

## 📝 Code Style Guidelines

### **Python Code**
- Follow PEP 8 style guide
- Use meaningful variable names
- Add docstrings to functions and classes
- Keep functions small and focused

### **JavaScript Code**
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Use meaningful function names

### **HTML/CSS**
- Use semantic HTML
- Follow BEM methodology for CSS
- Keep CSS organized and commented
- Use consistent indentation

## 🐛 Bug Reports

### **Before Reporting:**
1. Check existing issues
2. Search for similar problems
3. Test with the latest version

### **Bug Report Template:**
```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., Windows 10]
- Python Version: [e.g., 3.8.0]
- Database: [e.g., PostgreSQL 12]
- Browser: [e.g., Chrome 90]

## Screenshots
Add screenshots if applicable.
```

## 💡 Feature Requests

### **Feature Request Template:**
```markdown
## Feature Description
Clear description of the requested feature.

## Use Case
Why this feature is needed.

## Proposed Solution
How you think it should be implemented.

## Alternatives Considered
Other approaches you've considered.
```

## 📚 Documentation

### **When Contributing Documentation:**
- Keep it clear and concise
- Include examples where helpful
- Update related documentation
- Check for typos and grammar

## 🔒 Security

### **Security Guidelines:**
- Never commit sensitive data
- Report security issues privately
- Follow secure coding practices
- Validate all user inputs

## 🎯 Areas for Contribution

### **High Priority:**
- Bug fixes
- Security improvements
- Performance optimizations
- Documentation updates

### **Medium Priority:**
- New features
- UI/UX improvements
- Code refactoring
- Test coverage

### **Low Priority:**
- Cosmetic changes
- Minor optimizations
- Additional examples

## 📞 Getting Help

### **Need Help?**
- Check existing issues
- Search documentation
- Ask in discussions
- Contact maintainers

### **Questions?**
- Open an issue with the "question" label
- Use the discussions tab
- Join the community

## 🙏 Thank You

Thank you for contributing to the Attendance Management System! Your contributions help make this project better for everyone.

---

**Happy Coding! 🚀** 
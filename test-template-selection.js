const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 收集控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 收集网络请求和响应
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData()
      });
    }
  });

  const networkResponses = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('=== Step 1: 访问 http://localhost:5173 ===');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('页面加载成功');

    // 检查是否需要登录
    const pageContent = await page.content();
    const needsLogin = pageContent.includes('login') || pageContent.includes('登录') ||
                       pageContent.includes('email') || pageContent.includes('邮箱');

    if (needsLogin) {
      console.log('\n=== Step 2: 检测到需要登录，执行登录 ===');

      // 尝试找到登录表单
      const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="邮箱"], input[placeholder*="email" i]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');

      if (emailInput && passwordInput) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');

        // 找到登录按钮并点击
        const loginButton = await page.$('button[type="submit"], button:has-text("登录"), button:has-text("登录")');
        if (loginButton) {
          await loginButton.click();
          await page.waitForTimeout(2000);
          console.log('登录表单已提交');
        }
      }
    }

    console.log('\n=== Step 3: 进入"简历模板"页面 ===');

    // 尝试找到简历模板相关链接
    const templateLink = await page.$('a:has-text("模板"), a:has-text("简历"), [href*="template" i]');
    if (templateLink) {
      await templateLink.click();
      await page.waitForTimeout(2000);
      console.log('已点击模板链接');
    } else {
      // 尝试直接导航到模板页面
      await page.goto('http://localhost:5173/templates', { waitUntil: 'networkidle', timeout: 30000 });
      console.log('已导航到模板页面');
    }

    console.log('\n=== Step 4: 点击"选择"按钮 ===');

    // 等待模板卡片加载
    await page.waitForTimeout(1000);

    // 查找"选择"按钮
    const selectButton = await page.$('button:has-text("选择"), [class*="select" i] button, .template-card button');
    if (selectButton) {
      console.log('找到"选择"按钮，正在点击...');
      await selectButton.click();
      console.log('"选择"按钮已点击');

      // 等待响应
      await page.waitForTimeout(3000);
    } else {
      console.log('未找到"选择"按钮，尝试查找所有按钮:');
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        console.log(`  按钮: "${text}"`);
      }
    }

    console.log('\n=== 测试结果汇总 ===');

    console.log('\n--- 网络请求 (API) ---');
    networkRequests.forEach(req => {
      console.log(`${req.method} ${req.url}`);
    });

    console.log('\n--- 网络响应 (API) ---');
    networkResponses.forEach(res => {
      console.log(`${res.status} ${res.statusText} - ${res.url}`);
    });

    console.log('\n--- 控制台错误 ---');
    if (consoleErrors.length === 0) {
      console.log('无控制台错误');
    } else {
      consoleErrors.forEach(err => console.log(`ERROR: ${err}`));
    }

    // 检查是否有错误提示弹窗
    const errorPopup = await page.$('[role="alert"], .error, .ant-message-error, .toast-error');
    if (errorPopup) {
      const errorText = await errorPopup.textContent();
      console.log('\n--- 检测到错误提示 ---');
      console.log(errorText);
    }

  } catch (error) {
    console.error('\n=== 测试执行出错 ===');
    console.error(error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();

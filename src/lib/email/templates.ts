/**
 * QuickPostly Branded Transactional Email Templates
 * Domain: https://quickpostly.com
 * Support: support@quickpostly.com
 */

const CANONICAL_URL = process.env.NEXT_PUBLIC_CANONICAL_URL || 'https://quickpostly.com';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@quickpostly.com';
const APP_NAME = 'QuickPostly';

function renderEmailLayout({
  title,
  preheader,
  contentHtml,
}: {
  title: string;
  preheader: string;
  contentHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .container { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .header { padding: 32px 32px 24px; text-align: center; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #020617; font-weight: 900; font-size: 20px; margin-bottom: 12px; }
    .brand-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
    .brand-title span { color: #f59e0b; }
    .brand-tagline { font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .body { padding: 36px 32px; font-size: 15px; line-height: 1.65; color: #cbd5e1; }
    .body h1 { color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.5px; }
    .body p { margin-top: 0; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: #020617 !important; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 12px; text-align: center; margin: 16px 0 24px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35); }
    .details-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .details-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .details-box td { padding: 8px 0; border-bottom: 1px solid #334155; }
    .details-box tr:last-child td { border-bottom: none; }
    .details-label { color: #94a3b8; font-weight: 500; }
    .details-value { color: #f8fafc; font-weight: 700; text-align: right; }
    .footer { padding: 28px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .footer a { color: #f59e0b; text-decoration: none; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">&#9889;</div>
        <h1 class="brand-title">Quick<span>Postly</span></h1>
        <div class="brand-tagline">Create Smarter &bull; Schedule Faster &bull; Grow Everywhere</div>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME} Inc. &bull; <a href="${CANONICAL_URL}">${CANONICAL_URL.replace('https://', '')}</a></p>
        <p>Official Support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p style="margin-top: 8px; font-size: 11px; color: #475569;">
          You received this email because you have a registered account on QuickPostly.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 1. Welcome Email
export function generateWelcomeEmail({
  name,
  workspaceName,
  loginUrl = `${CANONICAL_URL}/login`,
}: {
  name: string;
  workspaceName?: string;
  loginUrl?: string;
}) {
  const title = `Welcome to QuickPostly, ${name}!`;
  const preheader = `Your AI-powered social media management command center is ready.`;
  const contentHtml = `
    <h1>Welcome aboard, ${name}! 🚀</h1>
    <p>Thank you for choosing <strong>QuickPostly</strong> as your social media management command center.</p>
    <p>With QuickPostly, you can connect and automate all your social networks, generate conversion-driven posts with multi-provider AI, schedule evergreen content queues, and track unified engagement.</p>
    
    <div class="details-box">
      <table>
        <tr>
          <td class="details-label">Account Name</td>
          <td class="details-value">${name}</td>
        </tr>
        ${workspaceName ? `
        <tr>
          <td class="details-label">Workspace</td>
          <td class="details-value">${workspaceName}</td>
        </tr>` : ''}
        <tr>
          <td class="details-label">Trial Plan</td>
          <td class="details-value">14-Day Pro Sandbox</td>
        </tr>
      </table>
    </div>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn">Launch QuickPostly Studio &rarr;</a>
    </p>

    <p>Need help getting started? Check out our <a href="${CANONICAL_URL}/blog" style="color: #f59e0b;">QuickPostly Growth Guides</a> or reply directly to this email.</p>
  `;

  return {
    subject: `Welcome to QuickPostly – Create Smarter, Schedule Faster`,
    from: `${APP_NAME} <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `Welcome to QuickPostly, ${name}!\n\nYour account is ready. Access your workspace at: ${loginUrl}\n\nSupport: ${SUPPORT_EMAIL}`,
  };
}

// 2. Email Verification
export function generateVerificationEmail({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}) {
  const title = `Verify your email address for QuickPostly`;
  const preheader = `Confirm your email to activate your QuickPostly workspace.`;
  const contentHtml = `
    <h1>Verify Your QuickPostly Account 🔒</h1>
    <p>Hello ${name},</p>
    <p>Please confirm your email address by clicking the secure button below to finalize your account activation and access your workspace.</p>

    <p style="text-align: center;">
      <a href="${verifyUrl}" class="btn">Verify Email Address &rarr;</a>
    </p>

    <p style="font-size: 13px; color: #94a3b8;">
      Or copy and paste this verification URL into your browser:<br>
      <a href="${verifyUrl}" style="color: #f59e0b; word-break: break-all;">${verifyUrl}</a>
    </p>

    <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
      If you did not request a QuickPostly account, you can safely ignore this message.
    </p>
  `;

  return {
    subject: `Verify your email for QuickPostly`,
    from: `${APP_NAME} Security <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `Hello ${name},\n\nPlease verify your QuickPostly email by visiting:\n${verifyUrl}\n\nSupport: ${SUPPORT_EMAIL}`,
  };
}

// 3. Password Reset
export function generatePasswordResetEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  const title = `Reset your QuickPostly password`;
  const preheader = `Instructions to safely reset your QuickPostly password.`;
  const contentHtml = `
    <h1>Reset Your Password 🔑</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your QuickPostly account. Click the button below to choose a new password.</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password &rarr;</a>
    </p>

    <p style="font-size: 13px; color: #94a3b8;">
      This password reset link will expire in 60 minutes for security reasons.<br>
      Direct link: <a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a>
    </p>

    <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
      If you did not request this change, please ignore this email or contact support at <a href="mailto:${SUPPORT_EMAIL}" style="color: #f59e0b;">${SUPPORT_EMAIL}</a> immediately.
    </p>
  `;

  return {
    subject: `Reset your QuickPostly password`,
    from: `${APP_NAME} Security <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `Hello ${name},\n\nReset your QuickPostly password at:\n${resetUrl}\n\nThis link expires in 60 minutes. Support: ${SUPPORT_EMAIL}`,
  };
}

// 4. Subscription Confirmation
export function generateSubscriptionConfirmationEmail({
  name,
  planName,
  interval,
  amount,
  currency = 'USD',
  nextBillingDate,
}: {
  name: string;
  planName: string;
  interval: string;
  amount: number | string;
  currency?: string;
  nextBillingDate?: string;
}) {
  const title = `Your QuickPostly ${planName} Subscription is Active!`;
  const preheader = `Your subscription upgrade to QuickPostly ${planName} is confirmed.`;
  const contentHtml = `
    <h1>Subscription Confirmed! 🎉</h1>
    <p>Hello ${name},</p>
    <p>Your subscription to <strong>QuickPostly ${planName}</strong> is now officially active. All plan features and elevated limits have been applied to your workspace immediately.</p>

    <div class="details-box">
      <table>
        <tr>
          <td class="details-label">Plan Tier</td>
          <td class="details-value">${planName}</td>
        </tr>
        <tr>
          <td class="details-label">Billing Cycle</td>
          <td class="details-value">${interval}</td>
        </tr>
        <tr>
          <td class="details-label">Amount</td>
          <td class="details-value">${currency.toUpperCase()} ${amount}</td>
        </tr>
        ${nextBillingDate ? `
        <tr>
          <td class="details-label">Next Renewal</td>
          <td class="details-value">${nextBillingDate}</td>
        </tr>` : ''}
        <tr>
          <td class="details-label">Status</td>
          <td class="details-value" style="color: #10b981;">Active &amp; Verified</td>
        </tr>
      </table>
    </div>

    <p style="text-align: center;">
      <a href="${CANONICAL_URL}/dashboard/subscription" class="btn">Manage Subscription &rarr;</a>
    </p>

    <p>Thank you for trusting QuickPostly to scale your brand presence across the web.</p>
  `;

  return {
    subject: `Subscription Confirmed: QuickPostly ${planName} (${interval})`,
    from: `${APP_NAME} Billing <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `Hello ${name},\n\nYour QuickPostly ${planName} subscription is active!\nAmount: ${currency.toUpperCase()} ${amount} (${interval})\nManage your billing at: ${CANONICAL_URL}/dashboard/subscription\n\nSupport: ${SUPPORT_EMAIL}`,
  };
}

// 5. Payment Confirmation & Receipt
export function generatePaymentReceiptEmail({
  name,
  transactionId,
  amount,
  currency = 'USD',
  gateway,
  paymentMethod,
  invoiceUrl,
}: {
  name: string;
  transactionId: string;
  amount: number | string;
  currency?: string;
  gateway: string;
  paymentMethod?: string;
  invoiceUrl?: string;
}) {
  const title = `Payment Receipt for QuickPostly Order #${transactionId}`;
  const preheader = `Thank you for your payment of ${currency.toUpperCase()} ${amount}.`;
  const contentHtml = `
    <h1>Payment Received 🧾</h1>
    <p>Hello ${name},</p>
    <p>This email serves as official confirmation of your payment to <strong>QuickPostly Technologies Inc.</strong></p>

    <div class="details-box">
      <table>
        <tr>
          <td class="details-label">Reference ID</td>
          <td class="details-value">${transactionId}</td>
        </tr>
        <tr>
          <td class="details-label">Amount Paid</td>
          <td class="details-value">${currency.toUpperCase()} ${amount}</td>
        </tr>
        <tr>
          <td class="details-label">Payment Gateway</td>
          <td class="details-value">${gateway.toUpperCase()}</td>
        </tr>
        ${paymentMethod ? `
        <tr>
          <td class="details-label">Payment Method</td>
          <td class="details-value">${paymentMethod}</td>
        </tr>` : ''}
        <tr>
          <td class="details-label">Payment Status</td>
          <td class="details-value" style="color: #10b981;">Completed (Paid)</td>
        </tr>
      </table>
    </div>

    ${invoiceUrl ? `
    <p style="text-align: center;">
      <a href="${invoiceUrl}" class="btn">View &amp; Download Invoice &rarr;</a>
    </p>` : `
    <p style="text-align: center;">
      <a href="${CANONICAL_URL}/dashboard/subscription" class="btn">View Billing History &rarr;</a>
    </p>`}

    <p>If you have questions concerning this charge, contact <a href="mailto:${SUPPORT_EMAIL}" style="color: #f59e0b;">${SUPPORT_EMAIL}</a>.</p>
  `;

  return {
    subject: `Payment Receipt: ${currency.toUpperCase()} ${amount} - QuickPostly #${transactionId}`,
    from: `${APP_NAME} Billing <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `Payment Receipt: ${currency.toUpperCase()} ${amount}\nTransaction ID: ${transactionId}\nGateway: ${gateway}\n\nSupport: ${SUPPORT_EMAIL}`,
  };
}

// 6. Scheduled Post Notification
export function generateScheduledPostNotificationEmail({
  name,
  postTitle,
  platform,
  status,
  publishedAt,
  permalink,
  errorMessage,
}: {
  name: string;
  postTitle: string;
  platform: string;
  status: 'PUBLISHED' | 'FAILED' | 'SCHEDULED';
  publishedAt?: string;
  permalink?: string;
  errorMessage?: string;
}) {
  const isSuccess = status === 'PUBLISHED';
  const title = isSuccess
    ? `Your post was published to ${platform}!`
    : `Attention: Post publishing failed on ${platform}`;
  const preheader = isSuccess
    ? `QuickPostly successfully published "${postTitle.substring(0, 40)}..."`
    : `QuickPostly encountered an error while publishing to ${platform}.`;

  const contentHtml = `
    <h1>${isSuccess ? 'Post Successfully Published! 🚀' : 'Post Publishing Failed ⚠️'}</h1>
    <p>Hello ${name},</p>
    <p>${
      isSuccess
        ? `Your queued post has been published to <strong>${platform}</strong>.`
        : `QuickPostly attempted to publish your post to <strong>${platform}</strong>, but the platform API returned an issue.`
    }</p>

    <div class="details-box">
      <table>
        <tr>
          <td class="details-label">Social Platform</td>
          <td class="details-value">${platform}</td>
        </tr>
        <tr>
          <td class="details-label">Status</td>
          <td class="details-value" style="color: ${isSuccess ? '#10b981' : '#f43f5e'}; font-weight: 800;">
            ${status}
          </td>
        </tr>
        ${publishedAt ? `
        <tr>
          <td class="details-label">Timestamp</td>
          <td class="details-value">${publishedAt}</td>
        </tr>` : ''}
        ${errorMessage ? `
        <tr>
          <td class="details-label">API Error Details</td>
          <td class="details-value" style="color: #f43f5e;">${errorMessage}</td>
        </tr>` : ''}
      </table>
    </div>

    ${isSuccess && permalink ? `
    <p style="text-align: center;">
      <a href="${permalink}" class="btn">View Live Post on ${platform} &rarr;</a>
    </p>` : `
    <p style="text-align: center;">
      <a href="${CANONICAL_URL}/dashboard/queue" class="btn">Open Publishing Queue &rarr;</a>
    </p>`}
  `;

  return {
    subject: isSuccess
      ? `[QuickPostly] Post Published to ${platform}: "${postTitle.substring(0, 35)}..."`
      : `[QuickPostly Alert] Post Failed on ${platform}`,
    from: `${APP_NAME} Notifications <${SUPPORT_EMAIL}>`,
    html: renderEmailLayout({ title, preheader, contentHtml }),
    text: `${title}\nPost: ${postTitle}\nPlatform: ${platform}\nStatus: ${status}\n${errorMessage ? 'Error: ' + errorMessage + '\n' : ''}\nOpen Queue: ${CANONICAL_URL}/dashboard/queue`,
  };
}

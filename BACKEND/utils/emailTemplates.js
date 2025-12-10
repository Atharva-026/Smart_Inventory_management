export const invitationEmailTemplate = (studentName, facultyName, invitationCode, registrationLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .code-box {
      background: #f8f9fa;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 3px;
      font-family: monospace;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 25px;
      margin: 20px 0;
      font-weight: bold;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .info-box {
      background: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Smart Inventory System</h1>
      <p>You're Invited to Join!</p>
    </div>
    
    <div class="content">
      <h2>Hello ${studentName}! 👋</h2>
      
      <p>
        <strong>${facultyName}</strong> has invited you to join the Smart Inventory Management System. 
        You can now register and start borrowing equipment from our inventory.
      </p>
      
      <div class="info-box">
        <strong>📧 Your Invitation Details:</strong><br>
        Email: <strong>${studentName}</strong><br>
        Faculty: <strong>${facultyName}</strong>
      </div>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Invitation Code:</p>
        <div class="code">${invitationCode}</div>
      </div>
      
      <center>
        <a href="${registrationLink}" class="button">
          🚀 Register Now
        </a>
      </center>
      
      <div class="info-box">
        <strong>⏰ Important:</strong><br>
        • This invitation code expires in 7 days<br>
        • You can only register with the email: <strong>${studentName}</strong><br>
        • Keep your invitation code safe
      </div>
      
      <p style="margin-top: 30px; color: #666;">
        If you didn't expect this invitation or have any questions, 
        please contact <strong>${facultyName}</strong>.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 Smart Inventory Management System</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const welcomeEmailTemplate = (studentName, facultyName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 25px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Smart Inventory!</h1>
    </div>
    
    <div class="content">
      <h2>Registration Successful! ✅</h2>
      
      <p>Hi <strong>${studentName}</strong>,</p>
      
      <p>
        Congratulations! You've successfully registered in the Smart Inventory Management System 
        under <strong>${facultyName}</strong>.
      </p>
      
      <p><strong>What's next?</strong></p>
      <ul>
        <li>📱 Login to your account</li>
        <li>📦 Browse available equipment</li>
        <li>📷 Scan QR codes to borrow items</li>
        <li>📋 Track your borrowing history</li>
      </ul>
      
      <center>
        <a href="${process.env.FRONTEND_URL}/login" class="button">
          Login to Your Account
        </a>
      </center>
      
      <p style="margin-top: 30px;">
        If you have any questions, feel free to reach out to your faculty member.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 Smart Inventory Management System</p>
    </div>
  </div>
</body>
</html>
  `;
};
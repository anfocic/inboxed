export interface EmailTemplateData {
    fromName: string;
    fromEmail: string;
    message: string;
    data: Record<string, any>;
    submissionTime: string;
    formId: string;
    tenant: string;
}

export function generateEmailHTML(templateData: EmailTemplateData): string {
    const { fromName, fromEmail, message, data, submissionTime, formId, tenant } = templateData;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Form Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
        .field {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .field-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        .field-value {
            color: #212529;
            font-size: 14px;
            word-wrap: break-word;
        }
        .message-field {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        .metadata {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }
        .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .extra-data {
            margin-top: 20px;
        }
        .extra-data-content {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .attachments-notice {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 10px;
            margin-top: 20px;
            font-size: 14px;
            color: #0c5460;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .metadata-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 New Form Submission</h1>
        </div>
        
        <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escapeHtml(fromName)}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
                <a href="mailto:${escapeHtml(fromEmail)}" style="color: #007bff; text-decoration: none;">
                    ${escapeHtml(fromEmail)}
                </a>
            </div>
        </div>
        
        ${message ? `
        <div class="field message-field">
            <div class="field-label">Message</div>
            <div class="field-value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}
        
        ${Object.keys(data).length > 0 ? `
        <div class="extra-data">
            <div class="field-label">Additional Data</div>
            <div class="extra-data-content">${escapeHtml(JSON.stringify(data, null, 2))}</div>
        </div>
        ` : ''}
        
        <div class="attachments-notice">
            📎 Any file attachments are included with this email
        </div>
        
        <div class="metadata">
            <div class="metadata-grid">
                <div><strong>Submitted:</strong> ${submissionTime}</div>
                <div><strong>Form ID:</strong> ${escapeHtml(formId)}</div>
                <div><strong>Tenant:</strong> ${escapeHtml(tenant)}</div>
                <div><strong>Source:</strong> Inboxed Form Handler</div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

export function generateEmailText(templateData: EmailTemplateData): string {
    const { fromName, fromEmail, message, data, submissionTime, formId, tenant } = templateData;
    
    let text = `📬 NEW FORM SUBMISSION\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Name: ${fromName}\n`;
    text += `Email: ${fromEmail}\n`;
    
    if (message) {
        text += `\nMessage:\n${message}\n`;
    }
    
    if (Object.keys(data).length > 0) {
        text += `\nAdditional Data:\n${JSON.stringify(data, null, 2)}\n`;
    }
    
    text += `\n${'='.repeat(50)}\n`;
    text += `Submitted: ${submissionTime}\n`;
    text += `Form ID: ${formId}\n`;
    text += `Tenant: ${tenant}\n`;
    text += `Source: Inboxed Form Handler\n`;
    
    return text;
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

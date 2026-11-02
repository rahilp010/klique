/**
 * HTML Email Signature Generator
 * Produces 100% email-client-safe inline HTML tables compatible with
 * Gmail, Microsoft Outlook, Apple Mail, Yahoo, and Thunderbird.
 */

export function generateEmailSignature(data = {}, layout = 'modern-horizontal') {
   const {
      fullName = 'Alex Morgan',
      jobTitle = 'Senior Product Designer',
      company = 'Acme Technologies',
      email = 'alex.morgan@example.com',
      phone = '+91 98765 43210',
      website = 'https://example.com',
      avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      accentColor = '#daf4aa',
      socialLinks = {
         linkedin: 'https://linkedin.com',
         twitter: 'https://twitter.com',
         github: 'https://github.com',
      },
      disclaimer = '',
   } = data;

   const cleanWebsiteDisplay = website.replace(/^https?:\/\//, '').replace(/\/$/, '');

   let socialHtml = '';
   if (socialLinks.linkedin || socialLinks.twitter || socialLinks.github) {
      const links = [];
      if (socialLinks.linkedin) {
         links.push(
            `<a href="${socialLinks.linkedin}" target="_blank" style="color: #0a66c2; text-decoration: none; font-size: 11px; font-weight: bold; margin-right: 8px;">LinkedIn</a>`
         );
      }
      if (socialLinks.twitter) {
         links.push(
            `<a href="${socialLinks.twitter}" target="_blank" style="color: #1da1f2; text-decoration: none; font-size: 11px; font-weight: bold; margin-right: 8px;">Twitter</a>`
         );
      }
      if (socialLinks.github) {
         links.push(
            `<a href="${socialLinks.github}" target="_blank" style="color: #888888; text-decoration: none; font-size: 11px; font-weight: bold;">GitHub</a>`
         );
      }
      socialHtml = `<div style="padding-top: 6px;">${links.join(' <span style="color: #555555;">•</span> ')}</div>`;
   }

   if (layout === 'modern-horizontal') {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.4; color: #ffffff; border-collapse: collapse;">
  <tr>
    ${
       avatarUrl
          ? `<td valign="middle" style="padding-right: 14px; vertical-align: middle;">
      <img src="${avatarUrl}" alt="${fullName}" width="68" height="68" style="width: 68px; height: 68px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #27272a;" />
    </td>`
          : ''
    }
    <td style="border-left: 2px solid #27272a; padding-left: 14px; vertical-align: middle;">
      <div style="font-size: 15px; font-weight: bold; color: #ffffff; letter-spacing: -0.2px;">${fullName}</div>
      <div style="font-size: 12px; color: ${accentColor}; font-weight: 600; padding-bottom: 4px;">${jobTitle} ${company ? `<span style="color: #71717a;">|</span> ${company}` : ''}</div>
      <div style="font-size: 11px; color: #a1a1aa; line-height: 1.5;">
        ${email ? `<span style="color: #71717a;">E:</span> <a href="mailto:${email}" style="color: #d4d4d8; text-decoration: none;">${email}</a>` : ''}
        ${phone ? `<br /><span style="color: #71717a;">M:</span> <a href="tel:${phone}" style="color: #d4d4d8; text-decoration: none;">${phone}</a>` : ''}
        ${website ? `<br /><span style="color: #71717a;">W:</span> <a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none;">${cleanWebsiteDisplay}</a>` : ''}
      </div>
      ${socialHtml}
    </td>
  </tr>
  ${
     disclaimer
        ? `<tr>
    <td colspan="2" style="padding-top: 8px; font-size: 10px; color: #71717a; line-height: 1.3;">
      ${disclaimer}
    </td>
  </tr>`
        : ''
  }
</table>`.trim();
   }

   // Layout 2: Minimalist Clean Stack
   if (layout === 'clean-minimal') {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.4; color: #ffffff; border-collapse: collapse;">
  <tr>
    <td>
      <div style="font-size: 16px; font-weight: bold; color: #ffffff;">${fullName}</div>
      <div style="font-size: 12px; color: ${accentColor}; font-weight: 600;">${jobTitle} • ${company}</div>
      <div style="height: 2px; width: 40px; background-color: ${accentColor}; margin: 6px 0 8px 0;"></div>
      <div style="font-size: 11px; color: #a1a1aa; line-height: 1.5;">
        ${phone ? `<a href="tel:${phone}" style="color: #d4d4d8; text-decoration: none;">${phone}</a> <span style="color: #555555;">|</span> ` : ''}
        ${email ? `<a href="mailto:${email}" style="color: #d4d4d8; text-decoration: none;">${email}</a>` : ''}
        ${website ? `<br /><a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none;">${cleanWebsiteDisplay}</a>` : ''}
      </div>
      ${socialHtml}
    </td>
  </tr>
</table>`.trim();
   }

   // Layout 3: Corporate Card
   return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.4; color: #ffffff; border-collapse: collapse; background-color: #121215; border: 1px solid #27272a; border-radius: 8px; padding: 12px;">
  <tr>
    <td style="padding: 12px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${
             avatarUrl
                ? `<td valign="top" style="padding-right: 12px;">
            <img src="${avatarUrl}" alt="${fullName}" width="54" height="54" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover; display: block;" />
          </td>`
                : ''
          }
          <td>
            <div style="font-size: 15px; font-weight: bold; color: #ffffff;">${fullName}</div>
            <div style="font-size: 12px; color: ${accentColor}; font-weight: 500;">${jobTitle}</div>
            <div style="font-size: 11px; color: #71717a;">${company}</div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">
              ${email ? `<a href="mailto:${email}" style="color: #d4d4d8; text-decoration: none;">${email}</a>` : ''}
              ${phone ? ` • <a href="tel:${phone}" style="color: #d4d4d8; text-decoration: none;">${phone}</a>` : ''}
            </div>
            ${socialHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

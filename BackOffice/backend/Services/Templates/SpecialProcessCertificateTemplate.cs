using System;
using System.Globalization;

namespace backend.Services.Templates
{
    public static class SpecialProcessCertificateTemplate
    {
        public static string Build(string? processType)
        {
            var displayType = string.IsNullOrWhiteSpace(processType)
                ? "SPECIAL PROCESS"
                : processType.Trim().ToUpper(CultureInfo.InvariantCulture);

            var title = $"CERTIFICATE OF CONFORMANCE \u2013 {displayType}";

            // All placeholders ({{...}}) are replaced by the backend before HTML → PDF conversion.
            // TODO: carregar apenas normas vinculadas ao processo informado em processType
            // Placeholder para combinar norma e revisão: o backend deve preencher {{specificationDynamic}}
            // seguindo a regra (com revisão quando existir).

            var hasHeatProcess = !string.IsNullOrWhiteSpace(processType) &&
                                 processType.IndexOf("heat", StringComparison.OrdinalIgnoreCase) >= 0;

            var heatConditionBlock = hasHeatProcess
                ? @"<div style=""margin-top:12px;font-size:12px;letter-spacing:0.7px;color:#2f2f2f;"">CONDITION: {{heatCondition}}</div>"
                : string.Empty;

            var totalApprovedPartsBlock =
                @"<div style=""margin-top:18px;font-size:12px;letter-spacing:0.7px;color:#2f2f2f;"">TOTAL APPROVED PARTS: {{totalApprovedParts}}</div>";

            return $@"<!DOCTYPE html>
<html lang=""en"">
  <head>
    <meta charset=""UTF-8"" />
    <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <title>{title}</title>
  </head>
  <body style=""margin:0;padding:40px;font-family:Arial,Helvetica,sans-serif;color:#1d1d1d;background-color:#ffffff;text-transform:uppercase;"">
    <div style=""max-width:720px;margin:0 auto;"">
      <!-- TEMPLATE VARIABLES -->
      <!-- processType: {{processType}} -->
      <!-- specification: {{specification}} -->
      <!-- specRevision: {{specRevision}} -->
      <!-- specificationDynamic: {{specificationDynamic}} -->
      <!-- partNumber: {{partNumber}} -->
      <!-- lotNumber: {{lotNumber}} -->
      <!-- purchaseOrder: {{purchaseOrder}} -->
      <!-- emissionDate: {{emissionDate}} -->
      <!-- processParameters: {{processParameters}} -->
      <!-- heatCondition: {{heatCondition}} -->

      <header style=""display:flex;align-items:flex-end;justify-content:space-between;border-bottom:2px solid #0f0f0f;padding-bottom:20px;margin-bottom:28px;"">
        <h1 style=""flex:1;margin:0;font-size:22px;letter-spacing:1.6px;text-align:center;"">{title}</h1>
        <div style=""margin-left:24px;text-align:right;min-width:180px;font-size:12px;line-height:1.4;"">
          <span style=""display:block;font-weight:bold;letter-spacing:1.2px;"">C OF C No.</span>
          <span style=""display:block;margin-top:4px;font-size:14px;"">{{certificateNumber}}</span>
        </div>
      </header>

      <section style=""display:flex;gap:16px;margin-bottom:28px;"">
        <div style=""flex:1;border:1px solid #d6d6d6;padding:18px 16px;background-color:#fafafa;"">
          <h2 style=""margin:0 0 14px 0;font-size:14px;letter-spacing:1.4px;font-weight:bold;"">SUPPLIER INFORMATION</h2>
          <div style=""margin-bottom:12px;"">
            <span style=""display:block;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#555555;"">SUPPLIER NAME</span>
            <span style=""display:block;margin-top:4px;font-size:13px;line-height:1.6;"">{{supplierName}}</span>
          </div>
          <div style=""margin-bottom:12px;"">
            <span style=""display:block;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#555555;"">SUPPLIER CODE</span>
            <span style=""display:block;margin-top:4px;font-size:13px;line-height:1.6;"">{{supplierCode}}</span>
          </div>
          <div>
            <span style=""display:block;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#555555;"">SUPPLIER ADDRESS</span>
            <span style=""display:block;margin-top:4px;font-size:13px;line-height:1.6;"">{{supplierAddress}}</span>
          </div>
        </div>
        <div style=""flex:1;border:1px solid #d6d6d6;padding:18px 16px;background-color:#fafafa;"">
          <h2 style=""margin:0 0 14px 0;font-size:14px;letter-spacing:1.4px;font-weight:bold;"">CUSTOMER INFORMATION</h2>
          <div style=""margin-bottom:12px;"">
            <span style=""display:block;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#555555;"">CUSTOMER NAME</span>
            <span style=""display:block;margin-top:4px;font-size:13px;line-height:1.6;"">{{customerName}}</span>
          </div>
          <div>
            <span style=""display:block;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#555555;"">CUSTOMER ADDRESS</span>
            <span style=""display:block;margin-top:4px;font-size:13px;line-height:1.6;"">{{customerAddress}}</span>
          </div>
        </div>
      </section>

      <section style=""border:1px solid #d6d6d6;padding:20px 18px;background-color:#ffffff;margin-bottom:28px;"">
        <h2 style=""margin:0 0 16px 0;font-size:14px;letter-spacing:1.4px;font-weight:bold;"">PROCESS DETAILS</h2>
        <table style=""width:100%;border-collapse:collapse;font-size:12px;letter-spacing:0.8px;"">
          <tbody>
            <tr>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;width:35%;font-weight:bold;color:#444444;"">PROCESS</td>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;"">{{processType}}</td>
            </tr>
            <tr>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;font-weight:bold;color:#444444;"">LOT NUMBER</td>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;"">{{lotNumber}}</td>
            </tr>
            <tr>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;font-weight:bold;color:#444444;"">SPECIFICATION / STANDARD</td>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;"">
                {{specificationDynamic}}
              </td>
            </tr>
            <tr>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;font-weight:bold;color:#444444;"">PURCHASE ORDER</td>
              <td style=""padding:6px 8px;border-bottom:1px solid #e6e6e6;"">{{purchaseOrder}}</td>
            </tr>
            <tr>
              <td style=""padding:6px 8px;font-weight:bold;color:#444444;"">EMISSION DATE</td>
              <td style=""padding:6px 8px;"">{{emissionDateFormatted}}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style=""border:1px solid #d6d6d6;padding:0;margin-bottom:28px;"">
        <h2 style=""margin:0;padding:18px 18px 12px 18px;font-size:14px;letter-spacing:1.4px;font-weight:bold;background-color:#fafafa;border-bottom:1px solid #e6e6e6;"">MATERIAL DETAILS</h2>
        <table style=""width:100%;border-collapse:collapse;font-size:12px;letter-spacing:0.6px;"">
          <thead>
            <tr style=""background-color:#f3f3f3;"">
              <th style=""text-align:left;padding:10px 14px;border-bottom:1px solid #d6d6d6;font-weight:bold;color:#3a3a3a;width:34%;"">PART NUMBER</th>
              <th style=""text-align:left;padding:10px 14px;border-bottom:1px solid #d6d6d6;font-weight:bold;color:#3a3a3a;width:46%;"">PART NAME</th>
              <th style=""text-align:left;padding:10px 14px;border-bottom:1px solid #d6d6d6;font-weight:bold;color:#3a3a3a;width:20%;"">REVISION</th>
            </tr>
          </thead>
          <tbody>
            <!-- MATERIAL ROWS INJECTED BY BACKEND -->
            {{partsRows}}
          </tbody>
        </table>
      </section>

      <section style=""border:1px solid #d6d6d6;padding:20px 18px;background-color:#ffffff;margin-bottom:28px;"">
        <h2 style=""margin:0 0 16px 0;font-size:14px;letter-spacing:1.4px;font-weight:bold;"">PROCESS PARAMETERS</h2>
        <table style=""width:100%;border-collapse:collapse;font-size:12px;letter-spacing:0.6px;"">
          <tbody>
            <!-- PROCESS PARAMETERS ROWS INJECTED BY BACKEND -->
            {{processParametersRows}}
          </tbody>
        </table>
        {heatConditionBlock}
        {totalApprovedPartsBlock}
      </section>

      <section style=""border:1px solid #d6d6d6;padding:20px 18px;background-color:#ffffff;margin-bottom:28px;text-transform:none;"">
        <h2 style=""margin:0 0 16px 0;font-size:14px;letter-spacing:1.4px;font-weight:bold;text-transform:uppercase;"">STATEMENT OF CONFORMANCE</h2>
        <p style=""margin:0;font-size:12px;letter-spacing:0.3px;line-height:1.7;color:#2c2c2c;"">
          We certify that the aforementioned part(s) were processed and tested in full compliance with the {{specification}} specification, meeting all applicable process requirements. All acceptance inspections and tests were successfully completed, confirming that the product meets the acceptance criteria and the customer's quality requirements.
        </p>
      </section>

      <footer style=""border-top:1px solid #d6d6d6;padding:24px 18px 0 18px;text-transform:none;"">
        <div style=""min-height:80px;display:flex;align-items:flex-end;justify-content:flex-start;margin-bottom:12px;"">
          <!-- APPROVER SIGNATURE IMAGE INJECTED BY BACKEND -->
          {{approverSignatureImage}}
        </div>
        <div style=""font-size:12px;letter-spacing:0.6px;color:#2f2f2f;line-height:1.6;text-transform:uppercase;"">
          <div style=""font-weight:bold;"">{{approverName}}</div>
          <div style=""font-weight:normal;"">{{approverRole}}</div>
        </div>
      </footer>

      <!-- Additional sections will be appended in later steps -->
    </div>
  </body>
</html>";
        }
    }
}

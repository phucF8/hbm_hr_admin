import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrUserReportDtail } from '../response/err_user_report_detail_rp';
import { formatAndHighlightJson } from '@app/utils/json-utils';


@Component({
  selector: 'app-error-report-detail',
  standalone: false,
  templateUrl: './error-report-detail.component.html',
  styleUrls: ['./error-report-detail.component.css'],
})
export class ErrUserReportDetailPopupComponent {

  formattedHtmlRequestJSON: string = '';
  formattedHtmlResponseJSON: string = '';

  constructor(
    private dialogRef: MatDialogRef<ErrUserReportDetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrUserReportDtail
    
  ) {
    this.formattedHtmlRequestJSON = formatAndHighlightJson(this.data.requestJson);
    this.formattedHtmlResponseJSON = formatAndHighlightJson(this.data.responseJson);
  }

  syntaxHighlight(json: string): string {
    return json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*?"(\s*:)?|\b(true|false|null)\b|\d+)/g,
        match => {
          let cls = 'number';
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'key' : 'string';
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="${cls}">${match}</span>`;
        });
  }

  escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  copyJson(json: string | object) {
    try {
      // Nếu là chuỗi JSON, parse thành object
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const formatted = JSON.stringify(parsed, null, 2);

      navigator.clipboard.writeText(formatted).then(() => {
        console.log('Formatted JSON copied to clipboard');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    } catch (err) {
      console.error('Invalid JSON format:', err);
    }
  }

copy(value: string | object) {
    const formatted = value.toString();
    navigator.clipboard.writeText(formatted).then(() => {
      console.log('Formatted JSON copied to clipboard');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
}

  closePopup() {
    this.dialogRef.close();
  }



}

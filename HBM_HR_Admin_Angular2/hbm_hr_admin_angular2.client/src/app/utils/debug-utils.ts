import { environment } from '../../environments/environment'; 


export class DebugUtils {
  static openStringInNewWindow(content: string): void {
    if (!environment.production) {
      const windowFeatures = 'toolbar=no,menubar=no,width=600,height=400,left=100,top=100';
      const popupWindow = window.open('', '_blank', windowFeatures);
      if (popupWindow) {
        popupWindow.document.write(`
          <html>
            <head><title>Content Viewer</title></head>
            <body>
              <h3>Displayed Content</h3>
              <textarea style="width: 100%; height: 200px;">${content}</textarea>
            </body>
          </html>
        `);
        popupWindow.document.close();
      }
    }
  }
  
}  
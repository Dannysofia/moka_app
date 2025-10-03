import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { addIcons } from 'ionicons';
import { calendarClearOutline, calendarNumberOutline } from 'ionicons/icons';
import { setAssetPath } from '@ionic/core/components';

setAssetPath(document.baseURI ?? './');

addIcons({
  'calendar-clear-outline': calendarClearOutline,
  'calendar-number-outline': calendarNumberOutline,
});

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));

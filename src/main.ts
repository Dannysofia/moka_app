import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { addIcons, setAssetPath } from 'ionicons';
import {
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  menuOutline,
  homeOutline,
  peopleOutline,
  peopleCircleOutline,
  personCircleOutline,
  cashOutline,
  analyticsOutline,
  pricetagOutline,
  leafOutline,
  cubeOutline,
  closeOutline,
  openOutline,
} from 'ionicons/icons';
// Robust base for Ionicons (Stencil) assets in Angular
try {
  // @ts-ignore
  const base = new URL('.', import.meta.url).href;
  setAssetPath(base);
} catch {
  setAssetPath(document.baseURI ?? '/');
}

// Inline-register the Ionicons we use to avoid network fetches
addIcons({
  'calendar-outline': calendarOutline,
  'calendar-clear-outline': calendarClearOutline,
  'calendar-number-outline': calendarNumberOutline,
  'menu-outline': menuOutline,
  'home-outline': homeOutline,
  'people-outline': peopleOutline,
  'people-circle-outline': peopleCircleOutline,
  'person-circle-outline': personCircleOutline,
  'cash-outline': cashOutline,
  'analytics-outline': analyticsOutline,
  'pricetag-outline': pricetagOutline,
  'leaf-outline': leafOutline,
  'cube-outline': cubeOutline,
  'close-outline': closeOutline,
  'open-outline': openOutline,
});

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));

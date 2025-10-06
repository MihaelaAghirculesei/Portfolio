import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const bootstrap = (): ReturnType<typeof bootstrapApplication> => bootstrapApplication(AppComponent, appConfig);

export default bootstrap;
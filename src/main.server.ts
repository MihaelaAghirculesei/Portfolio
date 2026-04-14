import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const bootstrap = (context: BootstrapContext): ReturnType<typeof bootstrapApplication> =>
  bootstrapApplication(AppComponent, appConfig, context);

export default bootstrap;
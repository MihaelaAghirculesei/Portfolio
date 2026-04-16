import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { AppComponent } from './app/app.component';

const bootstrap = (context: BootstrapContext): ReturnType<typeof bootstrapApplication> =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
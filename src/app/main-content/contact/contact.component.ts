import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-contact',
    imports: [ContactFormComponent, TranslatePipe],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {

}
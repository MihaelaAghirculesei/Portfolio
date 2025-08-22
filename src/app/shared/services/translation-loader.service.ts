import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslationLoader implements TranslateLoader {
  
  private translations = {
    de: {
      "nav": {
        "about": "Über mich",
        "skills": "Fähigkeiten", 
        "portfolio": "Portfolio",
        "contact": "Kontakt"
      },
      "common": {
        "references": "Referenzen"
      },
      "skills": {
        "title": "Fähigkeiten",
        "overContent": "Technologien",
        "introduction": "Ich verwandle Ideen in ansprechende digitale Erlebnisse! Mit Angular, TypeScript und Material Design erstelle ich moderne Anwendungen, die die Benutzererfahrung verbessern. Ich integriere REST-APIs und Firebase für dynamische Funktionalität und suche immer nach innovativen Lösungen.",
        "additionalSkillsTitle": "Sie benötigen",
        "additionalSkillsHighlight": "eine andere Fähigkeit?",
        "additionalSkillsText": "Sehen Sie die Technologie, die Ihr Projekt benötigt, nicht? Kein Problem! Meine Neugier und Entschlossenheit ermöglichen es mir, neue technologische Herausforderungen anzunehmen. Jedes Projekt ist eine Gelegenheit zu wachsen und maßgeschneiderte Lösungen für Ihre Bedürfnisse zu liefern.",
        "ctaText": "Lass uns reden",
        "tooltipText": "Ich habe besonderes Interesse am Lernen:"
      },
      "landingPage": {
        "greeting": "Hallo! Ich bin",
        "role": "Frontend Entwicklerin",
        "title": "Frontend Entwicklerin",
        "checkWork": "Meine Arbeit ansehen",
        "contactMe": "Kontaktiere mich",
        "description": "Ich bin eine Frontend-Entwicklerin mit Sitz in Wolfsburg."
      },
      "aboutMe": {
        "title": "Über mich",
        "subtitle": "Wer ich bin",
        "mainTitle": "Über mich",
        "introText": "Hallo! Ich bin Mihaela, eine Frontend-Entwicklerin, die glaubt, dass Technologie schön, zugänglich und für jeden Menschen bereichernd sein sollte. Ich liebe es, intuitive und inklusive digitale Erlebnisse zu schaffen, die das Leben der Menschen verbessern.",
        "visionTitle": "Meine Vision:",
        "visionText": "Code ist Poesie, Design ist Storytelling und User Experience ist alles. Ich liebe es, Ideen in interaktive Realitäten zu verwandeln, die Nutzer einfach lieben müssen.",
        "locationTitle": "Grenzenlos:",
        "locationText": "Wolfsburg ist meine Basis, aber mein Ehrgeiz kennt keine Grenzen - bereit für Remote-Projekte, die alles verändern.",
        "growthTitle": "Immer wachsend:",
        "growthText": "In einem Bereich, der sich niemals aufhört zu verändern, höre ich niemals auf zu lernen. Jeder Tag bringt neue Möglichkeiten zu wachsen, zu erschaffen und Einfluss zu nehmen. Bereit zur Zusammenarbeit und etwas Außergewöhnliches zu schaffen?"
      },
      "portfolio": {
        "subtitle": "Portfolio",
        "title": "Ausgewählte Projekte",
        "description": "Erkunden Sie hier eine Auswahl meiner Arbeiten. Interagieren Sie mit den Projekten, um meine Fähigkeiten in Aktion zu sehen.",
        "nextProject": "Nächstes Projekt"
      },
      "banner": {
        "remoteWork": "Verfügbar für Remote-Arbeit",
        "role": "Frontend Entwicklerin",
        "openToWork": "Offen für Arbeit & Lernen", 
        "location": "Wohnhaft in Wolfsburg",
        "skills": "Angular & TypeScript",
        "passion": "Leidenschaftlich für sauberen Code"
      }
    },
    en: {
      "nav": {
        "about": "About me",
        "skills": "Skills",
        "portfolio": "Portfolio", 
        "contact": "Contact"
      },
      "common": {
        "references": "References"
      },
      "skills": {
        "title": "Skill Set",
        "overContent": "Technologies",
        "introduction": "I transform ideas into engaging digital experiences! With Angular, TypeScript, and Material Design, I create modern applications that enhance user experience. I integrate REST APIs and Firebase for dynamic functionality, always seeking innovative solutions.",
        "additionalSkillsTitle": "You Need",
        "additionalSkillsHighlight": "another skill?",
        "additionalSkillsText": "Don't see the technology your project needs? No problem! My curiosity and determination allow me to embrace new technological challenges. Every project is an opportunity to grow and deliver tailored solutions for your needs.",
        "ctaText": "Let's talk",
        "tooltipText": "I have special interests in learning:"
      },
      "landingPage": {
        "greeting": "Hello! I am",
        "role": "Frontend Developer",
        "title": "Frontend Developer",
        "checkWork": "Check my work",
        "contactMe": "Contact me", 
        "description": "I am a frontend developer based in Munich."
      },
      "aboutMe": {
        "title": "About me",
        "subtitle": "Who I am",
        "mainTitle": "About me",
        "introText": "Hi! I'm Mihaela, a Frontend Developer who believes technology should be beautiful, accessible, and empowering for everyone. I love creating intuitive and inclusive digital experiences that improve people's lives.",
        "visionTitle": "My vision:",
        "visionText": "Code is poetry, design is storytelling, and user experience is everything. I love turning ideas into interactive realities that users can't help but love.",
        "locationTitle": "Beyond borders:",
        "locationText": "Wolfsburg is my base, but my ambition knows no limits - ready for remote projects that change the game.",
        "growthTitle": "Always evolving:",
        "growthText": "In a field that never stops changing, I never stop learning. Every day brings new opportunities to grow, create, and make an impact. Ready to collaborate and create something amazing?"
      },
      "portfolio": {
        "subtitle": "Portfolio",
        "title": "Featured Projects",
        "description": "Explore a selection of my work here. Interact with projects to see my skills in action.",
        "nextProject": "Next Project"
      },
      "banner": {
        "remoteWork": "Available for remote work",
        "role": "Frontend Developer", 
        "openToWork": "Open to work & learn",
        "location": "Based in Wolfsburg",
        "skills": "Angular & TypeScript",
        "passion": "Passionate about clean code"
      }
    }
  };

  getTranslation(lang: string): Observable<any> {
    const translation = this.translations[lang as keyof typeof this.translations] || this.translations.de;
    return of(translation);
  }
}
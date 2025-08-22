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
      "references": {
        "projectNames": {
          "kochwelt": "Kochwelt",
          "join": "Join"
        },
        "feedbacks": {
          "marvin1": "Ich möchte meine aufrichtige Wertschätzung für Mihaelas Engagement in unserem Projekt ausdrücken. Obwohl es anfangs vielleicht einige Herausforderungen gab, war klar, wie viel Mühe sie investiert hat und wie schnell sie gelernt hat. Ihr Engagement und ihre Unterstützung waren Schlüsselfaktoren, die uns geholfen haben, das Projekt so effizient abzuschließen. Ohne ihren Beitrag wären die Dinge nicht so reibungslos verlaufen. Ich freue mich darauf, in zukünftigen Projekten wieder mit ihr zusammenzuarbeiten.",
          "christian": "Mihaela hat durchweg Initiative gezeigt, indem sie selbstständig Aufgaben identifiziert und Features gründlich getestet hat. Sie zeigte ein starkes Auge für Details und erkannte oft Probleme, die andere übersehen hatten. Immer motiviert und proaktiv, trug sie sinnvoll in ihrem Bereich bei und half dabei, Aufgaben zuverlässig und engagiert voranzutreiben.",
          "marvin2": "Ich hatte das Vergnügen, mit Mihaela am Join-Projekt zu arbeiten. Während unserer Zusammenarbeit fand ich sie als eine außergewöhnlich zuverlässige, engagierte und zielorientierte Kollegin. Sie arbeitet strukturiert, denkt lösungsorientiert und trägt aktiv zum Team bei. Ihr professioneller Ansatz und ihre starke Initiative machten sie zu einem wertvollen Gewinn für das Projekt. Sie erledigte ihre Aufgaben immer gewissenhaft und pünktlich. Ich schätze Mihaelas Arbeitsethik und Teamgeist sehr und kann die Zusammenarbeit mit ihr vorbehaltlos empfehlen.",
          "soufiane": "Mihaela zeigte große Entschlossenheit, Ehrgeiz und Lernbereitschaft. Sie war immer motiviert, sich in neue Themen einzuarbeiten und brachte frische Perspektiven ins Team. Ihr Engagement spielte eine wichtige Rolle dabei, das Projekt voranzutreiben. Die Zusammenarbeit mit Mihaela war eine großartige Erfahrung.",
          "ha": "Es war ein echtes Vergnügen, mit Mihaela während unseres Gruppenprojekts an der Developer Akademie zu arbeiten. Obwohl Programmieren anfangs eine Herausforderung für sie war, blieb sie engagiert, machte bemerkenswerte Fortschritte und inspirierte oft andere mit ihrer Entschlossenheit. Sie ist äußerst freundlich, höflich und bringt einen großartigen Sinn für Humor ins Team, was eine positive und motivierende Atmosphäre schafft. Mihaela ist fleißig, fokussiert und geht jede Aufgabe mit Präzision und Sorgfalt an."
        }
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
        "nextProject": "Nächstes Projekt",
        "github": "GitHub",
        "liveTest": "Live Test"
      },
      "contact": {
        "title": "Kontaktiere mich",
        "subtitle": "Lass uns zusammenarbeiten",
        "question": "Hast du ein Problem zu lösen?",
        "description": "Ich suche aktiv nach Möglichkeiten, bei denen ich meine Angular-, TypeScript- und JavaScript-Expertise einsetzen kann, um außergewöhnliche Benutzererfahrungen zu schaffen, die den Geschäftserfolg vorantreiben.",
        "needDeveloper": "Brauchst du eine Frontend-Entwicklerin?",
        "letsTalk": "Lass uns sprechen!",
        "form": {
          "nameLabel": "Wie ist dein Name?",
          "namePlaceholder": "Dein Name kommt hierher",
          "nameError": "Bitte gib mindestens 3 Buchstaben ein",
          "emailLabel": "Wie ist deine E-Mail?",
          "emailPlaceholder": "deineemail@email.com",
          "emailError": "Deine E-Mail scheint ungültig zu sein",
          "messageLabel": "Wie kann ich dir helfen?",
          "messagePlaceholder": "Hallo Mihaela, ich interessiere mich für...",
          "messageError": "Bitte gib mindestens 10 Zeichen ein",
          "privacyText": "Ich habe die",
          "privacyLink": "Datenschutzerklärung",
          "privacyTextEnd": "gelesen und stimme der Verarbeitung meiner Daten wie beschrieben zu.",
          "privacyError": "Die Zustimmung zur Datenschutzerklärung ist erforderlich.",
          "submitButton": "Hallo sagen :)",
          "successTitle": "Erfolg!",
          "successMessage": "Deine Nachricht wurde erfolgreich gesendet!",
          "errorTitle": "Fehler",
          "errorMessage": "Beim Senden deiner Nachricht ist ein Fehler aufgetreten.",
          "closeButton": "Schließen"
        }
      },
      "footer": {
        "role": "Web-Entwicklerin",
        "location": "Wolfsburg, Deutschland",
        "legalNotice": "Impressum",
        "links": {
          "github": "GitHub",
          "linkedin": "LinkedIn",
          "email": "E-Mail"
        }
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
      "references": {
        "projectNames": {
          "kochwelt": "Kochwelt",
          "join": "Join"
        },
        "feedbacks": {
          "marvin1": "I want to express my sincere appreciation for Mihaela´s dedication to our project. Even though there may have been some challenges at the beginning, it was clear how much effort you put in and how quickly you learned. Your commitment and support were key factors in helping us complete the project so efficiently. Without your contribution, things wouldn't have gone as smoothly. I look forward to collaborating with you again on future projects.",
          "christian": "Mihaela has consistently shown initiative by independently identifying tasks and thoroughly testing features. She demonstrated a strong eye for detail, often catching issues others overlooked. Always motivated and proactive, she contributed meaningfully within her scope and helped move tasks forward with reliability and commitment.",
          "marvin2": "I had the pleasure of working with Mihaela on the Join project. During our collaboration, I found her to be an exceptionally reliable, committed, and goal-oriented colleague. She works in a structured manner, thinks in terms of solutions, and contributes actively to the team. Her professional approach and strong initiative made her a valuable asset to the project. She always completed her tasks diligently and on time. I truly appreciate Mihaela's work ethic and team spirit, and I can wholeheartedly recommend working with her.",
          "soufiane": "Mihaela demonstrated great determination, ambition, and eagerness to learn. She was always motivated to dive into new topics and brought fresh perspectives to the team. Her dedication played an important role in driving the project forward. Working with Mehaila was a great experience.",
          "ha": "It was a real pleasure to work with Mihaela during our group project at Developer Akademie. Although programming was a challenge for her at first, she stayed committed, made remarkable progress, and often inspired others with her determination. She is extremely friendly, polite, and brings a great sense of humor to the team, creating a positive and motivating atmosphere. Mihaela is hardworking, focused, and approaches every task with precision and care."
        }
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
        "nextProject": "Next Project",
        "github": "GitHub",
        "liveTest": "Live Test"
      },
      "contact": {
        "title": "Contact me",
        "subtitle": "Let's work together",
        "question": "Got a problem to solve?",
        "description": "I'm actively seeking opportunities where I can contribute my Angular, TypeScript, and JavaScript expertise to create exceptional user experiences that drive business success.",
        "needDeveloper": "Need a Front-End Developer?",
        "letsTalk": "Let's talk!",
        "form": {
          "nameLabel": "What's your name?",
          "namePlaceholder": "Your Name goes here",
          "nameError": "Please enter at least 3 letters",
          "emailLabel": "What's your email?",
          "emailPlaceholder": "youremail@email.com",
          "emailError": "Your email appears to be invalid",
          "messageLabel": "How can I help you?",
          "messagePlaceholder": "Hello Mihaela, I am interested in...",
          "messageError": "Please enter at least 10 characters",
          "privacyText": "I've read the",
          "privacyLink": "privacy policy",
          "privacyTextEnd": "and agree to the processing of my data as outlined.",
          "privacyError": "Privacy policy acceptance is required.",
          "submitButton": "Say Hello :)",
          "successTitle": "Success!",
          "successMessage": "Your message has been sent successfully!",
          "errorTitle": "Error",
          "errorMessage": "An error occurred while sending your message.",
          "closeButton": "Close"
        }
      },
      "footer": {
        "role": "Web Developer",
        "location": "Wolfsburg, Germany",
        "legalNotice": "Legal Notice",
        "links": {
          "github": "GitHub",
          "linkedin": "LinkedIn",
          "email": "E-Mail"
        }
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
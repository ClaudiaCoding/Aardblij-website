/* =========================================================
   Aardblij Workshops · gedeelde scripts voor alle pagina's
   ========================================================= */

/* Site-instellingen.
   Formulieren: de Reserveer-pop-up én het offerteformulier sturen naar Forminit (forminit.com).
   Forminit form: inputs are named fi-{type}-{name}. Rules: https://forminit.com/setup.md */
window.AARDBLIJ = {
    forminitFormId: '29u28mepndv', // de Form ID uit https://app.forminit.com

    /* Landen in de keuzelijst voor het telefoonnummer (de eerste staat voorgekozen) */
    landcodes: [['+31', 'NL +31'], ['+32', 'BE +32'], ['+49', 'DE +49'], ['+45', 'DK +45'], ['+352', 'LU +352']],

    /* Meldingen per veld dat Forminit controleert. Sleutels zijn Forminit's veldnamen:
       sender.<naam> voor fi-sender-*, anders de {name} uit fi-{type}-{name}. */
    veldFouten: {
        'sender.fullName': 'Gebruik in uw naam alleen letters, spaties, koppeltekens, apostroffen en punten.',
        'sender.email': 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.',
        'sender.phone': 'Vul een geldig telefoonnummer in en kies het juiste land.',
        'aantal_personen': 'Vul een heel getal in.',
        'voorkeursdatum': 'Vul een geldige datum in.'
    },

    /* Hernoemt de velden van een formulier naar Forminit-namen (zonder waarden te verliezen) */
    hernoem(fd, namen) {
        for (const [van, naar] of namen) {
            for (const waarde of fd.getAll(van)) fd.append(naar, waarde);
            fd.delete(van);
        }
        // Gekrulde apostroffen (zoals van een iPhone) worden door Forminit geweigerd in namen
        const naam = fd.get('fi-sender-fullName');
        if (typeof naam === 'string') fd.set('fi-sender-fullName', naam.replace(/[\u2018\u2019]/g, "'"));
    },

    /* Maakt van een lokaal nummer (06 12345678) een internationaal nummer (+31612345678) */
    internationaalNummer(fd, landSelect) {
        const nummer = fd.get('fi-sender-phone');
        if (landSelect && typeof nummer === 'string' && nummer.trim() && !nummer.trim().startsWith('+')) {
            fd.set('fi-sender-phone', landSelect.value + nummer.replace(/\D/g, '').replace(/^0/, ''));
        }
    },

    /* Zet een keuzelijst met landcodes vóór een telefoonveld */
    landKeuze(telefoonVeld) {
        const rij = document.createElement('div');
        rij.className = 'telefoon-rij';
        const select = document.createElement('select');
        select.setAttribute('aria-label', 'Landcode');
        this.landcodes.forEach(([code, tekst]) => select.add(new Option(tekst, code)));
        telefoonVeld.parentNode.insertBefore(rij, telefoonVeld);
        rij.append(select, telefoonVeld);
        return select;
    },

    /* Welk veld ging mis en welke melding hoort erbij */
    forminitFout(error) {
        const veld = error?.fieldName ?? /['"]([^'"]+)['"]/.exec(error?.message ?? '')?.[1];
        if (veld && this.veldFouten[veld]) return { veld, tekst: this.veldFouten[veld] };
        if (error?.error === 'TOO_MANY_REQUESTS') return { veld: null, tekst: 'Wacht een paar seconden en probeer het dan opnieuw.' };
        return { veld: null, tekst: null };
    },

    /* Verstuurt naar Forminit. Geeft { gelukt, fout } terug. */
    async verstuur(fd) {
        if (!this._forminit) this._forminit = new Forminit();
        const { data, error } = await this._forminit.submit(this.forminitFormId, fd);
        if (error || typeof data?.hashId !== 'string') {
            console.error('Forminit:', error ?? data);
            return { gelukt: false, fout: this.forminitFout(error) };
        }
        return { gelukt: true };
    },

    /* Alle workshops, op één plek. Deze lijst vult de keuzelijst in
       de Reserveer-pop-up én in het offerteformulier.
       Nieuwe workshop? Zet hem hier erbij, dan staat hij in beide formulieren. */
    workshops: [
        'Cocktail Kaarsen Maken',
        'Epoxy Gieten',
        'Schilderen tussen Alpacas',
        'Schilderen in de Appelboomgaard',
        'Schilderen in het Voedselbos',
        'Bosbaden',
        'Sieraden Maken',
        'Mozaïeken',
        'Bedazzelen',
        'Verf Therapie',
        'Fotoshoot met Telefoon'
        // 'Kerstkransen en Kerststukjes Maken'  (tijdelijk verborgen; weer aanzetten: haal // weg en zet een komma achter de regel erboven)
    ],

    /* Laatste keuze onderaan de lijst */
    workshopAnders: 'Anders, of ik weet het nog niet',

    /* Zet de workshops als keuzes in een <select>
       (na de eerste "Kies een workshop"-regel die er al staat) */
    vulWorkshops(select) {
        this.workshops.concat(this.workshopAnders).forEach(naam => {
            select.add(new Option(naam, naam));
        });
    }
};

(function () {
    // Keuzelijsten met data-workshops vullen (bijv. op de offertepagina)
    document.querySelectorAll('select[data-workshops]').forEach(select => {
        window.AARDBLIJ.vulWorkshops(select);
    });

    const nav = document.querySelector('nav');
    const menuKnop = document.querySelector('.nav-toggle');

    function sluitMenu() {
        if (nav) nav.classList.remove('open');
        if (menuKnop) menuKnop.setAttribute('aria-expanded', 'false');
    }

    // Hamburgermenu openen en sluiten
    if (menuKnop) {
        menuKnop.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            menuKnop.setAttribute('aria-expanded', isOpen);
        });
    }

    // Soepel scrollen binnen de pagina; logo en Home (#top / #home) gaan naar boven
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const doel = link.getAttribute('href');
            if (doel === '#') return;
            e.preventDefault();
            if (doel === '#top' || doel === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const element = document.querySelector(doel);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }
            sluitMenu();
        });
    });
})();

/* =========================================================
   Aardblij Workshops · Reserveer-pop-up
   Elke knop met data-aanvraag opent de pop-up.
   Met data-workshop="Naam" staat die workshop al ingevuld.
   Verstuurt naar Forminit. De Form ID, de lijst met workshops en de
   verzendhulp staan in site.js (window.AARDBLIJ).
   ========================================================= */

(function () {
    // Pop-up en bevestigingsmelding in de pagina zetten
    document.body.insertAdjacentHTML('beforeend', `
<dialog class="aanvraag" id="aanvraag" aria-labelledby="aanvraag-titel">
    <div class="aanvraag-binnen">
        <div class="aanvraag-kop">
            <div>
                <h2 id="aanvraag-titel">Workshop reserveren</h2>
                <p>Vertel ons wat u zoekt. Wij nemen zo snel mogelijk contact met u op met een voorstel op maat.</p>
            </div>
            <button type="button" class="aanvraag-sluit" aria-label="Sluiten">&times;</button>
        </div>

        <form id="aanvraag-form" novalidate>
            <div class="velden">
                <div class="veld breed">
                    <label for="f-workshop">Welke workshop?</label>
                    <select id="f-workshop" name="Workshop" required>
                        <option value="" selected disabled>Kies een workshop</option>
                        <!-- De workshops komen uit site.js (window.AARDBLIJ.workshops) -->
                    </select>
                    <p class="fout" id="fout-workshop" hidden></p>
                </div>

                <fieldset class="veld breed">
                    <legend>Waar wilt u de workshop?</legend>
                    <div class="keuzes">
                        <label class="keuze"><input type="radio" name="Waar" value="Bij u op locatie"><span>Bij u op locatie</span></label>
                        <label class="keuze"><input type="radio" name="Waar" value="In ons atelier"><span>In ons atelier</span></label>
                        <label class="keuze"><input type="radio" name="Waar" value="Nog niet bekend"><span>Nog niet bekend</span></label>
                    </div>
                </fieldset>

                <div class="veld">
                    <label for="f-gezelschap">Soort gezelschap <span class="optioneel">(optioneel)</span></label>
                    <select id="f-gezelschap" name="Soort gezelschap">
                        <option value="">Maak een keuze</option>
                        <option>Teamuitje of bedrijfsuitje</option>
                        <option>Verjaardag of feest</option>
                        <option>Vriendengroep of vriendenweekend</option>
                        <option>Familie</option>
                        <option>Vrijgezellenfeest</option>
                        <option>Anders</option>
                    </select>
                </div>

                <div class="veld">
                    <label for="f-aantal">Aantal personen</label>
                    <input type="number" id="f-aantal" name="Aantal personen" min="1" inputmode="numeric" required>
                    <p class="fout" id="fout-aantal" hidden></p>
                </div>

                <div class="veld">
                    <label for="f-naam">Contactpersoon</label>
                    <input type="text" id="f-naam" name="Contactpersoon" autocomplete="name" required>
                    <p class="fout" id="fout-naam" hidden></p>
                </div>

                <div class="veld">
                    <label for="f-email">E-mailadres</label>
                    <input type="email" id="f-email" name="E-mailadres" autocomplete="email" required>
                    <p class="fout" id="fout-email" hidden></p>
                </div>

                <div class="veld">
                    <label for="f-telefoon">Telefoonnummer <span class="optioneel">(optioneel)</span></label>
                    <input type="tel" id="f-telefoon" name="Telefoonnummer" autocomplete="tel">
                </div>

                <div class="veld">
                    <label for="f-plaats">Voorkeursplaats <span class="optioneel">(optioneel)</span></label>
                    <input type="text" id="f-plaats" name="Voorkeursplaats" autocomplete="address-level2" placeholder="Bijvoorbeeld Huizen">
                </div>

                <div class="veld">
                    <label for="f-datum">Voorkeursdatum <span class="optioneel">(optioneel)</span></label>
                    <input type="date" id="f-datum" name="Voorkeursdatum">
                </div>

                <fieldset class="veld" id="veld-locatie">
                    <legend>Heeft u een eigen locatie? <span class="optioneel">(optioneel)</span></legend>
                    <div class="keuzes">
                        <label class="keuze"><input type="radio" name="Heeft u een locatie?" value="Ja"><span>Ja</span></label>
                        <label class="keuze"><input type="radio" name="Heeft u een locatie?" value="Nee"><span>Nee</span></label>
                    </div>
                    <p class="hulp">Bijvoorbeeld uw kantoor, huis of een gehuurde ruimte.</p>
                </fieldset>

                <div class="veld breed">
                    <label for="f-bericht">Bericht of verzoek <span class="optioneel">(optioneel)</span></label>
                    <textarea id="f-bericht" name="Bericht/Verzoek" placeholder="Vertel ons over de gelegenheid, het tijdstip of andere wensen."></textarea>
                </div>

                <div class="vangnet" aria-hidden="true">
                    <label for="f-gotcha">Laat dit veld leeg</label>
                    <input type="text" id="f-gotcha" name="_gotcha" tabindex="-1" autocomplete="off">
                </div>
            </div>

            <div class="aanvraag-acties">
                <button type="submit" class="cta-button" id="aanvraag-verstuur">Aanvraag versturen</button>
                <p>Wij gebruiken uw gegevens alleen om uw aanvraag te beantwoorden (<a href="privacybeleid.html">privacybeleid</a>). Op al onze workshops zijn onze <a href="algemene-voorwaarden.html">algemene voorwaarden</a> van toepassing.</p>
            </div>
            <p class="verzendfout" id="aanvraag-verzendfout" hidden>Het versturen is niet gelukt. Controleer uw internetverbinding en probeer het opnieuw.</p>
        </form>
    </div>
</dialog>
<div class="bevestiging" id="bevestiging" role="status" aria-live="polite"></div>
`);

    // Workshops in de keuzelijst zetten (lijst staat in site.js)
    window.AARDBLIJ.vulWorkshops(document.getElementById('f-workshop'));

    const dialoog = document.getElementById('aanvraag');
    const formulier = document.getElementById('aanvraag-form');
    const verstuurKnop = document.getElementById('aanvraag-verstuur');
    const verzendfout = document.getElementById('aanvraag-verzendfout');
    const veldLocatie = document.getElementById('veld-locatie');
    const datumVeld = document.getElementById('f-datum');
    const bevestiging = document.getElementById('bevestiging');
    const telefoonVeld = document.getElementById('f-telefoon');
    const landSelect = window.AARDBLIJ.landKeuze(telefoonVeld);
    const verzendfoutTekst = verzendfout.textContent;
    let bezig = false;
    const nav = document.querySelector('nav');
    const menuKnop = document.querySelector('.nav-toggle');
    let bevestigingTimer;

    // Geen datum in het verleden kiezen
    const vandaag = new Date();
    const pad = n => String(n).padStart(2, '0');
    datumVeld.min = vandaag.getFullYear() + '-' + pad(vandaag.getMonth() + 1) + '-' + pad(vandaag.getDate());

    function sluitMenu() {
        if (nav) nav.classList.remove('open');
        if (menuKnop) menuKnop.setAttribute('aria-expanded', 'false');
    }

    function openAanvraag(workshop) {
        formulier.reset();
        verzendfout.hidden = true;
        wisFouten();
        toonLocatieVraag();
        if (workshop) {
            const select = document.getElementById('f-workshop');
            Array.from(select.options).forEach(o => { if (o.text === workshop) select.value = o.value; });
        }
        sluitMenu();
        if (typeof dialoog.showModal === 'function') {
            dialoog.showModal();
        } else {
            dialoog.setAttribute('open', '');
        }
        document.body.style.overflow = 'hidden';
    }

    function sluitAanvraag() {
        if (typeof dialoog.close === 'function') {
            dialoog.close();
        } else {
            dialoog.removeAttribute('open');
            document.body.style.overflow = '';
        }
    }

    dialoog.addEventListener('close', () => { document.body.style.overflow = ''; });

    // Klik buiten de pop-up sluit hem
    dialoog.addEventListener('click', e => { if (e.target === dialoog) sluitAanvraag(); });
    dialoog.querySelector('.aanvraag-sluit').addEventListener('click', sluitAanvraag);

    // Alle knoppen met data-aanvraag openen de pop-up (optioneel: data-workshop="Naam")
    document.querySelectorAll('[data-aanvraag]').forEach(knop => {
        knop.addEventListener('click', e => {
            e.preventDefault();
            openAanvraag(knop.getAttribute('data-workshop'));
        });
    });

    // Vraag "Heeft u een eigen locatie?" alleen tonen als het niet in het atelier is
    function toonLocatieVraag() {
        const waar = formulier.querySelector('input[name="Waar"]:checked');
        const inAtelier = waar && waar.value === 'In ons atelier';
        veldLocatie.hidden = !!inAtelier;
        if (inAtelier) {
            formulier.querySelectorAll('input[name="Heeft u een locatie?"]').forEach(r => { r.checked = false; });
        }
    }
    formulier.querySelectorAll('input[name="Waar"]').forEach(r => r.addEventListener('change', toonLocatieVraag));

    // Validatie
    const verplicht = [
        { veld: 'f-workshop', fout: 'fout-workshop', tekst: 'Kies een workshop.' },
        { veld: 'f-aantal', fout: 'fout-aantal', tekst: 'Vul het aantal personen in (minimaal 1).' },
        { veld: 'f-naam', fout: 'fout-naam', tekst: 'Vul de naam van de contactpersoon in.' },
        { veld: 'f-email', fout: 'fout-email', tekst: 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.' }
    ];

    function wisFouten() {
        verplicht.forEach(v => {
            const veld = document.getElementById(v.veld);
            const fout = document.getElementById(v.fout);
            veld.removeAttribute('aria-invalid');
            veld.removeAttribute('aria-describedby');
            fout.hidden = true;
            fout.textContent = '';
        });
    }

    function controleerAanvraag() {
        wisFouten();
        let eerste = null;
        verplicht.forEach(v => {
            const veld = document.getElementById(v.veld);
            if (!veld.checkValidity() || !String(veld.value).trim()) {
                const fout = document.getElementById(v.fout);
                fout.textContent = v.tekst;
                fout.hidden = false;
                veld.setAttribute('aria-invalid', 'true');
                veld.setAttribute('aria-describedby', v.fout);
                if (!eerste) eerste = veld;
            }
        });
        if (eerste) eerste.focus();
        return !eerste;
    }

    function waarde(id) { return document.getElementById(id).value.trim(); }

    // Veldnamen in dit formulier → namen in Forminit (dezelfde als op de offertepagina)
    const FORMINIT_NAMEN = [
        ['Workshop', 'fi-select-workshop'],
        ['Waar', 'fi-radio-waar'],
        ['Soort gezelschap', 'fi-select-gezelschap'],
        ['Aantal personen', 'fi-number-aantal_personen'],
        ['Contactpersoon', 'fi-sender-fullName'],
        ['E-mailadres', 'fi-sender-email'],
        ['Telefoonnummer', 'fi-sender-phone'],
        ['Voorkeursplaats', 'fi-text-plaats'],
        ['Voorkeursdatum', 'fi-date-voorkeursdatum'],
        ['Heeft u een locatie?', 'fi-radio-eigen_locatie'],
        ['Bericht/Verzoek', 'fi-text-bericht']
    ];

    // Forminit-veld → het invoerveld en de foutmelding in de pop-up
    const FOUT_PLEK = {
        'sender.fullName': ['f-naam', 'fout-naam'],
        'sender.email': ['f-email', 'fout-email'],
        'sender.phone': ['f-telefoon', null],
        'aantal_personen': ['f-aantal', 'fout-aantal'],
        'voorkeursdatum': ['f-datum', null]
    };

    function toonVerzendfout(fout) {
        const plek = fout.veld && FOUT_PLEK[fout.veld];
        verzendfout.textContent = fout.tekst || verzendfoutTekst;
        if (plek) {
            const veld = document.getElementById(plek[0]);
            if (plek[1]) {
                const melding = document.getElementById(plek[1]);
                melding.textContent = fout.tekst;
                melding.hidden = false;
                veld.setAttribute('aria-describedby', plek[1]);
            }
            veld.setAttribute('aria-invalid', 'true');
            veld.focus();
        }
        verzendfout.hidden = false;
    }

    // Groene melding onderin het scherm, verdwijnt na 6 seconden
    function toonBevestiging() {
        bevestiging.innerHTML = '<span aria-hidden="true">✓</span>' +
            '<span><strong>Bedankt voor uw aanvraag!</strong> Wij nemen zo snel mogelijk contact met u op.</span>';
        requestAnimationFrame(() => bevestiging.classList.add('zichtbaar'));
        clearTimeout(bevestigingTimer);
        bevestigingTimer = setTimeout(() => {
            bevestiging.classList.remove('zichtbaar');
            bevestigingTimer = setTimeout(() => { bevestiging.innerHTML = ''; }, 400);
        }, 6000);
    }

    // Na versturen: formulier leegmaken, pop-up sluiten en bevestiging tonen
    function afronden() {
        formulier.reset();
        sluitAanvraag();
        toonBevestiging();
    }

    formulier.addEventListener('submit', async e => {
        e.preventDefault();
        if (bezig) return;
        verzendfout.hidden = true;
        if (!controleerAanvraag()) return;

        // Spamfilter: als dit verborgen veld is ingevuld, is het een robot
        if (waarde('f-gotcha')) { afronden(); return; }

        const fd = new FormData(formulier); // vóór de knop wordt uitgeschakeld
        window.AARDBLIJ.hernoem(fd, FORMINIT_NAMEN);
        window.AARDBLIJ.internationaalNummer(fd, landSelect);
        fd.append('fi-text-via', 'Reserveer-pop-up');

        bezig = true;
        verstuurKnop.disabled = true;
        verstuurKnop.textContent = 'Bezig met versturen…';
        try {
            const resultaat = await window.AARDBLIJ.verstuur(fd);
            if (resultaat.gelukt) afronden();
            else toonVerzendfout(resultaat.fout);
        } catch (fout) {
            console.error('Forminit:', fout);
            toonVerzendfout({ veld: null, tekst: null });
        } finally {
            bezig = false;
            verstuurKnop.disabled = false;
            verstuurKnop.textContent = 'Aanvraag versturen';
        }
    });
})();

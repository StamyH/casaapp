# 📋 Requisiti CasaApp

## Utenti
- L'app supporta due utenti: **Riccardo** e **Federico**
- Ogni utente seleziona il proprio profilo all'avvio
- I dati sono condivisi e sincronizzati in tempo reale

---

## Modulo Spese

### Registrazione spesa
- [ ] Inserire importo
- [ ] Inserire descrizione
- [ ] Selezionare categoria (spesa, bolletta, affitto, altro)
- [ ] Selezionare chi ha pagato (Riccardo / Federico)
- [ ] Selezionare come dividere la spesa:
  - **Metà/Metà** — 50% ciascuno
  - **Tutto a me** — chi paga si accolla tutto
  - **Tutto all'altro** — chi paga anticipa tutto per l'altro
  - **Percentuale custom** — slider per scegliere la percentuale
- [ ] Data automatica

### Visualizzazione
- [ ] Lista spese del mese corrente
- [ ] Filtro per categoria
- [ ] Totale spese del mese

### Bilancio
- [ ] Calcolo automatico di chi deve cosa a chi
- [ ] Storico mesi precedenti

---

## Modulo Attività

### Creazione attività
- [ ] Titolo attività
- [ ] Frequenza:
  - **Giornaliera** — si ripete ogni giorno
  - **Settimanale** — si ripete un giorno specifico della settimana (es. ogni lunedì)
  - **Mensile** — si ripete una data specifica del mese (es. ogni 1° del mese)
  - **Data specifica** — una tantum, con data scelta da calendario
- [ ] Assegnazione: Riccardo, Federico, o entrambi
- [ ] Reset automatico alla scadenza per task ricorrenti

### Gestione
- [ ] Spunta completamento
- [ ] Reset automatico alla scadenza
- [ ] Notifica visiva se in ritardo

---

## Requisiti tecnici
- [ ] PWA installabile su iPhone
- [ ] Funziona offline
- [ ] Sincronizzazione Firebase in tempo reale
- [ ] Responsive mobile-first

---

## Modulo Impostazioni

### Profili utente
- [ ] Modificare il nome utente
- [ ] Scegliere avatar o colore profilo

### Categorie spese
- [ ] Visualizzare categorie esistenti
- [ ] Aggiungere nuova categoria personalizzata
- [ ] Eliminare qualsiasi categoria (incluse quelle base)

### Tema
- [ ] Scegliere il colore principale dell'app (applicato in tempo reale)
- [ ] Modalità chiara / scura (applicata in tempo reale)
- [ ] Segui impostazioni del telefono (auto)

### Gestione casa
- [ ] Modificare il nome della casa
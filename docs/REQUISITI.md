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
- [ ] Frequenza: giornaliera, settimanale, mensile
- [ ] Assegnazione: Riccardo, Federico, o entrambi
- [ ] Data scadenza automatica in base alla frequenza

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

### Tema
- [ ] Scegliere il colore principale dell'app
- [ ] Modalità chiara / scura

### Categorie spese
- [ ] Visualizzare categorie esistenti
- [ ] Aggiungere nuova categoria personalizzata
- [ ] Eliminare categoria personalizzata

### Gestione casa
- [ ] Modificare il nome della casa
/* DONNÉES · Studio Ambrine (salon fictif, Reims). Tout est inventé. Aucun prix inventé.
   Pour un autre salon : on ne touche pas au moteur, on change seulement ce fichier.
   options = « option de prestation » générique : une prestation peut pointer vers un groupe d'options
   (ici la gamme), chaque choix a une phrase d'explication, un supplément éventuel et des minutes en plus. */
window.AMBRINE = {
  commerce: "Studio Ambrine", prefixe: "SA",
  adresse: { rue: "6 rue de la Mèche", ville: "51100 Reims", carte: "https://www.google.com/maps/search/?api=1&query=Reims" },
  horaires: [["Lundi", ""], ["Mardi", "9:00-18:00"], ["Mercredi", "9:00-18:00"], ["Jeudi", "9:00-19:00"], ["Vendredi", "9:00-19:00"], ["Samedi", "9:00-17:00"], ["Dimanche", ""]],
  photos: { coupe: "sa-coupe.jpg", couleur: "sa-couleur.jpg", balayage: "sa-real-balayage.jpg", lena: "sa-real-balayage.jpg", maelle: "sa-homme.jpg", ines: "sa-real-boucles.jpg",
    carre: "sa-real-carre.jpg", boucles: "sa-real-boucles.jpg", courte: "sa-real-courte.jpg", degrade: "sa-real-degrade.jpg", longues: "sa-real-longues.jpg" },
  /* places du plan photo (mètres, image 8 × 12,846 m) */
  places: [
    { n: 1, nom: "Fauteuil fenêtre", d: "Vue sur la rue, lumière du jour", x: 1.335, y: 10.614 },
    { n: 2, nom: "Fauteuil 2", d: "Au cœur du salon", x: 1.335, y: 8.905 },
    { n: 3, nom: "Fauteuil 3", d: "Au cœur du salon", x: 1.335, y: 7.25 },
    { n: 4, nom: "Fauteuil 4", d: "Coin calme, loin de l'entrée", x: 1.335, y: 5.677 },
    { n: 5, nom: "Fauteuil enfant", d: "Rehausseur, près de la vitrine", x: .805, y: 11.6, petit: true },
    { n: 6, nom: "Fauteuil barbe", d: "Pour la barbe et les coupes courtes", x: 6.51, y: 8.091 },
    { n: 10, nom: "Espace privé", d: "À l'abri des regards", x: 1.335, y: 3.391, prive: true }
  ],
  faq: [
    ["Je suis en retard, que faire ?", "Prévenez-nous depuis « Mon rendez-vous » : on garde votre place si on peut."],
    ["Comment annuler ou déplacer ?", "Page « Mon rendez-vous », un bouton suffit. Merci de prévenir la veille."],
    ["Faut-il un compte ?", "Non. Votre portable, vérifié une fois par un code SMS, suffit."],
    ["Et sans rendez-vous ?", "Oui, selon les places libres : l'Accueil indique combien il en reste."]
  ],
  fidelite: { sur: 10, texte: "La 10e coupe est offerte." },

  salon: { espacePrive: true, sansRdv: { actif: true, libres: 2 } },
  /* « Votre rythme » (équivalent de « Pressé / On prend le temps » du restaurant). min = minutes en plus ou en moins. */
  rythmes: {
    express: { n: "Express", d: "Coupe seule, prise à l'heure pile, sans attente", min: -10, sansExtras: true },
    detente: { n: "Détente", d: "Massage au bac, boisson chaude, on prend le temps", min: 15, place: 8 }
  },
  /* heures creuses : un petit plus pour remplir les matinées calmes */
  creuses: { jours: ["mar", "mer", "jeu"], avant: 600, plus: "soin offert", texte: "Heures creuses, du mardi au jeudi avant 10 h : le soin est offert." },
  prestations: {
    coupe:    { n: "Coupe",    min: 45,  opt: "gamme" },
    couleur:  { n: "Couleur",  min: 75,  opt: "gamme" },
    balayage: { n: "Balayage", min: 120, opt: "gamme" }
  },
  extras: { soin: { n: "Soin", min: 20 }, masque: { n: "Masque", min: 15 }, brushing: { n: "Brushing", min: 30 } },
  options: {
    gamme: {
      titre: "Choisissez votre gamme", aide: "Les produits utilisés pour vous", defaut: "classique",
      choix: [
        { id: "douce",     n: "Douce",            d: "Cuir chevelu sensible", sup: true,  min: 0 },
        { id: "classique", n: "Classique",        d: "Pour tous les cheveux", sup: false, min: 0 },
        { id: "haute",     n: "Haute protection", d: "Cheveux abîmés",        sup: true,  min: 10 }
      ]
    }
  },
  packs: {
    douce:     { n: "Pack Douce",            d: "Shampoing sans parfum et soin apaisant." },
    classique: { n: "Pack Classique",        d: "Shampoing du quotidien et démêlant léger." },
    haute:     { n: "Pack Haute protection", d: "Shampoing nourrissant et masque réparateur." }
  },
  jours: { mar: ["Mar.", "Mardi"], mer: ["Mer.", "Mercredi"], jeu: ["Jeu.", "Jeudi"], ven: ["Ven.", "Vendredi"], sam: ["Sam.", "Samedi"] },
  coiffeuses: {
    lena:   { n: "Léna",   s: "Couleur, balayage", fait: ["coupe", "couleur", "balayage"], l: { mar: "9:00-11:30,14:00-16:30", mer: "", jeu: "9:30-12:00", ven: "", sam: "9:00-12:00" } },
    maelle: { n: "Maëlle", s: "Hommes, enfants",   fait: ["coupe"], l: { mar: "9:30-12:00", mer: "14:00-18:00", jeu: "", ven: "9:00-12:00", sam: "10:00-12:00" } },
    ines:   { n: "Inès",   s: "Boucles, soins",    fait: ["coupe", "couleur"], l: { mar: "", mer: "9:00-12:00", jeu: "14:00-17:30", ven: "9:00-11:30", sam: "14:00-17:00" } }
  },
  avant: { c: "lena", p: "coupe", gamme: "douce" },  // la cliente fictive « Camille », il y a 6 semaines
  plusieurs: { adulte: { n: "Adulte", d: "coupe", min: 45 }, enfant: { n: "Enfant", d: "coupe enfant", min: 30 } },
  themes: {
    soin:   { n: "Semaine du soin",            q: "Cette semaine", c: "lena",   p: "coupe", x: ["soin"] },
    boucles:{ n: "Semaine des boucles",        q: "La suivante",   c: "ines",   p: "coupe", x: [] },
    court:  { n: "Semaine de la coupe courte", q: "Dans 15 jours", c: "maelle", p: "coupe", x: [] }
  },
  galerie: {
    carre:   { n: "Carré flou",          c: "lena",   p: "coupe",    x: ["brushing"], g: "classique" },
    boucles: { n: "Boucles définies",    c: "ines",   p: "coupe",    x: ["soin"],     g: "douce" },
    balayage:{ n: "Balayage doux",       c: "lena",   p: "balayage", x: [],           g: "haute" },
    courte:  { n: "Coupe courte",        c: "maelle", p: "coupe",    x: [],           g: "classique" },
    degrade: { n: "Dégradé homme",       c: "maelle", p: "coupe",    x: [],           g: "classique" },
    longues: { n: "Longueurs et soin",   c: "ines",   p: "coupe",    x: ["masque"],   g: "haute" }
  }
};

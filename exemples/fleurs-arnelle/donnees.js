/* DONNÉES · Fleurs Arnelle (fleuriste fictif, Verdun). Tout est inventé. Aucun prix inventé. */
window.ARNELLE = {
  commerce: "Fleurs Arnelle", prefixe: "FA", seuil: 11,
  adresse: { rue: "9 rue des Glycines", ville: "55100 Verdun", carte: "https://www.google.com/maps/search/?api=1&query=Verdun" },
  ouvert: [2, 3, 4, 5, 6], /* mardi → samedi */
  horaires: [["Lundi", ""], ["Mardi", "9 h – 19 h"], ["Mercredi", "9 h – 19 h"], ["Jeudi", "9 h – 19 h"], ["Vendredi", "9 h – 19 h"], ["Samedi", "9 h – 19 h"], ["Dimanche", ""]],
  occasions: [
    ["anniversaire", "Anniversaire", "Des couleurs gaies, pour faire plaisir."], ["merci", "Merci", "Simple et frais, pour dire merci."], ["amour", "Amour", "Des roses et des fleurs tendres."],
    ["naissance", "Naissance", "Des tons doux, facile à poser."], ["sans raison", "Sans raison", "Juste pour le plaisir d’offrir."]],
  styles: [
    ["champetre", "Champêtre", "Fleurs des champs, un peu sauvages.", "fa-bq-champetre.jpg"], ["blanc", "Blanc et vert", "Sobre et lumineux.", "fa-bq-blanc.jpg"],
    ["rose", "Rose poudré", "Doux et romantique.", "fa-bq-rose.jpg"], ["arnelle", "Au choix d’Arnelle", "Les plus belles fleurs arrivées ce matin.", "fa-bouquet-main.jpg"]],
  tailles: [["petit", "Petit", "Bureau, table de chevet"], ["moyen", "Moyen", "Table, salon"], ["genereux", "Généreux", "Pour marquer le coup"]],
  moments: [["debut", "Début d’après-midi", "après le déjeuner"], ["fin", "Fin d’après-midi", "avant le soir"], ["peu", "Peu importe", "dans la tournée"]],
  ateliers: [
    { id: "bouquet", t: "Composer son bouquet", q: "vendredi 18 h 30", js: [5], d: "Choisir les fleurs, les tenir, les nouer. Arnelle vous guide.", c: "votre bouquet", ou: "boutique", img: "fa-atelier.jpg", pris: [5, 8, 2] },
    { id: "rosiers", t: "Tailler ses rosiers", q: "samedi 10 h", js: [6], d: "Où couper, quand, avec quel outil. Vous taillez de vrais rosiers.", c: "un petit rosier en pot", ou: "boutique", img: "fa-bq-rose.jpg", pris: [3, 6, 1] },
    { id: "rempoter", t: "Planter et rempoter", q: "mercredi 14 h", js: [3], d: "Le bon pot, la bonne terre, le bon geste.", c: "la plante rempotée", ou: "boutique", img: "fa-bq-blanc.jpg", pris: [7, 4, 8] },
    { id: "potager", t: "Le potager : quoi planter, quand", q: "samedi 14 h", js: [6], d: "Le calendrier des semis, simplement.", c: "des plants de saison", ou: "boutique", img: "fa-bq-champetre.jpg", pris: [2, 8, 5] }],
  placesAtelier: 8,
  abo: { pour: [["maison", "Chez moi"], ["resto", "Un restaurant"], ["bureau", "Un bureau"], ["commerce", "Un commerce"]], rythme: [["sem", "Chaque semaine"], ["quinz", "Toutes les 2 semaines"], ["mois", "Chaque mois"]] },
  evenements: { deuil: { t: "Deuil", d: "Avec délicatesse, sans vous presser.", l: ["Gerbe, couronne, coussin", "Livré au lieu de la cérémonie"], img: "fa-deuil.jpg" },
                mariage: { t: "Mariage", d: "Du bouquet de la mariée à la salle.", l: ["Bouquet, boutonnières", "Tables, arche, buffet"], img: "fa-mariage.jpg" } },
  faq: [["Jusqu’à quelle heure commander pour aujourd’hui ?", "Avant 11 h. Après, on livre le lendemain."], ["Je vois le bouquet avant qu’il parte ?", "Oui : vous recevez sa photo par SMS, juste avant la livraison."],
        ["Où livrez-vous ?", "Dans Verdun et les communes autour. La carte vous le montre."], ["Je peux le retirer à la boutique ?", "Oui. Dites-le dans le mot pour Arnelle en commandant."], ["L’abonnement, je peux l’arrêter ?", "Oui, à tout moment, depuis « Ma commande »."]]
};

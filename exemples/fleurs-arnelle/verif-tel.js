/* VERIF-TEL · contre les fausses réservations et commandes, pour tous les métiers.
   Avant de confirmer : prénom + portable, puis un code reçu par SMS (une seule fois par numéro sur ce téléphone).
   Exemple : aucun SMS ne part, la page affiche le code. Version livrée : brancher envoyer()/verifier() sur le serveur (SMS via Brevo, comme Uno Pizza).
   Usage : VerifTel.demander(zoneHTML, { titre, bouton }, function (u) { u.prenom, u.tel, u.deja }) */
(function (w) {
  var CLE = "verif-tel-ok";
  function lire() { try { return JSON.parse(localStorage.getItem(CLE) || "[]") } catch (e) { return [] } }
  function noter(t) { try { var l = lire(); if (l.indexOf(t) < 0) l.push(t); localStorage.setItem(CLE, JSON.stringify(l)) } catch (e) {} }
  function net(t) { return String(t || "").replace(/[\s.\-]/g, "").replace(/^\+33/, "0") }
  function bon(t) { return /^0[67]\d{8}$/.test(t) }
  function beau(t) { return t.replace(/(\d\d)(?=\d)/g, "$1 ") }
  function h(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  var memo = { prenom: "", tel: "", email: "", offres: false };

  function demander(Z, o, fini) {
    o = o || {}; var code = "", tel = "", prenom = memo.prenom;
    function etape1(err) {
      Z.innerHTML = '<div class="vt"><p class="vt-t">' + h(o.titre || "Pour confirmer, votre portable") + '</p>' +
        '<p class="vt-s">Pour éviter les fausses réservations, on vérifie votre numéro par un code SMS. Une seule fois sur ce téléphone.</p>' +
        '<label class="vt-c"><span>Prénom</span><input type="text" autocomplete="given-name" value="' + h(prenom) + '"></label>' +
        '<label class="vt-c"><span>Portable</span><input type="tel" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" value="' + h(memo.tel) + '"></label>' +
        '<label class="vt-c"><span>E-mail</span><input type="email" inputmode="email" autocomplete="email" placeholder="prenom@exemple.fr" value="' + h(memo.email) + '"></label>' +
        '<p class="vt-conf">Vous recevrez une confirmation par SMS et par e-mail.</p>' +
        '<label class="vt-case"><input type="checkbox"' + (memo.offres ? " checked" : "") + '><span>J’accepte de recevoir les nouveautés et offres' + (o.commerce ? " de " + h(o.commerce) : "") + '. Facultatif.</span></label>' +
        '<p class="vt-err" role="alert">' + h(err || "") + '</p><button type="button" class="vt-go">Recevoir mon code</button>' +
        '<p class="vt-rgpd">Vos coordonnées servent seulement à cette réservation. Vous pouvez les faire effacer à tout moment.</p></div>';
      var I = Z.querySelectorAll("input"), B = Z.querySelector(".vt-go");
      B.addEventListener("click", function () {
        prenom = I[0].value.trim(); tel = net(I[1].value); memo.prenom = prenom; memo.tel = I[1].value; memo.email = I[2].value.trim(); memo.offres = I[3].checked;
        if (!prenom) return etape1("Votre prénom, pour que le commerçant sache qui vient.");
        if (!bon(tel)) return etape1("Un numéro de portable : 10 chiffres, qui commence par 06 ou 07.");
        if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(memo.email)) return etape1("Une adresse e-mail valide, pour recevoir la confirmation.");
        if (lire().indexOf(tel) >= 0) return fini({ prenom: prenom, tel: beau(tel), email: memo.email, offres: memo.offres, deja: true });
        envoyer(); etape2("");
      });
      try { I[prenom ? 1 : 0].focus({ preventScroll: true }) } catch (e) {}
    }
    function envoyer() { code = String(1000 + Math.floor(Math.random() * 9000)) }
    function etape2(err, info) {
      Z.innerHTML = '<div class="vt"><p class="vt-t">Code envoyé au ' + h(beau(tel)) + '</p>' +
        '<p class="vt-ex">Exemple : aucun SMS ne part. Votre code est <b>' + code + '</b>.</p>' +
        '<label class="vt-c"><span>Code à 4 chiffres</span><input class="vt-code" inputmode="numeric" maxlength="4" autocomplete="one-time-code"></label>' +
        '<p class="vt-err" role="alert">' + h(err || "") + '</p><p class="vt-info" aria-live="polite">' + h(info || "") + '</p>' +
        '<button type="button" class="vt-go">' + h(o.bouton || "Valider et confirmer") + '</button>' +
        '<div class="vt-liens"><button type="button" class="vt-re">Renvoyer le code</button><button type="button" class="vt-ch">Changer de numéro</button></div></div>';
      var C = Z.querySelector(".vt-code");
      Z.querySelector(".vt-go").addEventListener("click", function () {
        var v = C.value.trim();
        if (!/^\d{4}$/.test(v)) return etape2("Le code fait 4 chiffres.");
        if (v !== code) return etape2("Ce n'est pas le bon code. Vérifiez le SMS, ou renvoyez le code.");
        noter(tel); fini({ prenom: prenom, tel: beau(tel), email: memo.email, offres: memo.offres, deja: false });
      });
      Z.querySelector(".vt-re").addEventListener("click", function () { envoyer(); etape2("", "Nouveau code envoyé.") });
      Z.querySelector(".vt-ch").addEventListener("click", function () { etape1("") });
      try { C.focus({ preventScroll: true }) } catch (e) {}
    }
    /* coordonnées déjà saisies ailleurs (ex. formulaire de devis) : on passe directement au code */
    if (o.pre) { prenom = o.pre.prenom || ""; tel = net(o.pre.tel); memo.prenom = prenom; memo.tel = o.pre.tel || ""; memo.email = o.pre.email || ""; memo.offres = !!o.pre.offres;
      if (prenom && bon(tel) && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(memo.email)) {
        if (lire().indexOf(tel) >= 0) return fini({ prenom: prenom, tel: beau(tel), email: memo.email, offres: memo.offres, deja: true });
        envoyer(); return etape2("") } }
    etape1("");
  }
  /* écran de confirmation, comme dans la vraie vie : numéro, statut, aperçu du SMS et de l'e-mail reçus, modifier/annuler, rappel la veille */
  function confirmation(Z, o, fermer) {
    var u = o.u || {};
    Z.innerHTML = '<div class="vt vt-fin"><p class="vt-t">' + h(o.titreNum || "Demande n°") + ' ' + h(o.numero) + '</p>' +
      '<p class="vt-statut"><i></i>' + h(o.statut || "Envoyée, en attente de confirmation") + '</p>' +
      '<p class="vt-s">' + h(o.resume || "") + '</p>' +
      '<ul class="vt-mentions"><li>Confirmation envoyée par SMS au ' + h(u.tel || "") + ' et par e-mail à ' + h(u.email || "") + '.</li>' +
      '<li>Rappel par SMS la veille.</li><li>Un lien dans le SMS et l’e-mail pour modifier ou annuler, jusqu’à ' + h(o.annulation || "la veille") + '.</li></ul>' +
      '<div class="vt-apercus"><button type="button" class="vt-ap" aria-expanded="false" data-k="sms">Voir le SMS reçu</button><button type="button" class="vt-ap" aria-expanded="false" data-k="mail">Voir l’e-mail reçu</button></div>' +
      '<div class="vt-sms" hidden><p class="vt-de">' + h(o.commerce || "") + '</p><p></p></div>' +
      '<div class="vt-mail" hidden><p class="vt-de">De : ' + h(o.commerce || "") + ' · Objet : votre demande n° ' + h(o.numero) + '</p><p class="vt-mail-c"></p></div>' +
      '<p class="vt-demo">Exemple : aucun SMS ni e-mail n’est envoyé.</p><button type="button" class="vt-go vt-ok">C’est noté</button></div>';
    Z.querySelector(".vt-sms p:last-child").textContent = (o.commerce ? o.commerce + " : " : "") + "Bonjour " + (u.prenom || "") + ", demande n° " + o.numero + " bien reçue. " + (o.court || "") + " Modifier ou annuler : lien.exemple/" + o.numero;
    Z.querySelector(".vt-mail-c").textContent = "Bonjour " + (u.prenom || "") + ",\n\nNous avons bien reçu votre demande n° " + o.numero + ".\n" + (o.resume || "") + "\n\nVous recevrez un rappel la veille. Pour modifier ou annuler, utilisez le lien de ce message.\n\n" + (o.commerce || "");
    Z.querySelectorAll(".vt-ap").forEach(function (b) { b.addEventListener("click", function () { var p = Z.querySelector(".vt-" + b.getAttribute("data-k")), o2 = p.hidden; p.hidden = !o2; b.setAttribute("aria-expanded", o2 ? "true" : "false") }) });
    Z.querySelector(".vt-ok").addEventListener("click", fermer);
  }
  /* numéro de demande lisible : préfixe + 4 chiffres */
  function numero(p) { return (p || "N") + "-" + String(1000 + Math.floor(Math.random() * 9000)) }
  w.VerifTel = { demander: demander, numero: numero, confirmation: confirmation };
})(window);

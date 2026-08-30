/* =========================================================================
   ACCI — Jeu d'icônes de l'administration
   -------------------------------------------------------------------------
   Repris du site public (build.py) et complété pour les besoins du CRM, afin
   que les deux partagent la même identité visuelle. Des émojis tenaient ce
   rôle auparavant : leur dessin varie d'un système à l'autre, leur graisse ne
   s'accorde ni au texte ni entre eux, et ils ne peuvent pas prendre la couleur
   du contexte. Ces tracés-là suivent tous la même grille de 24 et héritent de
   currentColor.
   ========================================================================= */
(function(){
  "use strict";
  var P={
    "alert":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M12 7.6v5\"/><circle cx=\"12\" cy=\"16\" r=\"1\"/>",
    "arrow":"<path d=\"M4.6 12h14\"/><path d=\"M13.2 6.6L18.6 12l-5.4 5.4\"/>",
    "back":"<path d=\"M19 12H5M11 6l-6 6 6 6\"/>",
    "badge":"<circle cx=\"12\" cy=\"9\" r=\"5.4\"/><path d=\"M8.9 13.4 8 20.8 12 17.5l4 3.3-.9-7.4\"/>",
    "bell":"<path d=\"M18 15V10a6 6 0 0 0-12 0v5l-2 3h16l-2-3z\"/><path d=\"M10 21h4\"/>",
    "book":"<path d=\"M12 7.6C10.2 6.1 7.6 5.4 4.4 5.4v12.2c3.2 0 5.8 .6 7.6 1.8 1.8-1.2 4.4-1.8 7.6-1.8V5.4c-3.2 0-5.8 .7-7.6 2.2z\"/><path d=\"M12 7.6v11.8\"/>",
    "bullhorn":"<path d=\"M4 12.6V11a1.6 1.6 0 0 1 1.6-1.6h2.8l6.8-3.8v12.8L8.4 14.6H5.6A1.6 1.6 0 0 1 4 12.6z\"/><path d=\"M16.8 9.8a3.6 3.6 0 0 1 0 4.4\"/><path d=\"M19.4 7.8a6.6 6.6 0 0 1 0 8.4\"/>",
    "calendar":"<rect x=\"3.8\" y=\"5.6\" width=\"16.4\" height=\"14.6\" rx=\"2.2\"/><path d=\"M3.8 9.8h16.4\"/><path d=\"M8.4 3.8v3.6M15.6 3.8v3.6\"/>",
    "camera":"<rect x=\"3.4\" y=\"7\" width=\"17.2\" height=\"12.6\" rx=\"2.4\"/><circle cx=\"12\" cy=\"13.3\" r=\"3.4\"/><path d=\"M8.4 7l1.4-2.2h4.4L15.6 7\"/>",
    "chart":"<path d=\"M3.8 19.6h16.4\"/><path d=\"M6.6 19.6v-6.6M12 19.6v-10.2M17.4 19.6v-13.8\"/>",
    "chat":"<path d=\"M4 6.2a1.6 1.6 0 0 1 1.6-1.6h12.8A1.6 1.6 0 0 1 20 6.2v8.4a1.6 1.6 0 0 1-1.6 1.6H9.6L5.4 20v-3.8a1.6 1.6 0 0 1-1.4-1.6z\"/><path d=\"M8 9.2h8M8 12.2h5\"/>",
    "check":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M8.4 12.2l2.6 2.6 4.6-5\"/>",
    "child":"<circle cx=\"8\" cy=\"6.2\" r=\"2.4\"/><path d=\"M4.6 20.2v-5a3.4 3.4 0 0 1 6.8 0v5\"/><circle cx=\"16.8\" cy=\"10.4\" r=\"1.9\"/><path d=\"M14.2 20.2v-3.6a2.6 2.6 0 0 1 5.2 0v3.6\"/>",
    "clip":"<path d=\"M18.5 8.5v5.3a6.5 6.5 0 0 1-13 0V7a3.25 3.25 0 0 1 6.5 0v9\"/>",
    "clock":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M12 7.4V12l3.2 1.9\"/>",
    "close":"<path d=\"M6 6l12 12M18 6L6 18\"/>",
    "cog":"<path d=\"M9.5 6.11L9.88 3.51L14.12 3.51L14.5 6.11A6.4 6.4 0 0 1 15.85 6.89L18.29 5.92L20.41 9.59L18.35 11.22A6.4 6.4 0 0 1 18.35 12.78L20.41 14.41L18.29 18.08L15.85 17.11A6.4 6.4 0 0 1 14.5 17.89L14.12 20.49L9.88 20.49L9.5 17.89A6.4 6.4 0 0 1 8.15 17.11L5.71 18.08L3.59 14.41L5.65 12.78A6.4 6.4 0 0 1 5.65 11.22L3.59 9.59L5.71 5.92L8.15 6.89A6.4 6.4 0 0 1 9.5 6.11Z\"/><circle cx=\"12\" cy=\"12\" r=\"3.2\"/>",
    "compass":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M15.8 8.2l-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4z\"/><circle cx=\"12\" cy=\"12\" r=\".9\"/>",
    "contacts":"<rect x=\"4.4\" y=\"3.6\" width=\"15.2\" height=\"16.8\" rx=\"2.4\"/><circle cx=\"12\" cy=\"9\" r=\"2.7\"/><path d=\"M7.6 17.8c0-2.4 1.9-4 4.4-4s4.4 1.6 4.4 4\"/>",
    "copyright":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M14.6 9.6a3.4 3.4 0 1 0 0 4.8\"/>",
    "doc":"<path d=\"M6.6 3.4h7L18.4 8v12.6H6.6z\"/><path d=\"M13.4 3.4V8h5\"/><path d=\"M9.4 13h5.6M9.4 16.2h5.6\"/>",
    "download":"<path d=\"M12 3.8v10.4\"/><path d=\"M8.2 10.6l3.8 3.8 3.8-3.8\"/><path d=\"M4.4 18.6h15.2\"/>",
    "eye":"<path d=\"M3.2 12s3.5-5.4 8.8-5.4S20.8 12 20.8 12s-3.5 5.4-8.8 5.4S3.2 12 3.2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/>",
    "fact":"<path d=\"M12 3.4l7 2.7v5.1c0 4-2.8 7.2-7 8.4-4.2-1.2-7-4.4-7-8.4V6.1l7-2.7z\"/><path d=\"M9.2 11.9l2.1 2.1 3.6-3.9\"/>",
    "filter":"<path d=\"M4 6h16M7 12h10M10 18h4\"/>",
    "flag":"<path d=\"M5.6 20.4V4.2\"/><path d=\"M5.6 4.6h11.8l-2.2 3.9 2.2 3.9H5.6\"/>",
    "folder":"<path d=\"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z\"/>",
    "funnel":"<path d=\"M3 5h18l-7 8v6l-4 2v-8L3 5z\"/>",
    "gift":"<path d=\"M4.6 11.4v7.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-7.2\"/><rect x=\"3.2\" y=\"7.8\" width=\"17.6\" height=\"3.6\" rx=\"1.2\"/><path d=\"M12 7.8v12.4\"/><path d=\"M12 7.8H8.8a2 2 0 1 1 2-2c.8.8 1.2 2 1.2 2zM12 7.8h3.2a2 2 0 1 0-2-2c-.8.8-1.2 2-1.2 2z\"/>",
    "globe":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M3.6 12h16.8\"/><path d=\"M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2z\"/>",
    "graduation":"<path d=\"M3.2 8.6L12 4.6l8.8 4-8.8 4-8.8-4z\"/><path d=\"M6.6 10.6v4.4c0 1.5 2.4 2.7 5.4 2.7s5.4-1.2 5.4-2.7v-4.4\"/><path d=\"M20.8 8.8v4.4\"/><circle cx=\"20.8\" cy=\"14.4\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>",
    "grid":"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>",
    /* Deux anneaux enlacés, et non une poignée de main : celle-ci demande quatre
       traits presque horizontaux qui se referment en ruban dès 20 px, la taille
       employée dans la barre latérale. Voir la note de build.py. */
    "handshake":"<circle cx=\"9\" cy=\"12\" r=\"5.8\"/><circle cx=\"15\" cy=\"12\" r=\"5.8\"/>",
    "heart":"<path d=\"M12 20.2C7 17.4 3.6 14 3.6 10.4A4 4 0 0 1 12 8a4 4 0 0 1 8.4 2.4c0 3.6-3.4 7-8.4 9.8z\"/>",
    "image":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"8.5\" cy=\"10\" r=\"1.5\"/><path d=\"M21 16l-5-5-9 8\"/>",
    "inbox":"<path d=\"M3 13l2.5-7A2 2 0 0 1 7.4 5h9.2a2 2 0 0 1 1.9 1L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z\"/><path d=\"M3 13h5l1 2h6l1-2h5\"/>",
    "invoice":"<path d=\"M5.8 4.6h12.4v15.8l-3.1-2.6-3.1 2.6-3.1-2.6-3.1 2.6z\"/><path d=\"M8.8 9.4h6.4M8.8 13.2h4.2\"/>",
    "key":"<circle cx=\"8.2\" cy=\"12\" r=\"3.7\"/><path d=\"M11.9 12H20\"/><path d=\"M17.4 12v2.8\"/><path d=\"M20 12v2\"/>",
    "lightbulb":"<path d=\"M12 3.6a5.6 5.6 0 0 0-3.4 10.1c.7.6 1 1.4 1 2.3h4.8c0-.9.3-1.7 1-2.3A5.6 5.6 0 0 0 12 3.6z\"/><path d=\"M9.8 18.4h4.4M10.6 20.6h2.8\"/>",
    "lock":"<rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"9.5\" rx=\"2.2\"/><path d=\"M8 10.5V7.8a4 4 0 0 1 8 0v2.7\"/><circle cx=\"12\" cy=\"15.2\" r=\"1.1\"/>",
    "logout":"<path d=\"M13 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4\"/><path d=\"M9 16l-4-4 4-4M5 12h10\"/>",
    "mail":"<rect x=\"3.4\" y=\"5.6\" width=\"17.2\" height=\"12.8\" rx=\"2.2\"/><path d=\"M3.8 8.2l7.3 4.6a1.7 1.7 0 0 0 1.8 0l7.3-4.6\"/>",
    "map":"<path d=\"M12 20.6s-6.2-5.2-6.2-9.6a6.2 6.2 0 1 1 12.4 0c0 4.4-6.2 9.6-6.2 9.6z\"/><circle cx=\"12\" cy=\"11\" r=\"2.3\"/>",
    "megaphone":"<path d=\"M4.4 10.4v3.2a1.4 1.4 0 0 0 1.4 1.4h1.6l8.4 4.4V4.6L7.4 9H5.8a1.4 1.4 0 0 0-1.4 1.4z\"/><path d=\"M7.4 15v4.4h2.6V16.4\"/><path d=\"M18.6 9.4a3.6 3.6 0 0 1 0 5.2\"/>",
    "menu":"<path d=\"M4 7h16M4 12h16M4 17h16\"/>",
    "money":"<rect x=\"3.4\" y=\"6.4\" width=\"17.2\" height=\"11.2\" rx=\"2.2\"/><circle cx=\"12\" cy=\"12\" r=\"2.8\"/><path d=\"M6.6 9.6v4.8M17.4 9.6v4.8\"/>",
    "network":"<circle cx=\"12\" cy=\"5.8\" r=\"2.2\"/><circle cx=\"5.6\" cy=\"18\" r=\"2.2\"/><circle cx=\"18.4\" cy=\"18\" r=\"2.2\"/><path d=\"M12 8v4.4M7.26 16.55L12 12.4L16.74 16.55\"/>",
    "palette":"<path d=\"M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z\"/><circle cx=\"7.5\" cy=\"11\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"11\" cy=\"7.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15.5\" cy=\"8.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>",
    "pencil":"<path d=\"M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4z\"/><path d=\"M14.5 5.5l4 4\"/>",
    "phone":"<path d=\"M5.4 4.6h3.4l1.8 4.4-2.2 1.4a10.6 10.6 0 0 0 5.2 5.2l1.4-2.2 4.4 1.8v3.4a1.8 1.8 0 0 1-1.9 1.8A15.4 15.4 0 0 1 3.6 6.5a1.8 1.8 0 0 1 1.8-1.9z\"/>",
    "play":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M10.2 8.8l5.4 3.2-5.4 3.2V8.8z\"/>",
    "plus":"<path d=\"M12 5v14M5 12h14\"/>",
    "quote":"<path d=\"M9.6 6.8C7 8 5.6 10 5.6 12.6v4.6h4.8v-5H8.2c0-1.6.5-2.8 1.4-3.6z\"/><path d=\"M18 6.8c-2.6 1.2-4 3.2-4 5.8v4.6h4.8v-5h-2.2c0-1.6.5-2.8 1.4-3.6z\"/>",
    "scale":"<path d=\"M12 5v14.6\"/><path d=\"M7.6 19.6h8.8\"/><path d=\"M5.4 8h13.2\"/><circle cx=\"12\" cy=\"6.6\" r=\"1.4\"/><path d=\"M5.4 8L3.2 13.4h4.4zM18.6 8l2.2 5.4h-4.4z\"/>",
    "search":"<circle cx=\"10.8\" cy=\"10.8\" r=\"6.4\"/><path d=\"M15.4 15.4l5 5\"/>",
    "send":"<path d=\"M20.6 4.4L3.6 11.2l6.6 2.4 2.4 6.6 8-15.8z\"/><path d=\"M10.2 13.6l3.6-3.6\"/>",
    "shield":"<path d=\"M12 3.5l7 2.8v5c0 4.1-2.8 7.3-7 8.4-4.2-1.1-7-4.3-7-8.4v-5l7-2.8z\"/>",
    "spark":"<path d=\"M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z\"/>",
    "sparkle":"<path d=\"M11 3.8l1.6 4.6 4.6 1.6-4.6 1.6-1.6 4.6-1.6-4.6-4.6-1.6 4.6-1.6 1.6-4.6z\"/><path d=\"M17.4 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z\"/>",
    "star":"<path d=\"M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8z\"/>",
    "swap":"<path d=\"M7 4v14M7 4L4 7M7 4l3 3\"/><path d=\"M17 20V6M17 20l3-3M17 20l-3-3\"/>",
    "team":"<circle cx=\"12\" cy=\"8\" r=\"2.7\"/><path d=\"M7.6 20.4a4.4 4.4 0 0 1 8.8 0\"/><circle cx=\"5\" cy=\"12.2\" r=\"2\"/><circle cx=\"19\" cy=\"12.2\" r=\"2\"/><path d=\"M3 20.4a3.6 3.6 0 0 1 3.6-3.6M21 20.4a3.6 3.6 0 0 0-3.6-3.6\"/>",
    "ticket":"<path d=\"M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5V7z\"/><path d=\"M12 7.4v1.8M12 10.2v1.8M12 13v1.8\"/>",
    "trash":"<path d=\"M4 7h16\"/><path d=\"M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\"/><path d=\"M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13\"/><path d=\"M10 11v6M14 11v6\"/>",
    "trend":"<path d=\"M4 16.6l5.6-5.6 3.4 3.4 7-7\"/><path d=\"M14.8 7.4h5.2v5.2\"/>",
    "upload":"<path d=\"M12 20V8M8 12l4-4 4 4\"/><path d=\"M4 4h16\"/>",
    "user":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8\"/>",
    "users":"<circle cx=\"9.4\" cy=\"8.4\" r=\"3.1\"/><path d=\"M3.6 19.8c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4\"/><path d=\"M16.4 6.2a3.1 3.1 0 0 1 0 5.9\"/><path d=\"M20.4 19.8c0-2.6-1.4-4.4-3.6-5.1\"/>",
    "warning":"<path d=\"M12 4.2l8.2 14.2a1.4 1.4 0 0 1-1.2 2.1H5a1.4 1.4 0 0 1-1.2-2.1L12 4.2z\"/><path d=\"M12 9.6v4.2\"/><circle cx=\"12\" cy=\"17\" r=\"1\"/>",
    "x-circle":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2\"/>",
  };
  /* Rendu inline : l'icône hérite de la couleur du texte et s'aligne dessus. */
  window.ACCI_ICON=function(name,size,cls){
    var d=P[name];
    if(!d)return'';
    var s=size||18;
    return '<svg class="ai'+(cls?" "+cls:"")+'" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" '+
           'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '+
           'stroke-linejoin="round" aria-hidden="true" focusable="false">'+d+'</svg>';
  };
  window.ACCI_ICON.has=function(n){return !!P[n];};
})();

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
    "badge":"<circle cx=\"12\" cy=\"9\" r=\"5.5\"/><path d=\"M8.5 13.5L7 22l5-2.5L17 22l-1.5-8.5\"/>",
    "bell":"<path d=\"M18 15V10a6 6 0 0 0-12 0v5l-2 3h16l-2-3z\"/><path d=\"M10 21h4\"/>",
    "book":"<path d=\"M5 5.2a2 2 0 0 1 2-2h11.2v15.6H7a2 2 0 0 0-2 2V5.2z\"/><path d=\"M18.2 18.8H7\"/>",
    "bullhorn":"<path d=\"M4 12.6V11a1.6 1.6 0 0 1 1.6-1.6h2.8l6.8-3.8v12.8L8.4 14.6H5.6A1.6 1.6 0 0 1 4 13z\"/><path d=\"M18 9.6a4 4 0 0 1 0 4.8\"/><path d=\"M20.4 7.4a7.2 7.2 0 0 1 0 9.2\"/>",
    "calendar":"<rect x=\"3.8\" y=\"5.6\" width=\"16.4\" height=\"14.6\" rx=\"2.2\"/><path d=\"M3.8 9.8h16.4\"/><path d=\"M8.4 3.8v3.6M15.6 3.8v3.6\"/>",
    "camera":"<rect x=\"3.4\" y=\"7\" width=\"17.2\" height=\"12.6\" rx=\"2.4\"/><circle cx=\"12\" cy=\"13.3\" r=\"3.4\"/><path d=\"M8.4 7l1.4-2.2h4.4L15.6 7\"/>",
    "chart":"<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>",
    "chat":"<path d=\"M4 6.2a1.6 1.6 0 0 1 1.6-1.6h12.8A1.6 1.6 0 0 1 20 6.2v8.4a1.6 1.6 0 0 1-1.6 1.6H9.6L5.4 20v-3.8a1.6 1.6 0 0 1-1.4-1.6z\"/><path d=\"M8 9.2h8M8 12.2h5\"/>",
    "check":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M8.4 12.2l2.6 2.6 4.6-5\"/>",
    "child":"<circle cx=\"8\" cy=\"6.2\" r=\"2.4\"/><path d=\"M4.6 20.2v-5a3.4 3.4 0 0 1 6.8 0v5\"/><circle cx=\"16.8\" cy=\"10.4\" r=\"1.9\"/><path d=\"M14.2 20.2v-3.6a2.6 2.6 0 0 1 5.2 0v3.6\"/>",
    "clip":"<path d=\"M20 11.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8\"/>",
    "clock":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M12 7.4V12l3.2 1.9\"/>",
    "close":"<path d=\"M6 6l12 12M18 6L6 18\"/>",
    "cog":"<circle cx=\"12\" cy=\"12\" r=\"3.1\"/><path d=\"M12 2.6l1.4 2.1 2.5-.5.4 2.5 2.3 1-1.1 2.3 1.1 2.3-2.3 1-.4 2.5-2.5-.5L12 21.4l-1.4-2.1-2.5.5-.4-2.5-2.3-1 1.1-2.3-1.1-2.3 2.3-1 .4-2.5 2.5.5L12 2.6z\"/>",
    "compass":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M15.8 8.2l-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4z\"/><circle cx=\"12\" cy=\"12\" r=\".9\"/>",
    "contacts":"<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/><path d=\"M8 17c0-2 1.8-3.2 4-3.2S16 15 16 17\"/><path d=\"M2 8h2M2 12h2M2 16h2\"/>",
    "copyright":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M14.6 9.6a3.4 3.4 0 1 0 0 4.8\"/>",
    "doc":"<path d=\"M6.6 3.4h7L18.4 8v12.6H6.6z\"/><path d=\"M13.4 3.4V8h5\"/><path d=\"M9.4 13h5.6M9.4 16.2h5.6\"/>",
    "download":"<path d=\"M12 3.8v10.4\"/><path d=\"M8.2 10.6l3.8 3.8 3.8-3.8\"/><path d=\"M4.4 18.6h15.2\"/>",
    "eye":"<path d=\"M2.6 12S6.2 6.4 12 6.4 21.4 12 21.4 12 17.8 17.6 12 17.6 2.6 12 2.6 12z\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/>",
    "fact":"<path d=\"M12 3.4l7 2.7v5.1c0 4-2.8 7.2-7 8.4-4.2-1.2-7-4.4-7-8.4V6.1l7-2.7z\"/><path d=\"M9.2 11.9l2.1 2.1 3.6-3.9\"/>",
    "filter":"<path d=\"M4 6h16M7 12h10M10 18h4\"/>",
    "flag":"<path d=\"M5.6 20.4V4.2\"/><path d=\"M5.6 4.6h11.8l-2.2 3.9 2.2 3.9H5.6\"/>",
    "folder":"<path d=\"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z\"/>",
    "funnel":"<path d=\"M3 5h18l-7 8v6l-4 2v-8L3 5z\"/>",
    "gift":"<path d=\"M4.6 11.4v7.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-7.2\"/><rect x=\"3.2\" y=\"7.8\" width=\"17.6\" height=\"3.6\" rx=\"1.2\"/><path d=\"M12 7.8v12.4\"/><path d=\"M12 7.8H8.8a2 2 0 1 1 2-2c.8.8 1.2 2 1.2 2zM12 7.8h3.2a2 2 0 1 0-2-2c-.8.8-1.2 2-1.2 2z\"/>",
    "globe":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M3.6 12h16.8\"/><path d=\"M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2z\"/>",
    "graduation":"<path d=\"M2.8 8.6L12 4.4l9.2 4.2L12 12.8 2.8 8.6z\"/><path d=\"M6.4 10.6v4.6c0 1.5 2.5 2.8 5.6 2.8s5.6-1.3 5.6-2.8v-4.6\"/><path d=\"M20.4 9v4.6\"/>",
    "grid":"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>",
    "handshake":"<path d=\"M2.8 10.6l3-3 3.4 1.4\"/><path d=\"M21.2 10.6l-3-3-3.4 1.4\"/><path d=\"M9.2 9l-3 3a1.7 1.7 0 0 0 2.4 2.4l1.2-1.2 3 3a1.6 1.6 0 0 0 2.3-2.3\"/><path d=\"M14.8 9l3 3a1.7 1.7 0 0 1-2.4 2.4\"/><path d=\"M12.8 12.9l1.6 1.6\"/>",
    "heart":"<path d=\"M12 20.2C7 17.4 3.6 14 3.6 10.4A4 4 0 0 1 12 8a4 4 0 0 1 8.4 2.4c0 3.6-3.4 7-8.4 9.8z\"/>",
    "image":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><circle cx=\"8.5\" cy=\"10\" r=\"1.5\"/><path d=\"M21 16l-5-5-9 8\"/>",
    "inbox":"<path d=\"M3 13l2.5-7A2 2 0 0 1 7.4 5h9.2a2 2 0 0 1 1.9 1L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z\"/><path d=\"M3 13h5l1 2h6l1-2h5\"/>",
    "invoice":"<path d=\"M6 3h9l4 4v14H6V3z\"/><path d=\"M15 3v4h4\"/><path d=\"M9 12h7M9 16h5\"/>",
    "key":"<circle cx=\"8.2\" cy=\"12\" r=\"3.7\"/><path d=\"M11.9 12H20\"/><path d=\"M17.4 12v2.8\"/><path d=\"M20 12v2\"/>",
    "lightbulb":"<path d=\"M12 3.6a5.6 5.6 0 0 0-3.4 10.1c.7.6 1 1.4 1 2.3h4.8c0-.9.3-1.7 1-2.3A5.6 5.6 0 0 0 12 3.6z\"/><path d=\"M9.8 18.4h4.4M10.6 20.6h2.8\"/>",
    "lock":"<rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"9.5\" rx=\"2.2\"/><path d=\"M8 10.5V7.8a4 4 0 0 1 8 0v2.7\"/><circle cx=\"12\" cy=\"15.2\" r=\"1.1\"/>",
    "logout":"<path d=\"M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4\"/><path d=\"M10 16l-4-4 4-4M6 12h10\"/>",
    "mail":"<rect x=\"3.4\" y=\"5.6\" width=\"17.2\" height=\"12.8\" rx=\"2.2\"/><path d=\"M3.8 8.2l7.3 4.6a1.7 1.7 0 0 0 1.8 0l7.3-4.6\"/>",
    "map":"<path d=\"M12 20.6s-6.2-5.2-6.2-9.6a6.2 6.2 0 1 1 12.4 0c0 4.4-6.2 9.6-6.2 9.6z\"/><circle cx=\"12\" cy=\"11\" r=\"2.3\"/>",
    "megaphone":"<path d=\"M4.4 10.4v3.2a1.4 1.4 0 0 0 1.4 1.4h1.6l8.4 4.4V4.6L7.4 9H5.8a1.4 1.4 0 0 0-1.4 1.4z\"/><path d=\"M7.4 15v4.4h2.6V16.4\"/><path d=\"M18.6 9.4a3.6 3.6 0 0 1 0 5.2\"/>",
    "menu":"<path d=\"M4 7h16M4 12h16M4 17h16\"/>",
    "money":"<rect x=\"3.4\" y=\"6.4\" width=\"17.2\" height=\"11.2\" rx=\"2.2\"/><circle cx=\"12\" cy=\"12\" r=\"2.8\"/><path d=\"M6.6 9.6v4.8M17.4 9.6v4.8\"/>",
    "network":"<circle cx=\"12\" cy=\"5.4\" r=\"2.2\"/><circle cx=\"5.4\" cy=\"18\" r=\"2.2\"/><circle cx=\"18.6\" cy=\"18\" r=\"2.2\"/><path d=\"M12 7.6v3.6M10.4 12.6L7 16.4M13.6 12.6l3.4 3.8\"/>",
    "palette":"<path d=\"M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z\"/><circle cx=\"7.5\" cy=\"11\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"11\" cy=\"7.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15.5\" cy=\"8.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>",
    "pencil":"<path d=\"M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4z\"/><path d=\"M14.5 5.5l4 4\"/>",
    "phone":"<path d=\"M5.4 4.6h3.4l1.8 4.4-2.2 1.4a10.6 10.6 0 0 0 5.2 5.2l1.4-2.2 4.4 1.8v3.4a1.8 1.8 0 0 1-1.9 1.8A15.4 15.4 0 0 1 3.6 6.5a1.8 1.8 0 0 1 1.8-1.9z\"/>",
    "play":"<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><path d=\"M10.2 8.8l5.4 3.2-5.4 3.2V8.8z\"/>",
    "plus":"<path d=\"M12 5v14M5 12h14\"/>",
    "quote":"<path d=\"M9.6 6.8C7 8 5.6 10 5.6 12.6v4.6h4.8v-5H8.2c0-1.6.5-2.8 1.4-3.6z\"/><path d=\"M18 6.8c-2.6 1.2-4 3.2-4 5.8v4.6h4.8v-5h-2.2c0-1.6.5-2.8 1.4-3.6z\"/>",
    "scale":"<path d=\"M12 4.6v15\"/><path d=\"M7.4 19.6h9.2\"/><path d=\"M5 7.8h14\"/><circle cx=\"12\" cy=\"6.4\" r=\"1.5\"/><path d=\"M5 7.8L2.6 13.4h4.8L5 7.8z\"/><path d=\"M19 7.8l-2.4 5.6h4.8L19 7.8z\"/>",
    "search":"<circle cx=\"10.8\" cy=\"10.8\" r=\"6.4\"/><path d=\"M15.4 15.4l5 5\"/>",
    "send":"<path d=\"M20.6 4.4L3.6 11.2l6.6 2.4 2.4 6.6 8-15.8z\"/><path d=\"M10.2 13.6l3.6-3.6\"/>",
    "shield":"<path d=\"M12 3.5l7 2.8v5c0 4.1-2.8 7.3-7 8.4-4.2-1.1-7-4.3-7-8.4v-5l7-2.8z\"/>",
    "spark":"<path d=\"M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z\"/>",
    "sparkle":"<path d=\"M12 3.6l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7 1.7-5z\"/><path d=\"M18.6 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z\"/>",
    "star":"<path d=\"M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8z\"/>",
    "swap":"<path d=\"M7 4v14M7 4L4 7M7 4l3 3\"/><path d=\"M17 20V6M17 20l3-3M17 20l-3-3\"/>",
    "team":"<circle cx=\"12\" cy=\"7\" r=\"3\"/><path d=\"M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6\"/><path d=\"M4.5 12.5a2.5 2.5 0 1 1 2-4.5M19.5 12.5a2.5 2.5 0 1 0-2-4.5\"/>",
    "ticket":"<path d=\"M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5V8z\"/><path d=\"M12 8v1M12 12v1M12 16v1\"/>",
    "trash":"<path d=\"M4 7h16\"/><path d=\"M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\"/><path d=\"M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13\"/><path d=\"M10 11v6M14 11v6\"/>",
    "trend":"<path d=\"M3 17l6-6 4 4 7-8\"/><path d=\"M20 7h1v1\"/>",
    "upload":"<path d=\"M12 20V8M8 12l4-4 4 4\"/><path d=\"M4 4h16\"/>",
    "user":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8\"/>",
    "users":"<circle cx=\"9.4\" cy=\"8.4\" r=\"3.1\"/><path d=\"M3.6 19.8c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4\"/><path d=\"M16.4 6.2a3.1 3.1 0 0 1 0 5.9\"/><path d=\"M20.4 19.8c0-2.4-1.2-4.1-3.2-5\"/>",
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

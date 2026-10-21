export interface WritingSpark {
  id: string;
  category: 'Incipit' | 'Sensations' | 'Mystère' | 'Philosophie' | 'Micro-nouvelle';
  text: string;
  context: string;
}

export const WRITING_SPARKS: WritingSpark[] = [
  {
    id: '1',
    category: 'Incipit',
    text: "Il restait exactement sept minutes avant que la ville entière ne s'éteigne.",
    context: "Une amorce de suspense immédiat."
  },
  {
    id: '2',
    category: 'Sensations',
    text: "L'odeur du café tiède se mêlait à la buée sur la vitre du premier train de l'aube.",
    context: "Une atmosphère douce et contemplative."
  },
  {
    id: '3',
    category: 'Mystère',
    text: "Dans le tiroir secret du vieux secrétaire en noyer, une clé en laiton sans serrure correspondante attendait depuis quarante ans.",
    context: "Une quête d'héritage et de secrets enfouis."
  },
  {
    id: '4',
    category: 'Philosophie',
    text: "Que reste-t-il d'un souvenir quand plus personne n'est là pour le contredire ?",
    context: "Une méditation sur la mémoire et le temps."
  },
  {
    id: '5',
    category: 'Micro-nouvelle',
    text: "Elle referma le carnet. Toutes les pages étaient blanches, sauf la dernière, qui disait simplement : 'Recommence.'",
    context: "Une boucle poétique sur le recommencement."
  },
  {
    id: '6',
    category: 'Incipit',
    text: "Je n'avais jamais eu l'intention de répondre à cette lettre, jusqu'à ce que je remarque le cachet de cire noire.",
    context: "Une correspondance inattendue."
  },
  {
    id: '7',
    category: 'Sensations',
    text: "Le bruit des feuilles mortes sous les semelles avait ce craquement sec des promesses tenues trop tard.",
    context: "Un tableau d'automne mélancolique."
  },
  {
    id: '8',
    category: 'Mystère',
    text: "Sur l'île où nous avions grandi, la marée basse révélait parfois les fondations d'un village que nul livre d'histoire ne mentionnait.",
    context: "Un secret insulaire."
  },
  {
    id: '9',
    category: 'Philosophie',
    text: "La page blanche n'est pas un vide effrayant ; c'est un silence attentif qui écoute votre première phrase.",
    context: "L'éloge du silence et du commencement."
  },
  {
    id: '10',
    category: 'Micro-nouvelle',
    text: "À minuit précis, l'horloger arrêta le balancier. Pour la première fois depuis un siècle, le salon connut le présent absolu.",
    context: "Une parenthèse hors du temps."
  }
];

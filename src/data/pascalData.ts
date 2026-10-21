export interface Quote {
  id: string;
  quote: string;
  source: string;
  category: 'condition' | 'coeur' | 'divertissement' | 'infini' | 'connaissance';
  categoryLabel: string;
  fragment: string;
  context: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  domain: 'Mathématiques' | 'Invention' | 'Physique' | 'Philosophie' | 'Société';
  description: string;
}

export const PASCAL_QUOTES: Quote[] = [
  {
    id: 'roseau',
    quote: "L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant. Il ne faut pas que l'univers entier s'arme pour l'écraser : une vapeur, une goutte d'eau suffit pour le tuer. Mais, quand l'univers l'écraserait, l'homme serait encore plus noble que ce qui le tue, puisqu'il sait qu'il meurt, et l'avantage que l'univers a sur lui, l'univers n'en sait rien.",
    source: "Pensées",
    fragment: "Brunschvicg 347 · Lafuma 200",
    category: 'condition',
    categoryLabel: "Condition humaine",
    context: "Méditation sur la grandeur et la fragilité de la conscience humaine face à la mécanique muette du cosmos."
  },
  {
    id: 'coeur',
    quote: "Le cœur a ses raisons que la raison ne connaît point ; on le sait en mille choses.",
    source: "Pensées",
    fragment: "Brunschvicg 277 · Lafuma 423",
    category: 'coeur',
    categoryLabel: "Cœur & Raison",
    context: "Distinction fondamentale chez Pascal entre la géométrie discursive et l'intuition vive de l'esprit de finesse."
  },
  {
    id: 'silence',
    quote: "Le silence éternel de ces espaces infinis m'effraie.",
    source: "Pensées",
    fragment: "Brunschvicg 206 · Lafuma 201",
    category: 'infini',
    categoryLabel: "Les Deux Infinis",
    context: "Le vertige ontologique de l'homme suspendu entre le néant microscopique et l'immensité de l'univers astronomique."
  },
  {
    id: 'divertissement',
    quote: "Tout le malheur des hommes vient d'une seule chose, qui est de ne savoir pas demeurer en repos, dans une chambre.",
    source: "Pensées",
    fragment: "Brunschvicg 139 · Lafuma 136",
    category: 'divertissement',
    categoryLabel: "Le Divertissement",
    context: "Analyse critique de la fuite de soi : l'agitation sociale et le jeu comme narcotiques pour échapper à l'angoisse de notre finitude."
  },
  {
    id: 'lettre-longue',
    quote: "Je n'ai fait celle-ci plus longue que parce que je n'ai pas eu le loisir de la faire plus courte.",
    source: "Les Provinciales",
    fragment: "Seizième Lettre (1656)",
    category: 'connaissance',
    categoryLabel: "Art & Écriture",
    context: "L'art de la concision et de la clarté rhétorique, devenue l'une des maximes les plus célèbres de la langue française."
  },
  {
    id: 'esprit-finesse',
    quote: "Dans l'esprit de géométrie, les principes sont palpables, mais éloignés de l'usage commun... Mais dans l'esprit de finesse, les principes sont dans l'usage commun et devant les yeux de tout le monde. On n'a que faire de tourner la tête, ni de se faire violence ; il ne faut qu'avoir bonne vue.",
    source: "De l'Esprit géométrique",
    fragment: "Brunschvicg 1 · Lafuma 512",
    category: 'connaissance',
    categoryLabel: "Épistémologie",
    context: "Pascal théorise la dualité entre la rigueur déductive des mathématiciens et le discernement psychologique des moralistes."
  },
  {
    id: 'deux-infinis',
    quote: "Qu'est-ce qu'un homme dans l'infini ? Un néant à l'égard de l'infini, un tout à l'égard du néant, un milieu entre rien et tout.",
    source: "Pensées",
    fragment: "Brunschvicg 72 · Lafuma 199",
    category: 'infini',
    categoryLabel: "Les Deux Infinis",
    context: "L'abîme entre le ciron infiniment petit et les nébuleuses cosmiques infiniment vastes."
  },
  {
    id: 'justice-force',
    quote: "La justice sans la force est impuissante ; la force sans la justice est tyrannique. La justice sans force est contredite, parce qu'il y a toujours des méchants. La force sans la justice est accusée. Il faut donc mettre ensemble la justice et la force.",
    source: "Pensées",
    fragment: "Brunschvicg 298 · Lafuma 103",
    category: 'condition',
    categoryLabel: "Politique & Morale",
    context: "Réflexion politique pragmatique et lucide sur l'ordre public et la légitimité des lois."
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 1623,
    title: "Naissance à Clermont-Ferrand",
    domain: "Société",
    description: "Fils d'Étienne Pascal, juriste et mathématicien passionné, et d'Antoinette Begon. Élevé dans une atmosphère intellectuelle précoce."
  },
  {
    year: 1639,
    title: "Traité des Coniques & Mystère de l'hexagramme",
    domain: "Mathématiques",
    description: "À seulement 16 ans, Blaise énonce le célèbre Théorème de Pascal sur l'hexagramme mystique inscrit dans une conique, stupéfiant René Descartes."
  },
  {
    year: 1642,
    title: "Invention de la Pascaline",
    domain: "Invention",
    description: "Pour soulager son père nommé intendant des finances à Rouen, Blaise conçoit la première machine arithmétique mécanique à retenue automatique."
  },
  {
    year: 1648,
    title: "Expérience du Puy-de-Dôme sur la Pression",
    domain: "Physique",
    description: "Pascal prouve la pesanteur de l'air et l'existence du vide en faisant mesurer la colonne de mercure à différentes altitudes par son beau-frère Florin Périer."
  },
  {
    year: 1654,
    title: "Traité du Triangle Arithmétique & Naissance des Probabilités",
    domain: "Mathématiques",
    description: "Correspondance fondatrice avec Pierre de Fermat pour résoudre le « problème des partis » (jeux de hasard), fondant la théorie moderne des probabilités."
  },
  {
    year: 1656,
    title: "Les Lettres Provinciales",
    domain: "Philosophie",
    description: "Dix-huit lettres satiriques et incisives défendant Port-Royal et le jansénisme contre la casuistique des jésuites, monument de la prose française classique."
  },
  {
    year: 1662,
    title: "Invention des Carrosses à Cinq Sols & Décès",
    domain: "Société",
    description: "Création à Paris du tout premier réseau de transports en commun urbain à horaire et trajet fixes. Blaise s'éteint le 19 août 1662, à l'âge de 39 ans."
  }
];

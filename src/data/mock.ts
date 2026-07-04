import type { Establishment, Order } from '../types';

export const QUARTIERS_PARAKOU = [
  'Albarika',
  'Banikanni',
  'Camp Adagbé',
  'Zongo',
  'Titirou',
  'Tourou',
  'Guéma',
  'Sinagourou',
  'Kpébié',
];

// Zone 1 (centre): Albarika, Banikanni, Camp Adagbé
// Zone 2 (intermédiaire): Titirou, Tourou, Zongo, Guéma
// Zone 3 (périphérie): Sinagourou, Kpébié
const ZONES: Record<string, number> = {
  Albarika: 1,
  Banikanni: 1,
  'Camp Adagbé': 1,
  Titirou: 2,
  Tourou: 2,
  Zongo: 2,
  Guéma: 2,
  Sinagourou: 3,
  Kpébié: 3,
};

export function getDeliveryFee(fromQuartier: string, toQuartier: string): number {
  const z1 = ZONES[fromQuartier] ?? 2;
  const z2 = ZONES[toQuartier] ?? 2;
  if (z1 === z2) return 300;
  if (Math.abs(z1 - z2) === 1) return 500;
  return 800;
}

const U = (id: string, w = 640, h = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

export const mockEstablishments: Establishment[] = [
  {
    id: 'e1',
    name: 'Maquis Chez Tantie Bio',
    category: 'maquis',
    quartier: 'Albarika',
    pointRepere: 'Près du Marché Arzèkè, rue des épices',
    rating: 4.8,
    reviewCount: 312,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    minOrderAmount: 1500,
    isOpen: true,
    image: U('1555396273-367ea4eb4db5'),
    description: 'Cuisine authentique du Nord-Bénin. Igname pilée, pâte, akassa et sauces maison préparées avec amour chaque jour.',
    menu: [
      {
        name: 'Plats locaux',
        items: [
          { id: 'm1', name: 'Igname pilée + sauce arachide', description: 'Sokuru maison avec sauce arachide au poulet fumé', price: 1200, image: U('1547592180-85f173990554', 400, 300), popular: true, available: true },
          { id: 'm2', name: 'Pâte (Dibu) + sauce gombo', description: 'Kobusa préparée au poisson et crevettes séchées', price: 1000, image: U('1604329760661-e71dc83f8f26', 400, 300), popular: true, available: true },
          { id: 'm3', name: 'Akassa + haricot', description: 'Mɔɔbu accompagné de haricot sauce tomate', price: 800, image: U('1551024709-8f23befc6f87', 400, 300), available: true },
          { id: 'm4', name: 'Wagashi grillé + sauce piment', description: 'Fromage peulh grillé à la braise, sauce piment maison', price: 1500, image: U('1544025162-d76538976f44', 400, 300), popular: true, available: true },
          { id: 'm5', name: 'Riz au gras + mouton', description: 'Riz cuit au jus de mouton, légumes et épices locales', price: 1800, image: U('1603360946369-dc9bb6258143', 400, 300), available: true },
        ],
      },
      {
        name: 'Boissons',
        items: [
          { id: 'm6', name: 'Jus de gingembre maison', description: 'Gingembre frais, citron, miel de Parakou', price: 400, image: U('1613478223719-2ab802602423', 400, 300), available: true },
          { id: 'm7', name: 'Eau fraîche', description: 'Bouteille 50cl', price: 200, image: U('1548839140-29a749e1cf4d', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e2',
    name: 'Le Kobourou Grill',
    category: 'restaurant',
    quartier: 'Banikanni',
    pointRepere: 'Derrière la grande mosquée de Banikanni',
    rating: 4.6,
    reviewCount: 187,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    minOrderAmount: 2000,
    isOpen: true,
    image: U('1544025162-d76538976f44'),
    description: 'Grillades et brochettes de viande fraîche. Spécialité : brochettes de bœuf marinées aux épices du Borgou.',
    menu: [
      {
        name: 'Grillades',
        items: [
          { id: 'm8', name: 'Brochettes de bœuf (5 pièces)', description: 'Bœuf mariné, épices du nord, oignons grillés', price: 1500, image: U('1529193591184-b1d58069ecdd', 400, 300), popular: true, available: true },
          { id: 'm9', name: 'Wagashi grillé + brochette', description: 'Fromage peulh et brochette de bœuf, salade d\'oignons', price: 2000, image: U('1544025162-d76538976f44', 400, 300), available: true },
          { id: 'm10', name: 'Poulet braisé (demi)', description: 'Poulet braisé au charbon, marinade piment-citron', price: 2500, image: U('1598515214211-89d3c73ae83b', 400, 300), popular: true, available: true },
          { id: 'm11', name: 'Côtes de porc grillées', description: 'Côtes marinées, cuites au feu de bois', price: 2800, image: U('1529193591184-b1d58069ecdd', 400, 300), available: true },
        ],
      },
      {
        name: 'Accompagnements',
        items: [
          { id: 'm12', name: 'Frites de patate douce', description: 'Patates douces locales frites à l\'huile de palme', price: 600, image: U('1573080496219-bb080dd4f877', 400, 300), available: true },
          { id: 'm13', name: 'Salade d\'oignons-tomates', description: 'Oignons, tomates fraîches, vinaigre et piment', price: 400, image: U('1512621776951-a57141f2eefd', 400, 300), available: true },
        ],
      },
      {
        name: 'Boissons',
        items: [
          { id: 'm14', name: 'Bière Flag (33cl)', description: 'Bière fraîche', price: 700, image: U('1608270586620-248524c67de9', 400, 300), available: true },
          { id: 'm15', name: 'Bissap maison', description: 'Jus d\'hibiscus sucré, servi frais', price: 350, image: U('1614530291749-44e1d8e48b61', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e3',
    name: 'Pizza Corner Albarika',
    category: 'restaurant',
    quartier: 'Albarika',
    pointRepere: 'Face à la pharmacie centrale, avenue Kpébié',
    rating: 4.4,
    reviewCount: 134,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    minOrderAmount: 3000,
    isOpen: true,
    image: U('1513104890138-7c749659a591'),
    description: 'Pizzas artisanales, burgers et sandwichs. La seule vraie pizzeria de Parakou avec four à bois.',
    menu: [
      {
        name: 'Pizzas',
        items: [
          { id: 'm16', name: 'Pizza Margherita', description: 'Tomate, mozzarella, basilic frais', price: 3500, image: U('1565299624946-b28f40a0ae38', 400, 300), popular: true, available: true },
          { id: 'm17', name: 'Pizza 4 Fromages', description: 'Mozzarella, emmental, chèvre, parmesan', price: 4500, image: U('1513104890138-7c749659a591', 400, 300), available: true },
          { id: 'm18', name: 'Pizza Poulet-Piment', description: 'Poulet épicé, poivrons, oignons, sauce tomate', price: 4000, image: U('1574071318508-1cdbab80d002', 400, 300), popular: true, available: true },
          { id: 'm19', name: 'Pizza Végétarienne', description: 'Légumes du marché, olives, mozzarella', price: 3200, image: U('1574071318508-1cdbab80d002', 400, 300), available: true },
        ],
      },
      {
        name: 'Burgers & Sandwichs',
        items: [
          { id: 'm20', name: 'Burger Classic', description: 'Bœuf 150g, laitue, tomate, cornichon, sauce maison', price: 2800, image: U('1568901346375-23c9450c58cd', 400, 300), popular: true, available: true },
          { id: 'm21', name: 'Sandwich Poulet', description: 'Poulet grillé, salade, tomate, mayonnaise', price: 1800, image: U('1509722747041-616f39b57ef3', 400, 300), available: true },
        ],
      },
      {
        name: 'Boissons',
        items: [
          { id: 'm22', name: 'Coca-Cola 33cl', description: 'Cannette fraîche', price: 500, image: U('1594971475674-6a97fbe6b89c', 400, 300), available: true },
          { id: 'm23', name: 'Jus de fruits local', description: 'Mangue ou ananas, fait maison', price: 400, image: U('1610970881699-44a5587cabec', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e4',
    name: "Restaurant L'Escale",
    category: 'restaurant',
    quartier: 'Sinagourou',
    pointRepere: 'Côté nord du carrefour de Sinagourou, près de la station Total',
    rating: 4.3,
    reviewCount: 98,
    deliveryTimeMin: 25,
    deliveryTimeMax: 45,
    minOrderAmount: 2000,
    isOpen: true,
    image: U('1414235077428-338989a2e8c0'),
    description: 'Cuisine internationale et africaine dans un cadre agréable. Du thiéboudienne au spaghetti, tout le monde trouve son compte.',
    menu: [
      {
        name: 'Plats',
        items: [
          { id: 'm24', name: 'Thiéboudienne', description: 'Riz au poisson sénégalais, légumes mijotés', price: 2200, image: U('1546069901-ba9599a7e63c', 400, 300), popular: true, available: true },
          { id: 'm25', name: 'Riz sauce tomate + poulet', description: 'Riz basmati, sauce tomate maison, cuisse de poulet', price: 2000, image: U('1603360946369-dc9bb6258143', 400, 300), available: true },
          { id: 'm26', name: 'Spaghetti bolognaise', description: 'Spaghetti, sauce bœuf haché, parmesan', price: 2500, image: U('1621996346565-e3dbc646d9a9', 400, 300), available: true },
          { id: 'm27', name: 'Omelette garnie', description: 'Œufs frais, légumes, fromage fondu, frites', price: 1800, image: U('1510693206972-df098062cb71', 400, 300), available: true },
        ],
      },
      {
        name: 'Boissons',
        items: [
          { id: 'm28', name: 'Eau Cristal 1L', description: 'Eau minérale fraîche', price: 300, image: U('1548839140-29a749e1cf4d', 400, 300), available: true },
          { id: 'm29', name: 'Thé à la menthe', description: 'Thé vert, menthe fraîche, sucre', price: 400, image: U('1544787219-7f47ccb76574', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e5',
    name: 'Super U Parakou',
    category: 'superette',
    quartier: 'Camp Adagbé',
    pointRepere: 'Face au Monument Maga, Camp Adagbé, à 100m du rond-point',
    rating: 4.5,
    reviewCount: 256,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    minOrderAmount: 1000,
    isOpen: true,
    image: U('1542838132-92c53300491e'),
    description: 'Supermarché avec produits frais, épicerie sèche, produits ménagers et boissons. Livraison rapide sur Parakou.',
    menu: [
      {
        name: 'Épicerie sèche',
        items: [
          { id: 'm30', name: 'Riz importé 5kg', description: 'Riz long grain, qualité premium', price: 3200, image: U('1586201375761-83865001e31c', 400, 300), available: true },
          { id: 'm31', name: 'Huile de palme 1L', description: 'Huile de palme locale, bouteille plastique', price: 800, image: U('1474979266404-7eaacbcd87c5', 400, 300), available: true },
          { id: 'm32', name: 'Sucre 1kg', description: 'Sucre blanc raffiné', price: 600, image: U('1587049352846-4a222e784d38', 400, 300), available: true },
          { id: 'm33', name: 'Lait en poudre Nido 400g', description: 'Lait en poudre entier', price: 2500, image: U('1550583724-b2692b85b150', 400, 300), available: true },
          { id: 'm34', name: 'Farine de blé 1kg', description: 'Farine tout usage', price: 700, image: U('1574323347407-f5e1ad6d020b', 400, 300), available: true },
        ],
      },
      {
        name: 'Boissons & Snacks',
        items: [
          { id: 'm35', name: 'Eau minérale 1.5L', description: 'Bouteille plastique fraîche', price: 400, image: U('1548839140-29a749e1cf4d', 400, 300), popular: true, available: true },
          { id: 'm36', name: 'Biscuits Digestive x2', description: 'Paquet de biscuits au blé complet', price: 450, image: U('1558961363-fa8fdf82db35', 400, 300), available: true },
          { id: 'm37', name: 'Jus Rani Mangue 33cl', description: 'Jus de mangue en canette', price: 350, image: U('1551529834-525807d6b4f3', 400, 300), available: true },
        ],
      },
      {
        name: 'Produits ménagers',
        items: [
          { id: 'm38', name: 'Savon OMO 500g', description: 'Lessive en poudre', price: 550, image: U('1585435557343-3b092031a831', 400, 300), available: true },
          { id: 'm39', name: 'Eau de Javel 1L', description: 'Désinfectant multi-usage', price: 400, image: U('1584464491033-06628f3a6b7b', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e6',
    name: 'Marché Frais Titirou',
    category: 'superette',
    quartier: 'Titirou',
    pointRepere: 'Entrée principale du quartier Titirou, à 50m de l\'école primaire publique',
    rating: 4.2,
    reviewCount: 89,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    minOrderAmount: 500,
    isOpen: true,
    image: U('1488459716781-31db52582fe9'),
    description: 'Produits frais du marché : légumes, fruits, tubercules et épices directement des producteurs de la région.',
    menu: [
      {
        name: 'Légumes & Tubercules',
        items: [
          { id: 'm40', name: 'Ignames fraîches 2kg', description: 'Ignames locales, variété Borgou', price: 1200, image: U('1604782206219-3b9576645323', 400, 300), popular: true, available: true },
          { id: 'm41', name: 'Tomates fraîches 1kg', description: 'Tomates locales bien mûres', price: 400, image: U('1582284540020-8862d7b7a8d2', 400, 300), available: true },
          { id: 'm42', name: 'Haricot local 1kg', description: 'Haricot niébé de la région', price: 600, image: U('1590165482129-1b8b27698780', 400, 300), available: true },
          { id: 'm43', name: 'Piment frais 250g', description: 'Piment rouge local, très fort', price: 300, image: U('1526346698789-22fd84314424', 400, 300), available: true },
        ],
      },
      {
        name: 'Fruits',
        items: [
          { id: 'm44', name: 'Mangues (6 pièces)', description: 'Mangues saison, variété locale', price: 500, image: U('1553279768-865429fa0078', 400, 300), popular: true, available: true },
          { id: 'm45', name: 'Ananas entier', description: 'Ananas Victoria, sucré et juteux', price: 700, image: U('1550258987-190a2d41a8ba', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e7',
    name: 'Douceurs du Borgou',
    category: 'patisserie',
    quartier: 'Guéma',
    pointRepere: 'Rue de la mission catholique de Guéma, bâtiment jaune',
    rating: 4.7,
    reviewCount: 143,
    deliveryTimeMin: 20,
    deliveryTimeMax: 40,
    minOrderAmount: 1500,
    isOpen: true,
    image: U('1556742521-9713bf272865'),
    description: 'Pâtisserie artisanale fondée en 2021. Gâteaux sur commande, viennoiseries et desserts aux saveurs tropicales.',
    menu: [
      {
        name: 'Gâteaux',
        items: [
          { id: 'm46', name: 'Part gâteau au chocolat', description: 'Gâteau moelleux au chocolat belge, ganache maison', price: 1200, image: U('1578985545062-69928b1d9587', 400, 300), popular: true, available: true },
          { id: 'm47', name: 'Tarte fruits tropicaux', description: 'Mangue, ananas, papaye sur crème pâtissière vanille', price: 1500, image: U('1464305795204-6f5bbfc7fb81', 400, 300), popular: true, available: true },
          { id: 'm48', name: 'Cake banane-noix de coco', description: 'Cake moelleux, bananes locales et noix de coco râpée', price: 1000, image: U('1499636136210-6f4ee915583e', 400, 300), available: true },
        ],
      },
      {
        name: 'Viennoiseries',
        items: [
          { id: 'm49', name: 'Croissants beurre x3', description: 'Croissants feuilletés, beurre pur, cuits le matin', price: 900, image: U('1555507036-ab1f4038808a', 400, 300), available: true },
          { id: 'm50', name: 'Pain au chocolat x2', description: 'Pain au chocolat croustillant, chocolat noir', price: 800, image: U('1509440159596-0249088772ff', 400, 300), available: true },
          { id: 'm51', name: 'Beignets sucrés x5', description: 'Beignets frits, saupoudrés de sucre glace', price: 600, image: U('1551024709-8f23befc6f87', 400, 300), popular: true, available: true },
        ],
      },
    ],
  },
  {
    id: 'e8',
    name: 'Boutique Al-Amin',
    category: 'boutique',
    quartier: 'Zongo',
    pointRepere: 'Carrefour central de Zongo, face à la mosquée Al-Amin',
    rating: 4.1,
    reviewCount: 67,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    minOrderAmount: 500,
    isOpen: true,
    image: U('1441986300917-64674bd600d8'),
    description: 'Épicerie générale et produits ménagers. Tout ce dont vous avez besoin au quotidien, livré à domicile.',
    menu: [
      {
        name: 'Épicerie & Cuisine',
        items: [
          { id: 'm52', name: 'Huile végétale 2L', description: 'Huile de tournesol, marque Dinor', price: 1200, image: U('1474979266404-7eaacbcd87c5', 400, 300), available: true },
          { id: 'm53', name: 'Cube Maggi x20', description: 'Assaisonnement, boîte de 20 cubes', price: 400, image: U('1508615039623-a25605d2b022', 400, 300), popular: true, available: true },
          { id: 'm54', name: 'Tomate concentrée 200g', description: 'Concentré de tomate en boîte', price: 350, image: U('1546069901-ba9599a7e63c', 400, 300), available: true },
        ],
      },
      {
        name: 'Ménager & Hygiène',
        items: [
          { id: 'm55', name: 'Savon Palmolive x3', description: 'Savon de toilette, parfum aloe vera', price: 600, image: U('1584464491033-06628f3a6b7b', 400, 300), available: true },
          { id: 'm56', name: 'Piles AA x4', description: 'Piles alcalines longue durée', price: 500, image: U('1534103362078-d07e750bd0c4', 400, 300), available: true },
          { id: 'm57', name: 'Allumettes x5 boîtes', description: 'Allumettes longues', price: 200, image: U('1556909172-54557c7e4fb7', 400, 300), available: true },
        ],
      },
    ],
  },
  {
    id: 'e9',
    name: 'Sanya Express',
    category: 'boutique',
    quartier: 'Tourou',
    pointRepere: 'Derrière la gare ferroviaire de Parakou, rue de la coopérative',
    rating: 3.9,
    reviewCount: 42,
    deliveryTimeMin: 30,
    deliveryTimeMax: 55,
    minOrderAmount: 1000,
    isOpen: false,
    image: U('1497366216548-37526070297c'),
    description: 'Papeterie, fournitures de bureau et scolaires. Cartouches d\'encre, rames de papier, classeurs livrés à domicile.',
    menu: [
      {
        name: 'Papeterie scolaire',
        items: [
          { id: 'm58', name: 'Cahier 200 pages', description: 'Cahier grand format, séyès', price: 600, image: U('1531346878377-a5be20888e57', 400, 300), available: false },
          { id: 'm59', name: 'Stylos Bic x10', description: 'Stylos bille bleue, boîte de 10', price: 500, image: U('1434030216411-0b793f4b4173', 400, 300), available: false },
          { id: 'm60', name: 'Rame de papier A4', description: '500 feuilles 80g, blanc', price: 3500, image: U('1497366216548-37526070297c', 400, 300), available: false },
        ],
      },
    ],
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord1',
    establishmentId: 'e1',
    establishmentName: 'Maquis Chez Tantie Bio',
    items: [
      { id: 'm1', name: 'Igname pilée + sauce arachide', quantity: 2, price: 1200 },
      { id: 'm6', name: 'Jus de gingembre maison', quantity: 2, price: 400 },
    ],
    total: 3700,
    deliveryFee: 500,
    status: 'livree',
    date: '2026-06-20',
    quartierLivraison: 'Banikanni',
    pointRepereLivraison: "Derrière l'école primaire publique centrale",
    paymentMethod: 'mtn_momo',
    livreur: { nom: 'Moussa Sabi', telephone: '+229 97 12 34 56', moyenTransport: 'moto' },
  },
  {
    id: 'ord2',
    establishmentId: 'e3',
    establishmentName: 'Pizza Corner Albarika',
    items: [
      { id: 'm18', name: 'Pizza Poulet-Piment', quantity: 1, price: 4000 },
      { id: 'm22', name: 'Coca-Cola 33cl', quantity: 2, price: 500 },
    ],
    total: 5300,
    deliveryFee: 300,
    status: 'livree',
    date: '2026-06-18',
    quartierLivraison: 'Albarika',
    pointRepereLivraison: 'Résidence Kpébié, porte bleue à côté du transformateur',
    paymentMethod: 'especes_livraison',
    livreur: { nom: 'Ibrahim Bachabi', telephone: '+229 96 78 90 12', moyenTransport: 'moto' },
  },
  {
    id: 'ord3',
    establishmentId: 'e7',
    establishmentName: 'Douceurs du Borgou',
    items: [
      { id: 'm46', name: 'Part gâteau au chocolat', quantity: 3, price: 1200 },
      { id: 'm51', name: 'Beignets sucrés x5', quantity: 1, price: 600 },
    ],
    total: 5000,
    deliveryFee: 800,
    status: 'en_route',
    date: '2026-06-29',
    quartierLivraison: 'Kpébié',
    pointRepereLivraison: 'Carrefour Kpébié, maison avec portail vert',
    paymentMethod: 'moov_money',
    livreur: { nom: 'Saliou Alimi', telephone: '+229 95 55 66 77', moyenTransport: 'moto' },
  },
];

export const categories = ['Tous', 'Restaurants', 'Maquis', 'Supérettes', 'Pâtisseries', 'Boutiques'];

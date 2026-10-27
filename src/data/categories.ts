import { Category, CategoryGroup } from '../types/forum';

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'general',
    title: 'Zona General',
    description: 'Los foros más activos: debate libre, actualidad diaria, sucesos y misterio.',
    icon: 'MessageSquare',
  },
  {
    id: 'motor',
    title: 'Motor y Ruedas',
    description: 'El rincón de los aficionados al asfalto: coches, mecánica, bricos y motos.',
    icon: 'Car',
  },
  {
    id: 'tecnologia',
    title: 'Tecnología e Informática',
    description: 'Hardware, presupuestos de PC, telefonía móvil, software y videojuegos.',
    icon: 'Cpu',
  },
  {
    id: 'ocio',
    title: 'Ocio y Deportes',
    description: 'Fútbol, gimnasio, nutrición, cine, series, viajes y gastronomía.',
    icon: 'Dumbbell',
  },
  {
    id: 'comunidad',
    title: 'Comunidad Alterna',
    description: 'Mercadillo de compraventa, dudas sobre el foro, normas y avisos de moderación.',
    icon: 'Shield',
  },
];

export const CATEGORIES: Category[] = [
  // General
  {
    id: 'general-principal',
    name: 'General',
    description: 'El corazón de Foro Alterno. Hilos libres, anécdotas del día a día, historias surrealistas, reflexiones y cháchara.',
    groupId: 'general',
    icon: 'Flame',
    color: '#e67e22',
    subforums: ['Plataformas', 'Encuestas', 'Fotos y Chorradas'],
  },
  {
    id: 'noticias-actualidad',
    name: 'Noticias y Actualidad',
    description: 'Debate serio sobre política nacional e internacional, economía, sociedad y noticias de última hora.',
    groupId: 'general',
    icon: 'Newspaper',
    color: '#2980b9',
    subforums: ['Política', 'Economía', 'Mundo'],
  },
  {
    id: 'paranormal-conspiraciones',
    name: 'Paranormal y Misterio',
    description: 'Teorías de la conspiración, avistamientos OVNI, fenómenos extraños, leyendas urbanas y misterios sin resolver.',
    groupId: 'general',
    icon: 'Eye',
    color: '#8e44ad',
    subforums: ['Ufología', 'Leyendas Urbanas', 'Crímenes sin resolver'],
  },

  // Motor
  {
    id: 'coches-motor',
    name: 'Coches y Mecánica',
    description: 'Todo sobre turismos, deportivos, coches clásicos, averías mecánicas, bricos paso a paso y consejos de compra.',
    groupId: 'motor',
    icon: 'Car',
    color: '#c0392b',
    subforums: ['Mecánica y Bricos', 'Clásicos', 'Compra / Venta dudas'],
  },
  {
    id: 'motos',
    name: 'Motos',
    description: 'El subforo de las dos ruedas: rutas moteras, equipamiento, carnets A1/A2/A, scooters y cilindradas altas.',
    groupId: 'motor',
    icon: 'Compass',
    color: '#d35400',
    subforums: ['Rutas y Quedadas', '125cc y A2', 'Equipamiento'],
  },

  // Tecnología
  {
    id: 'informatica-hardware',
    name: 'Informática y Hardware',
    description: 'Presupuestos para PC Gaming, tarjetas gráficas, procesadores, monitores, periféricos y sistemas operativos.',
    groupId: 'tecnologia',
    icon: 'Cpu',
    color: '#16a085',
    subforums: ['Presupuestos a medida', 'Overclocking & Modding', 'Linux y Redes'],
  },
  {
    id: 'telefonia-moviles',
    name: 'Telefonía y Móviles',
    description: 'Smartphones Android, iPhones iOS, comparativas de cámaras, tarifas móviles, operadoras y chollos.',
    groupId: 'tecnologia',
    icon: 'Smartphone',
    color: '#27ae60',
    subforums: ['Android', 'Apple iOS', 'Ofertas y Tarifas'],
  },
  {
    id: 'videojuegos',
    name: 'Videojuegos',
    description: 'Consolas PlayStation, Xbox, Nintendo Switch, PC Steam, análisis de lanzamientos, emulación y juegos retro.',
    groupId: 'tecnologia',
    icon: 'Gamepad2',
    color: '#9b59b6',
    subforums: ['PlayStation & Xbox', 'Nintendo', 'PC Gaming & Ofertas'],
  },

  // Ocio
  {
    id: 'deportes-fitness',
    name: 'Deportes y Gimnasio',
    description: 'Fútbol de Primera División y Champions, rutinas de hipertrofia, nutrición deportiva, artes marciales y running.',
    groupId: 'ocio',
    icon: 'Dumbbell',
    color: '#2c3e50',
    subforums: ['Fútbol', 'Gimnasio & Dieta', 'Baloncesto y Polideportivo'],
  },
  {
    id: 'cine-series-musica',
    name: 'Cine, Series y Música',
    description: 'Críticas de estrenos en cines y plataformas de streaming, teorías sobre series, recomendaciones musicales y conciertos.',
    groupId: 'ocio',
    icon: 'Film',
    color: '#e74c3c',
    subforums: ['Series de TV', 'Cine de culto', 'Música y festivales'],
  },
  {
    id: 'viajes-gastronomia',
    name: 'Viajes y Gastronomía',
    description: 'Rutas por España y el extranjero, guías de viaje, recomendaciones de restaurantes, recetas caseras y comida tradicional.',
    groupId: 'ocio',
    icon: 'Utensils',
    color: '#f39c12',
    subforums: ['Viajar barato', 'Recetas de cocina', 'Rincones con encanto'],
  },

  // Comunidad
  {
    id: 'compraventa',
    name: 'Compraventa entre Foreros',
    description: 'Mercadillo exclusivo para usuarios registrados. Tratos en mano, envíos, valoraciones de confianza e intercambios.',
    groupId: 'comunidad',
    icon: 'ShoppingBag',
    color: '#34495e',
    subforums: ['Electrónica y Motor', 'Merchandising y Varios'],
  },
  {
    id: 'sugerencias-normas',
    name: 'Avisos, Sugerencias y Dudas',
    description: 'Normas de convivencia en Foro Alterno, rangos de usuarios, anuncios del staff y propuestas de mejora para la web.',
    groupId: 'comunidad',
    icon: 'HelpCircle',
    color: '#7f8c8d',
    subforums: ['Normas generales', 'Rangos e Insignias', 'Sugerencias'],
  },
];

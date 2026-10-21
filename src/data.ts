import progImg from './assets/images/programmer_vector_1780328281816.png';
import uiuxImg from './assets/images/ui_ux_vector_1780328298623.png';

export const topFreelancers = [
  {
    id: 'f1',
    name: 'Sophie Martin',
    role: 'Ménage & Nettoyage',
    rating: 4.8,
    location: 'Paris',
    rate: 18,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    overview: "With over 5 years of experience in residential and commercial cleaning, I pride myself on attention to detail and efficiency. I believe a clean space brings a clear mind. Constantly striving to provide the best service to my clients.",
    skills: "Deep Cleaning, Organization, Ironing, Window Cleaning, Time Management",
    portfolioUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 'f2',
    name: 'Marc Dubois',
    role: 'Montage Vidéo',
    rating: 5.0,
    location: 'Lyon',
    rate: 45,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    overview: "From humble individual creators to large brands, I've had a blast editing videos that people love. I'm proudly building engaging narratives and dynamic visuals alongside some of the industry's greatest innovators.",
    skills: "Video Editing, Motion Graphics, Color Grading, Audio Mixing, Storytelling",
    portfolioUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 'f3',
    name: 'Emma Petit',
    role: 'Aide aux devoirs',
    rating: 4.9,
    location: 'Bordeaux',
    rate: 22,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    overview: "Passionate educator doing my best to help students achieve their academic goals. I adapt to each child's learning style to ensure they understand core concepts and gain confidence in their studies.",
    skills: "Mathematics, Languages, Patient Teaching, Methodology, Exam Prep",
    portfolioUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 'f4',
    name: 'Lucas Bernard',
    role: 'Jardinage & Extérieur',
    rating: 4.7,
    location: 'Marseille',
    rate: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    overview: "Nature enthusiast with a green thumb. I transform ordinary yards into beautiful, relaxing outdoor living spaces. From basic maintenance to complete landscape redesigns.",
    skills: "Landscaping, Plant Care, Topiary, Lawn Maintenance, Irrigation",
    portfolioUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 'f5',
    name: 'Stephan Lee',
    role: 'UI / UX Designer',
    rating: 4.9,
    location: 'Jakarta',
    rate: 55,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    overview: "From humble startups to software used by billions, I've had a blast designing things that people love. At Google, I'm proudly building the future of Chrome alongside some of the industry's greatest innovators.",
    skills: "UX Design, UI Design, IoT Design, Micro-interaction Design, 3D Illustration",
    portfolioUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&q=80&w=600"
  }
];

export const categories = [
  { id: 'c1', name: 'Éducation', count: '102 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1546410531-bd4cb0153f3e?auto=format&fit=crop&q=80&w=300' },
  { id: 'c2', name: 'Artisanat', count: '85 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1589314488310-9195d2c4bc9f?auto=format&fit=crop&q=80&w=300' },
  { id: 'c3', name: 'Informatique', count: '256 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300' },
  { id: 'c4', name: 'Réparation', count: '120 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=300' },
  { id: 'c5', name: 'Beauté', count: '90 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13fee7a3af?auto=format&fit=crop&q=80&w=300' },
  { id: 'c6', name: 'Transport', count: '75 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300' },
  { id: 'c7', name: 'Bien-être', count: '65 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300' },
  { id: 'c8', name: 'Événementiel', count: '110 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=300' },
  { id: 'c9', name: 'Déménagement', count: '40 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300' },
  { id: 'c10', name: 'Nettoyage', count: '130 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=300' },
  { id: 'c11', name: 'Bricolage', count: '94 Artisans', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=300' },
  { id: 'c12', name: 'Photographie', count: '140 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300' },
  { id: 'c13', name: 'Architecture', count: '55 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300' },
  { id: 'c14', name: 'Jardinage', count: '78 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1416879598555-ea2605f6eeb6?auto=format&fit=crop&q=80&w=300' },
  { id: 'c15', name: 'Soutien scolaire', count: '85 Profs', imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=300' },
  { id: 'c16', name: 'Rédaction', count: '115 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=300' },
  { id: 'c17', name: 'Vidéo', count: '95 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1518131672697-613becd4fab5?auto=format&fit=crop&q=80&w=300' },
  { id: 'c18', name: 'Sécurité', count: '60 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=300' },
  { id: 'c19', name: 'Plomberie', count: '88 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cb5b3e1?auto=format&fit=crop&q=80&w=300' },
  { id: 'c20', name: 'Électricité', count: '105 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300' },
  { id: 'c21', name: 'Design', count: '142 Designers', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=300' },
  { id: 'c22', name: 'Marketing', count: '125 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1533750516457-f7b992d8ce6a?auto=format&fit=crop&q=80&w=300' },
  { id: 'c23', name: 'Traduction', count: '70 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300' },
  { id: 'c24', name: 'Coaching', count: '50 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=300' },
  { id: 'c25', name: 'Garde d\'enfants', count: '80 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300' },
  { id: 'c26', name: 'Musique', count: '45 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300' },
  { id: 'c27', name: 'Comptabilité', count: '65 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300' },
  { id: 'c28', name: 'Droit', count: '55 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300' },
  { id: 'c29', name: 'Cuisine', count: '120 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=300' },
  { id: 'c30', name: 'Sport', count: '110 Prestataires', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=300' }
];

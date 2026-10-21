export type PaperStyle = 
  | 'pure-white' 
  | 'cotton-ivory' 
  | 'lined' 
  | 'dot-grid' 
  | 'grid' 
  | 'dark-ink';

export type FontChoice = 'cormorant' | 'lora' | 'jakarta' | 'jetbrains';

export type EditorMode = 'text' | 'draw';

export type DrawingTool = 'pen' | 'pencil' | 'highlighter' | 'eraser';

export type AmbientSoundType = 'none' | 'rain' | 'crackle' | 'drone';

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  subject: string; // e.g. "Mathématiques", "Français", "Histoire-Géographie", "Physique-Chimie", "SVT", "Anglais", "Philosophie"
  accreditationCode: string; // Individual private accreditation code
  createdAt: number;
}

export interface PageDocument {
  id: string;
  teacherId: string; // Belongs to specific teacher for isolation
  title: string;
  content: string; // Markdown or plain text
  canvasDataUrl?: string; // Saved drawing if in draw mode
  paperStyle: PaperStyle;
  fontChoice: FontChoice;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  lastModified: number;
  wordCount: number;
}

export type AppView = 'workspace' | 'settings' | 'subjects';

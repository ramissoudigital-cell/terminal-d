import React, { useState } from 'react';
import { ChevronLeft, Camera, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { RegisteredUser } from '../types';

interface ProfileDetailViewProps {
  onBack: () => void;
  userProfile?: RegisteredUser;
}

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({ onBack, userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || 'Jane',
    lastName: userProfile?.lastName || 'Cooper',
    email: userProfile?.email || 'jane.cooper@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    profession: 'Vidéaste & photographe'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="absolute inset-0 z-[100] h-full bg-gradient-to-b from-sky-200 via-cyan-100 to-sky-200 overflow-y-auto hide-scrollbar pb-12">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-between relative mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 transition-colors z-10"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center">Détails du profil</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full text-[13px] font-bold text-sky-600 hover:bg-white/80 transition-colors z-10"
        >
          {isEditing ? 'Enregistrer' : 'Modifier'}
        </button>
      </div>

      <div className="px-5 flex flex-col gap-6 items-center">
        {/* Profile Picture */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-sky-600 transition-colors">
              <Camera size={14} />
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col gap-5">
            <InputField 
              icon={<User size={18} />} 
              label="Prénom" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <div className="h-[1px] bg-gray-100/50"></div>
            <InputField 
              icon={<User size={18} />} 
              label="Nom" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <div className="h-[1px] bg-gray-100/50"></div>
            <InputField 
              icon={<Briefcase size={18} />} 
              label="Profession" 
              name="profession" 
              value={formData.profession} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <div className="h-[1px] bg-gray-100/50"></div>
            <InputField 
              icon={<Mail size={18} />} 
              label="Adresse e-mail" 
              name="email" 
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <div className="h-[1px] bg-gray-100/50"></div>
            <InputField 
              icon={<Phone size={18} />} 
              label="Numéro de téléphone" 
              name="phone" 
              type="tel"
              value={formData.phone} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
            <div className="h-[1px] bg-gray-100/50"></div>
            <InputField 
              icon={<MapPin size={18} />} 
              label="Localisation" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              disabled={!isEditing} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, label, name, value, onChange, disabled, type = 'text' }: any) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">{label}</label>
      <div className="flex items-center gap-3">
        <div className="text-gray-400 w-5 flex justify-center">
          {icon}
        </div>
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 bg-transparent text-[15px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-80"
        />
      </div>
    </div>
  );
};

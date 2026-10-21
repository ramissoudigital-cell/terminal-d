import React from 'react';
import { Student } from '../types';
import { StudentCardSlider } from './StudentCardSlider';

interface CreditCardProps {
  student: Student;
  onEdit?: () => void;
  onDelete?: () => void;
  onPhotoChange?: (newPhotoUrl: string) => void;
  readOnly?: boolean;
  onNavigate?: (page: string) => void;
  currentUser?: any;
  hideTuitionCard?: boolean;
}

export const CreditCard: React.FC<CreditCardProps> = ({ 
  student, 
  onEdit, 
  onDelete, 
  onPhotoChange, 
  readOnly = false, 
  onNavigate,
  currentUser,
  hideTuitionCard
}) => {
  return (
    <div className="w-full">
      <StudentCardSlider
        student={student}
        onEdit={onEdit}
        onDelete={onDelete}
        onPhotoChange={onPhotoChange}
        readOnly={readOnly}
        onNavigate={onNavigate}
        currentUser={currentUser}
        hideTuitionCard={hideTuitionCard}
      />
    </div>
  );
};

export default CreditCard;

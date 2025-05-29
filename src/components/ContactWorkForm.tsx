import React, { useState, useEffect } from 'react';
import { ContactWorkEntry, OrganizationType } from '../types/contactWork';

interface ContactWorkFormProps {
  entry?: ContactWorkEntry | null;
  onSubmit: (entry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ContactWorkForm: React.FC<ContactWorkFormProps> = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    person: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    organization: 'YL' as OrganizationType,
    isRecurring: false,
    recurringFrequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    recurringDuration: '6months' as '3months' | '6months' | '1year' | 'custom',
    customDuration: 3,
    customDurationUnit: 'months' as 'weeks' | 'months',
    dayOfMonth: 1,
    description: ''
  });

  // Helper functions to format dates/times like EventForm
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTimeForInput(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (entry) {
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);
      
      setFormData({
        person: entry.person,
        startDate: formatDateForInput(startTime),
        startTime: formatTimeForInput(startTime),
        endDate: formatDateForInput(endTime),
        endTime: formatTimeForInput(endTime),
        location: entry.location,
        organization: entry.organization,
        isRecurring: entry.isRecurring,
        recurringFrequency: entry.recurringPattern?.frequency || 'weekly',
        recurringDuration: entry.recurringPattern?.duration || '6months',
        customDuration: entry.recurringPattern?.customDuration || 3,
        customDurationUnit: entry.recurringPattern?.customDurationUnit || 'months',
        dayOfMonth: entry.recurringPattern?.dayOfMonth || 1,
        description: entry.description || ''
      });
    } else {
      // Set default values for new entries
      const now = new Date();
      const defaultEndTime = new Date(now.getTime() + 120 * 60000); // 2 hours later
      
      setFormData(prev => ({
        ...prev,
        startDate: formatDateForInput(now),
        startTime: '17:00',
        endDate: formatDateForInput(now), // Same date as start date
        endTime: '19:00' // 2 hours after 17:00
      }));
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time for start and end, like EventForm
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    // Automatically get day of week from the selected date
    const dayOfWeek = startDateTime.getDay();
    
    const entryData: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      person: formData.person,
      startTime: startDateTime,
      endTime: endDateTime,
      location: formData.location,
      organization: formData.organization,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? {
        frequency: formData.recurringFrequency,
        duration: formData.recurringDuration,
        ...(formData.recurringDuration === 'custom') && {
          customDuration: formData.customDuration,
          customDurationUnit: formData.customDurationUnit
        },
        ...(formData.recurringFrequency === 'weekly' || formData.recurringFrequency === 'biweekly') && { dayOfWeek },
        ...(formData.recurringFrequency === 'monthly') && { dayOfMonth: formData.dayOfMonth }
      } : undefined,
      description: formData.description
    };
    
    onSubmit(entryData);
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    return days[dayNumber];
  };

  // Get day of week from selected date to show to user
  const getSelectedDayOfWeek = () => {
    if (formData.startDate) {
      const selectedDate = new Date(`${formData.startDate}T00:00:00`);
      return selectedDate.getDay();
    }
    return 0;
  };

  return (
    <div className="event-form-container">
      <h2>{entry ? 'Edytuj spotkanie' : 'Dodaj nowy contact work'}</h2>
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="person">Osoby:</label>
          <input
            type="text"
            id="person"
            value={formData.person}
            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">Grupa:</label>
          <select
            id="organization"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value as OrganizationType })}
            required
          >
            <option value="YL">Young Life</option>
            <option value="wyld">WyldLife</option>
            <option value="uni">YL University</option>
          </select>
        </div>

        {/* Date and Time - matching EventForm structure */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Data rozpoczęcia:</label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ 
                ...formData, 
                startDate: e.target.value,
                endDate: e.target.value // Automatically set end date to match start date
              })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">Godzina rozpoczęcia:</label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="endDate">Data zakończenia:</label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">Godzina zakończenia:</label>
            <input
              type="time"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Miejsce:</label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            />
            Spotkanie cykliczne
          </label>
        </div>

        {formData.isRecurring && (
          <div className="recurring-options">
            <div className="form-group">
              <label htmlFor="recurringFrequency">Częstotliwość:</label>
              <select
                id="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
              >
                <option value="weekly">Tygodniowo</option>
                <option value="biweekly">Co 2 tygodnie</option>
                <option value="monthly">Miesięcznie</option>
              </select>
            </div>

            {formData.recurringFrequency === 'monthly' && (
              <div className="form-group">
                <label htmlFor="dayOfMonth">Dzień miesiąca:</label>
                <select
                  id="dayOfMonth"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="recurringDuration">Długość cyklu:</label>
              <select
                id="recurringDuration"
                value={formData.recurringDuration}
                onChange={(e) => setFormData({ ...formData, recurringDuration: e.target.value as '3months' | '6months' | '1year' | 'custom' })}
              >
                <option value="3months">3 miesiące</option>
                <option value="6months">6 miesięcy</option>
                <option value="1year">1 rok</option>
                <option value="custom">Inne</option>
              </select>
            </div>

            {formData.recurringDuration === 'custom' && (
              <div className="form-group">
                <label htmlFor="customDuration">Długość:</label>
                <input
                  type="number"
                  id="customDuration"
                  value={formData.customDuration}
                  onChange={(e) => setFormData({ ...formData, customDuration: parseInt(e.target.value) })}
                />
              </div>
            )}

            {formData.recurringDuration === 'custom' && (
              <div className="form-group">
                <label htmlFor="customDurationUnit">Jednostka:</label>
                <select
                  id="customDurationUnit"
                  value={formData.customDurationUnit}
                  onChange={(e) => setFormData({ ...formData, customDurationUnit: e.target.value as 'weeks' | 'months' })}
                >
                  <option value="weeks">Tygodnie</option>
                  <option value="months">Miesiące</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Opis (opcjonalny):</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {entry ? 'Aktualizuj' : 'Dodaj'} spotkanie
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactWorkForm; 
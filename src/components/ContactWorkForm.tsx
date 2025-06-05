import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactWorkEntry, OrganizationType } from '../types/contactWork';

interface ContactWorkFormProps {
  entry?: ContactWorkEntry | null;
  onSubmit: (entry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ContactWorkForm: React.FC<ContactWorkFormProps> = ({ entry, onSubmit, onCancel }) => {
  const { t } = useTranslation();
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

  return (
    <div className="event-form-container">
      <h2>{entry ? t('contactWork.edit') : t('contactWork.add')}</h2>
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="person">{t('contactWork.persons')}:</label>
          <input
            type="text"
            id="person"
            value={formData.person}
            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">{t('contactWork.group')}:</label>
          <select
            id="organization"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value as OrganizationType })}
            required
          >
            <option value="YL">{t('groups.YL')}</option>
            <option value="wyld">{t('groups.wyld')}</option>
            <option value="uni">{t('groups.uni')}</option>
          </select>
        </div>

        {/* Date and Time - matching EventForm structure */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">{t('dateTime.startDate')}:</label>
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
            <label htmlFor="startTime">{t('dateTime.startTime')}:</label>
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
            <label htmlFor="endDate">{t('dateTime.endDate')}:</label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">{t('dateTime.endTime')}:</label>
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
          <label htmlFor="location">{t('contactWork.location')}:</label>
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
            {t('contactWork.recurring')}
          </label>
        </div>

        {formData.isRecurring && (
          <div className="recurring-options">
            <div className="form-group">
              <label htmlFor="recurringFrequency">{t('contactWork.frequency')}:</label>
              <select
                id="recurringFrequency"
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
              >
                <option value="weekly">{t('contactWork.weekly')}</option>
                <option value="biweekly">{t('contactWork.biweekly')}</option>
                <option value="monthly">{t('contactWork.monthly')}</option>
              </select>
            </div>

            {formData.recurringFrequency === 'monthly' && (
              <div className="form-group">
                <label htmlFor="dayOfMonth">{t('contactWork.dayOfMonth')}:</label>
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
              <label htmlFor="recurringDuration">{t('contactWork.cycleDuration')}:</label>
              <select
                id="recurringDuration"
                value={formData.recurringDuration}
                onChange={(e) => setFormData({ ...formData, recurringDuration: e.target.value as '3months' | '6months' | '1year' | 'custom' })}
              >
                <option value="3months">{t('contactWork.3months')}</option>
                <option value="6months">{t('contactWork.6months')}</option>
                <option value="1year">{t('contactWork.1year')}</option>
                <option value="custom">{t('contactWork.other')}</option>
              </select>
            </div>

            {formData.recurringDuration === 'custom' && (
              <div className="form-group">
                <label htmlFor="customDuration">{t('contactWork.customLength')}:</label>
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
                <label htmlFor="customDurationUnit">{t('contactWork.unit')}:</label>
                <select
                  id="customDurationUnit"
                  value={formData.customDurationUnit}
                  onChange={(e) => setFormData({ ...formData, customDurationUnit: e.target.value as 'weeks' | 'months' })}
                >
                  <option value="weeks">{t('contactWork.weeks')}</option>
                  <option value="months">{t('contactWork.months')}</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">{t('contactWork.description')}:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {entry ? t('contactWork.update') : t('contactWork.submit')}
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            {t('contactWork.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactWorkForm; 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Event, GroupType } from '../types/events';
import '../styles/EventForm.css';

interface EventFormProps {
  event?: Event;
  onSubmit: (event: Event) => void;
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onClose }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(event?.title || '');
  const [group, setGroup] = useState<GroupType>(event?.group || 'YoungLife');
  const [isJointEvent, setIsJointEvent] = useState<boolean>(event?.group === 'Joint' || false);
  const [selectedGroups, setSelectedGroups] = useState<GroupType[]>(
    event?.groups || ['YoungLife']
  );
  const [startDate, setStartDate] = useState(
    event?.start ? formatDateForInput(event.start) : formatDateForInput(new Date())
  );
  const [startTime, setStartTime] = useState(
    event?.start ? formatTimeForInput(event.start) : '17:23'
  );
  const [endDate, setEndDate] = useState(
    event?.end ? formatDateForInput(event.end) : formatDateForInput(new Date())
  );
  const [endTime, setEndTime] = useState(
    event?.end ? formatTimeForInput(event.end) : '19:30'
  );
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [url, setUrl] = useState(event?.url || '');

  // Update group when joint event status changes
  useEffect(() => {
    if (isJointEvent) {
      setGroup('Joint');
    } else if (selectedGroups.length > 0) {
      setGroup(selectedGroups[0]);
    }
  }, [isJointEvent, selectedGroups]);

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

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroup = e.target.value as GroupType;
    setGroup(newGroup);
    setIsJointEvent(newGroup === 'Joint');
    if (newGroup !== 'Joint') {
      setSelectedGroups([newGroup]);
    }
  };

  const handleGroupCheckboxChange = (groupType: GroupType) => {
    setSelectedGroups(prev => {
      // If the group is already selected, remove it
      if (prev.includes(groupType)) {
        return prev.filter(g => g !== groupType);
      }
      // Otherwise, add it
      return [...prev, groupType];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time for start and end
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    const newEvent: Event = {
      id: event?.id || String(Date.now()),
      title,
      group,
      groups: isJointEvent ? selectedGroups : [group],
      start: startDateTime,
      end: endDateTime,
      description,
      location,
      url: url.trim() || undefined
    };
    
    onSubmit(newEvent);
  };

  return (
    <div className="event-form-container">
      <h2>{event ? t('events.edit') : t('events.addNew')}</h2>
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">{t('events.title')}</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="group">{t('events.group')}</label>
          <select
            id="group"
            value={group}
            onChange={handleGroupChange}
            required
          >
            <option value="YoungLife">{t('groups.YoungLife')}</option>
            <option value="WyldLife">{t('groups.WyldLife')}</option>
            <option value="YLUni">{t('groups.YLUni')}</option>
            <option value="Inne">{t('groups.Inne')}</option>
            <option value="Joint">{t('events.jointEvent')}</option>
          </select>
        </div>
        
        {isJointEvent && (
          <div className="form-group">
            <label>{t('events.selectGroupsForJoint')}</label>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="joint-younglife"
                  checked={selectedGroups.includes('YoungLife')}
                  onChange={() => handleGroupCheckboxChange('YoungLife')}
                />
                <label htmlFor="joint-younglife">{t('groups.YoungLife')}</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="joint-wyldlife"
                  checked={selectedGroups.includes('WyldLife')}
                  onChange={() => handleGroupCheckboxChange('WyldLife')}
                />
                <label htmlFor="joint-wyldlife">{t('groups.WyldLife')}</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="joint-yluni"
                  checked={selectedGroups.includes('YLUni')}
                  onChange={() => handleGroupCheckboxChange('YLUni')}
                />
                <label htmlFor="joint-yluni">{t('groups.YLUni')}</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="joint-inne"
                  checked={selectedGroups.includes('Inne')}
                  onChange={() => handleGroupCheckboxChange('Inne')}
                />
                <label htmlFor="joint-inne">{t('groups.Inne')}</label>
              </div>
            </div>
            {selectedGroups.length === 0 && (
              <p className="error-message">{t('events.selectAtLeastOneGroup')}</p>
            )}
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">{t('dateTime.startDate')}</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">{t('dateTime.startTime')}</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="endDate">{t('dateTime.endDate')}</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">{t('dateTime.endTime')}</label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">{t('events.location')}</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="url">{t('events.urlOptional')}</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('events.urlPlaceholder')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">{t('events.description')}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isJointEvent && selectedGroups.length === 0}
          >
            {event ? t('events.update') : t('events.submit')}
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            {t('events.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm; 
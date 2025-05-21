import React from 'react';
import { Event } from '../types/events';
import { format } from 'date-fns';
import '../styles/EventModal.css';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event.title}</h2>
          <span className="group-badge" data-group={event.group}>
            {event.group}
          </span>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="event-details">
            <div className="detail-item">
              <strong>Date:</strong> {
                format(event.start, 'yyyy-MM-dd') === format(event.end, 'yyyy-MM-dd')
                  ? format(event.start, 'MMMM d, yyyy')
                  : `${format(event.start, 'MMMM d, yyyy')} - ${format(event.end, 'MMMM d, yyyy')}`
              }
            </div>
            <div className="detail-item">
              <strong>Time:</strong> {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </div>
            <div className="detail-item">
              <strong>Location:</strong> {event.location}
            </div>
          </div>
          <div className="event-description">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 
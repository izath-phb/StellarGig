import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  return (
    <div className="card activity-card fade-in">
      <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
          <Activity size={20} color="#14B8A6" />
          Real-Time Activity Feed
        </h2>
      </div>
      
      <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No activity yet.</p>
        ) : (
          activities.map((act, idx) => (
            <div key={idx} className="feed-item fade-in" style={{ 
              background: 'rgba(15, 23, 42, 0.4)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              borderLeft: '3px solid #14B8A6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Clock size={14} color="#64748b" />
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {act.timestamp}
                </span>
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem' }}>{act.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

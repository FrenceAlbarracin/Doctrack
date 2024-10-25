import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SideNavigation.module.css';
import { NavigationItem } from './NavigationItem';
import Modal from '../../Modal';

const navigationItems = [
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/005c7a1fc7b800da9ed0eb7da389c028dba409099cc177f99c94e1fb260ee196?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "Dashboard", isActive: true, link: "/dashboard" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b926edca9da2bd02e758e006f2ebaf4a5943ec2e14c0bc7043ff1638257afb48?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "New Document" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/62af66e9f4c012032bfebdb68e774d2cca1b439bb2c9f816d6066d03b5c1cafc?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "Transfer In" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4eb8849ea926bf25c860065d3e79a63b28b18b1c0af27d925504e2538aa4471b?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "Transfer Out" },
];

const documentItems = [
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/5eb33c88da331cbd7c80d172ba8a5de6d7debd99be7fac7149b15af2863f8670?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "All" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/299f0b10ae60643f7737cf49c147dcc13c34aad7e5b16295767fbcbfae42acd2?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "In Transit" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/c23e99a6561a8d6f026efdd6ce16ade880ca84befe6ed8629ae672d7b96ade03?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "Finished" },
];

const manageItems = [
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/ef14105a500b66854f89c5620f3d32e2a5dbaf09c38aedabb17f4c76b9ab15f4?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "New User Approval" },
  { icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/fdf6a3c79bdaad8ecf0558b37a861092b45999045f1f0e63787a112b3c20be64?placeholderIfAbsent=true&apiKey=1194e150faa74888af77be55eb83006a", label: "Manage Users" },
];

const SideNavigation = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [calendarStatus, setCalendarStatus] = useState('loading');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const loadGoogleAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', initClient);
      };
      document.body.appendChild(script);
    };

    loadGoogleAPI();
  }, []);

  const initClient = () => {
    window.gapi.client.init({
      apiKey: 'AIzaSyCAq7zCrb2WvN03qb52D0FHsPfY3OEzO-o',
      clientId: '465216288473-9t6vhd30arvjfjtogqinvbtj9a6vnmjc.apps.googleusercontent.com',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar.readonly'
    }).then(() => {
      console.log('Google API client initialized successfully');
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(err => {
      console.error('Error initializing Google API client:', err);
      setCalendarStatus('error');
    });
  };

  const updateSigninStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
    if (isSignedIn) {
      loadEvents();
    } else {
      setCalendarStatus('not_signed_in');
    }
  };

  const handleAuthClick = () => {
    if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      window.gapi.auth2.getAuthInstance().signOut();
    } else {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const loadEvents = () => {
    setCalendarStatus('loading');
    window.gapi.client.calendar.events.list({
      'calendarId': 'en.usa#holiday@group.v.calendar.google.com', // US Holidays calendar
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 5,
      'orderBy': 'startTime'
    }).then(response => {
      setEvents(response.result.items);
      setCalendarStatus(response.result.items.length > 0 ? 'loaded' : 'empty');
    }).catch(err => {
      console.error('Error loading calendar events:', err);
      setCalendarStatus('error');
      setError(`Error loading calendar events: ${err.message || JSON.stringify(err)}`);
    });
  };

  const handleItemClick = (label) => {
    if (label === "Dashboard") {
      navigate('/dashboard');
    } else {
      setModalContent(label);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <nav className={styles.sideNav}>
      {navigationItems.map((item, index) => (
        <div key={index} onClick={() => handleItemClick(item.label)}>
          <NavigationItem {...item} />
        </div>
      ))}
      
      <h2 className={styles.sectionTitle}>My Documents</h2>
      {documentItems.map((item, index) => (
        <NavigationItem key={`doc-${index}`} {...item} />
      ))}
      
      <h2 className={styles.sectionTitle}>Calendar</h2>
      {calendarStatus === 'not_signed_in' && (
        <button onClick={handleAuthClick}>Sign in to view calendar</button>
      )}
      {calendarStatus === 'loading' && <div>Loading calendar...</div>}
      {calendarStatus === 'error' && <div>Error loading calendar</div>}
      {calendarStatus === 'empty' && <div>No upcoming events</div>}
      {calendarStatus === 'loaded' && (
        <>
          <button onClick={handleAuthClick}>Sign out</button>
          {events.map((event, index) => (
            <NavigationItem 
              key={`event-${index}`} 
              icon="https://example.com/calendar-icon.png" // Replace with actual calendar icon
              label={event.summary} 
            />
          ))}
        </>
      )}
      
      <h2 className={styles.sectionTitle}>Manage</h2>
      {manageItems.map((item, index) => (
        <NavigationItem key={`manage-${index}`} {...item} />
      ))}
      
      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalContent}>
        <label>Serial Number</label>
        <input type="text" placeholder="Enter Serial Number" />
        
        <label>Document Name</label>
        <input type="text" placeholder="Enter Document Name" />
        
        <label>Recipient</label>
        <input type="text" placeholder="Enter Recipient" />
        
        <label>User ID</label>
        <input type="text" placeholder="Enter User ID" />
        
        <label>Remarks</label>
        <textarea placeholder="Enter remarks..."></textarea>
      </Modal>
    </nav>
  );
};

export default SideNavigation;

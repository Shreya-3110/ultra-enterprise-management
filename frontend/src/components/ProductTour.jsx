import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductTour = () => {
  const { user, token, completeTour } = useAuth();

  useEffect(() => {
    // Only run tour if user is logged in and hasn't completed it
    if (user && !user.hasCompletedTour) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        steps: [
          {
            element: '#sidebar-nav',
            popover: {
              title: 'Navigation Hub',
              description: 'Here you can access all modules like Students, Fees, and Reports.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#overview-link',
            popover: {
              title: 'Dashboard Overview',
              description: 'Get a quick summary of your school\'s performance and alerts.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#top-navbar',
            popover: {
              title: 'Global Actions',
              description: 'Search, check notifications, and manage your account from here.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#user-profile',
            popover: {
              title: 'Your Profile',
              description: 'Switch plans, edit your profile, or log out.',
              side: "bottom",
              align: 'end'
            }
          },
          {
            element: '#support-section',
            popover: {
              title: 'Support & Config',
              description: 'Manage system settings and get help when you need it.',
              side: "right",
              align: 'end'
            }
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep()) {
            handleTourComplete();
          }
        },
        onCloseClick: () => {
           handleTourComplete();
        }
      });

      driverObj.drive();
    }
  }, [user]);

  const handleTourComplete = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/tour-complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      completeTour();
    } catch (error) {
      console.error('Failed to update tour status:', error);
      // Still complete locally so it doesn't keep popping up
      completeTour();
    }
  };

  return null;
};

export default ProductTour;

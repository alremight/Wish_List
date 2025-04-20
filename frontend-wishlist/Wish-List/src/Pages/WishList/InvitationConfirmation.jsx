// InvitationConfirmation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function InvitationConfirmation() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId, requesterUsername } = location.state || {};

  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:5152/WishListInvitation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationId })
      });
      if (!response.ok) {
        throw new Error('Ошибка подтверждения приглашения');
      }
      navigate('/wishlist');
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch('http://localhost:5152/WishListInvitation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationId })
      });
      if (!response.ok) {
        throw new Error('Ошибка отклонения приглашения');
      }
      navigate('/home');
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '200px' }}>
      <h2>Вы хотите создать WishList с {requesterUsername}?</h2>
      <button onClick={handleConfirm}>Создать чат</button>
      <button onClick={handleReject}>Отказаться</button>
    </div>
  );
}

export default InvitationConfirmation;

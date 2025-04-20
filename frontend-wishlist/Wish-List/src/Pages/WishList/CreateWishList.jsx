// CreateWishList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateWishList() {
  const [inviteeUsername, setInviteeUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    try {
      const response = await fetch('http://localhost:5152/WishListInvitation/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inviteeUsername })
      });
      if (!response.ok) {
        throw new Error('Ошибка создания приглашения');
      }
      navigate('/home');
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '200px' }}>
      <h2>Создание чата</h2>
      <input
        type="text"
        placeholder="Введите UserName"
        value={inviteeUsername}
        onChange={(e) => setInviteeUsername(e.target.value)}
      />
      <br /><br />
      <button onClick={handleCreateChat}>Создать чат</button>
    </div>
  );
}

export default CreateWishList;

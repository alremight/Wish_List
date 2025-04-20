import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import './ChatComponent.css';

const ChatComponent = ({ userId, userName }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [createRoomVisible, setCreateRoomVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5152/chatHub", { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    setConnection(connection);

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []); 

  
  useEffect(() => {
    if (!connection) return;

    
    if (connection.state === HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    
    connection.on('ReceiveMessage', (message) => {
      if (selectedRoom && message.chatRoomId === selectedRoom.id) {
        setMessages(prev => [message, ...prev]);

        
        if (message.senderId !== userId) {
          try {
            connection.invoke('MarkAsRead', selectedRoom.id);
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
      }

      
      setChatRooms(prev =>
        prev.map(room => {
          if (room.id === message.chatRoomId) {

            if (selectedRoom && selectedRoom.id === room.id) {
              return room;
            }
            
            return { ...room, unreadCount: room.unreadCount + 1 };
          }
          return room;
        })
      );
    });

    
    connection.off('MessagesRead'); 
    connection.on('MessagesRead', (readByUserId, chatRoomId) => {
      if (readByUserId !== userId) {
        setMessages(prev =>
          prev.map(msg => {
            if (msg.senderId === userId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          })
        );
      }
    });

    
    connection.onreconnecting(error => {
      console.warn('SignalR reconnecting due to:', error);
      setError('Переподключение к чату...');
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
      setError(null);
      fetchChatRooms();
    });

    connection.onclose(error => {
      console.error('SignalR connection closed:', error);
      setError('Соединение с чатом прервано.');
    });

   
    connection.start()
      .then(() => {
        console.log('SignalR Connected!');
        
        fetchChatRooms();
        setError(null);
      })
      .catch(err => {
        console.error('SignalR Connection Error: ', err);
        setError('Не удалось подключиться к чату.');
        setLoading(false);
      });

    
    return () => {
      if (connection) {
        connection.stop()
          .catch(err => console.error('Error stopping connection:', err));
      }
    };
  }, [connection, userId]); 

  
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching chat rooms with credentials...');

      const response = await fetch('http://localhost:5152/api/Chat/rooms', {
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch chat rooms: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Chat rooms data:', data);

      setChatRooms(data);

      if (data.length > 0 && !selectedRoom) {
        selectChatRoom(data[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError(`Не удалось загрузить список чатов: ${err.message}`);
      setLoading(false);
    }
  };


  // Загрузка сообщений для выбранной комнаты - исправлен синтаксис шаблонных строк
  const fetchMessages = async (roomId, pageNum = 1) => {
    try {
      const response = await fetch(
        `http://localhost:5152/api/chat/rooms/${roomId}/messages?page=${pageNum}&pageSize=20`,
        {
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include' 
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (pageNum === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...prev, ...data.messages]);
      }

      setHasMoreMessages(data.hasMore);
      return data;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Не удалось загрузить сообщения.');
      return null;
    }
  };

  
  const selectChatRoom = async (room) => {
    setSelectedRoom(room);
    setPage(1);

    
    if (connection && connection.state === 'Connected') {
      await connection.invoke('JoinChatRoom', room.id);
    }

    const result = await fetchMessages(room.id);

    if (result) {
      
      markMessagesAsRead(room.id);

      
      setChatRooms(prev =>
        prev.map(r => {
          if (r.id === room.id) {
            return { ...r, unreadCount: 0 };
          }
          return r;
        })
      );
    }
  };

  
  const markMessagesAsRead = async (roomId) => {
    try {
      if (connection && connection.state === 'Connected') {
        await connection.invoke('MarkAsRead', roomId);
      } else {
        
        await fetch(`http://localhost:5152/api/chat/rooms/${roomId}/read`, {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  
  const sendMessage = async (e) => {
    e.preventDefault();
  
    if (!messageInput.trim() || !selectedRoom) return;
  
    try {
      const messageData = {
        id: Math.random().toString(36).substr(2, 9), 
        senderId: userId,
        senderName: userName,
        content: messageInput,
        chatRoomId: selectedRoom.id,
        sentAt: new Date().toISOString(),
        isRead: false 
      };
  
      
      setMessages(prev => [...prev, messageData]);
  
      
      if (connection && connection.state === 'Connected') {
        await connection.invoke('SendMessage', messageData);
      } else {
        await fetch('http://localhost:5152/api/Chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(messageData)
        });
      }
  
      setMessageInput('');
  
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Не удалось отправить сообщение.');
    }
  };

  
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || !selectedRoom) return;

    const nextPage = page + 1;
    await fetchMessages(selectedRoom.id, nextPage);
    setPage(nextPage);
  };

  
  const handleScroll = () => {
    if (!messageContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMoreMessages) {
      loadMoreMessages();
    }
  };

  
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5152/User/get-all-users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      setParticipants(data.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Не удалось загрузить список пользователей.');
    }
  };

  
  const createChatRoom = async () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0) return;

    try {
      const roomData = {
        name: newRoomName,
        participantIds: selectedParticipants
      };

      const response = await fetch('http://localhost:5152/api/Chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      const newRoom = await response.json();

      
      setChatRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);

      
      if (connection && connection.state === 'Connected') {
        await connection.invoke('JoinChatRoom', newRoom.id);
      }

      
      setNewRoomName('');
      setSelectedParticipants([]);
      setCreateRoomVisible(false);
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Не удалось создать чат.');
    }
  };

  
  const showCreateRoomForm = () => {
    fetchUsers();
    setCreateRoomVisible(true);
  };

  
  const toggleParticipant = (participantId) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(prev => prev.filter(id => id !== participantId));
    } else {
      setSelectedParticipants(prev => [...prev, participantId]);
    }
  };

  
  const filteredParticipants = participants.filter(participant =>
    participant.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      {error && <div className="error-message">{error}</div>}

      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Чаты</h2>
          <button onClick={showCreateRoomForm} className="new-chat-btn">
            Новый чат
          </button>
        </div>

        {loading ? (
          <div className="loading">Загрузка чатов...</div>
        ) : (
          <ul className="chat-room-list">
            {chatRooms.length === 0 ? (
              <li className="empty-state">У вас пока нет чатов</li>
            ) : (
              chatRooms.map(room => (
                <li
                  key={room.id}
                  className={`chat-room-item ${selectedRoom && selectedRoom.id === room.id ? 'active' : ''}`}
                  onClick={() => selectChatRoom(room)}
                >
                  <div className="chat-room-name">{room.name}</div>
                  {room.unreadCount > 0 && (
                    <span className="unread-count">{room.unreadCount}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="chat-main">
        {selectedRoom ? (
          <>
            <div className="chat-header">
              <h2>{selectedRoom.name}</h2>
              <div className="chat-participants">
                {selectedRoom.participants.map(p => (
                  <span key={p.userId} className="participant-badge">
                    {p.userName}
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={messageContainerRef}
              className="messages-container"
              onScroll={handleScroll}
            >
              {messages.length === 0 ? (
                <div className="empty-state">Нет сообщений. Начните общение!</div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === userId ? 'sent' : 'received'}`}
                  >
                    <div className="message-sender">{message.senderName}</div>
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {new Date(message.sentAt).toLocaleTimeString()}
                      {message.senderId === userId && (
                        <span className="read-status">
                          {message.isRead ? " ✓✓" : " ✓"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-form">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Введите сообщение..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Отправить
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Выберите чат или создайте новый</p>
          </div>
        )}
      </div>

      {createRoomVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Создать новый чат</h3>

            <div className="modal-form">
              <div className="form-group">
                <label>Название чата:</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Введите название чата"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Участники:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск пользователей"
                  className="form-control"
                />

                <ul className="participant-list">
                  {filteredParticipants.map(participant => (
                    <li key={participant.id} className="participant-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={() => toggleParticipant(participant.id)}
                        />
                        {participant.userName}
                      </label>
                    </li>
                  ))}

                  {filteredParticipants.length === 0 && (
                    <li className="no-results">Нет результатов</li>
                  )}
                </ul>
              </div>

              <div className="selected-participants">
                <p>Выбрано участников: {selectedParticipants.length}</p>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setCreateRoomVisible(false)}
                >
                  Отмена
                </button>
                <button
                  className="create-btn"
                  onClick={createChatRoom}
                  disabled={!newRoomName.trim() || selectedParticipants.length === 0}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
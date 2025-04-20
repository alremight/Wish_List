using WishList.DataAccess.Postgres.Entity;
using WishList.DataAccess.Postgres;
using WishList.API.Abstraction;
using Microsoft.EntityFrameworkCore;
using WishList.DataAccess.Postgres.Models.Chat;

namespace WishList.API.Services
{
    public class ChatService(WishListDbContext context) : IChatService
    {
        public async Task AddUserToChatRoom(Guid chatRoomId, Guid userId)
        {
            var chatRoom = await context.ChatRooms.FindAsync(chatRoomId);
            if (chatRoom == null)
            {
                throw new Exception("Чат не найден");
            }

            var user = await context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new Exception("Пользователь не найден");
            }

            var existingParticipant = await context.ChatRoomParticipants
                .FirstOrDefaultAsync(p => p.ChatRoomId == chatRoomId && p.UserId == userId);

            if (existingParticipant != null)
            {
                throw new Exception("Пользователь уже является участником этого чата");
            }

            var participant = new ChatRoomParticipantEntity
            {
                ChatRoomId = chatRoomId,
                UserId = userId,
                JoinedAt = DateTime.UtcNow
            };

            await context.ChatRoomParticipants.AddAsync(participant);
            await context.SaveChangesAsync();
        }

        public async Task<ChatRoomDTO> CreateChatRoom(CreateChatRoomDTO createChatRoomDTO, Guid creatorId)
        {
            try
            {
                if (createChatRoomDTO.WishListId.HasValue)
                {
                    var wishListExists = await context.WishLists
                        .AnyAsync(w => w.Id == createChatRoomDTO.WishListId.Value);
                    if (!wishListExists)
                        throw new InvalidOperationException("WishList с указанным идентификатором не существует.");
                }

                var chatRoom = new ChatRoomEntity
                {
                    Id = Guid.NewGuid(),
                    Name = createChatRoomDTO.Name,
                    CreatedAt = DateTime.UtcNow,
                    WishListId = createChatRoomDTO.WishListId
                };

                await context.ChatRooms.AddAsync(chatRoom);

                var creatorExists = await context.Users.AnyAsync(u => u.Id == creatorId);
                if (!creatorExists)
                    throw new InvalidOperationException("Создатель не существует.");

                var creatorParticipant = new ChatRoomParticipantEntity
                {
                    ChatRoomId = chatRoom.Id,
                    UserId = creatorId,
                    JoinedAt = DateTime.UtcNow
                };

                await context.ChatRoomParticipants.AddAsync(creatorParticipant);

                var validParticipantIds = await context.Users
                    .Where(u => createChatRoomDTO.ParticipantIds.Contains(u.Id) && u.Id != creatorId)
                    .Select(u => u.Id)
                    .ToListAsync();

                foreach (var participantId in validParticipantIds)
                {
                    var participant = new ChatRoomParticipantEntity
                    {
                        ChatRoomId = chatRoom.Id,
                        UserId = participantId,
                        JoinedAt = DateTime.UtcNow
                    };

                    await context.ChatRoomParticipants.AddAsync(participant);
                }

                await context.SaveChangesAsync();

                return await GetChatRoomById(chatRoom.Id, creatorId);
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Ошибка сохранения в БД: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
        }

        public async Task<PaginatedMessagesResponseDTO> GetChatMessages(Guid chatRoomId, Guid userId, int page, int pageSize)
        {
            var chatRoom = await context.ChatRooms
                 .Include(r => r.Participants)
                 .FirstOrDefaultAsync(r => r.Id == chatRoomId);

            if (chatRoom == null)
            {
                throw new Exception("Чат не найден");
            }

            var isParticipant = chatRoom.Participants.Any(p => p.UserId == userId);
            if (!isParticipant)
            {
                throw new Exception("Пользователь не является участником этого чата");
            }

            var totalCount = await context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId)
                .CountAsync();

            var messages = await context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(m => m.Sender)
                .ToListAsync();

            var messageDTOs = messages.Select(m => new ChatMessageDTO
            {
                Id = m.Id,
                Content = m.Content,
                SenderId = m.SenderId,
                SenderName = m.Sender.UserName,
                SentAt = m.SentAt,
                IsRead = m.IsRead
            }).ToList();

            return new PaginatedMessagesResponseDTO
            {
                Messages = messageDTOs,
                HasMore = (page * pageSize) < totalCount,
                TotalCount = totalCount
            };
        }

        public async Task<ChatRoomDTO> GetChatRoomById(Guid chatRoomId, Guid userId)
        {
            var chatRoom = await context.ChatRooms
                .Include(r => r.Participants)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(r => r.Id == chatRoomId);

            if (chatRoom == null)
            {
                throw new Exception("Чат не найден");
            }

            var isParticipant = chatRoom.Participants.Any(p => p.UserId == userId);
            if (!isParticipant)
            {
                throw new Exception("Пользователь не является участником этого чата");
            }

            return await MapChatRoomToDTO(chatRoom, userId);
        }

        public async Task<int> GetUnreadMessagesCount(Guid userId)
        {
            var userParticipations = await context.ChatRoomParticipants
                .Where(p => p.UserId == userId)
                .ToListAsync();

            int totalUnread = 0;

            foreach (var participation in userParticipations)
            {
                var lastRead = participation.LastRead ?? DateTime.MinValue;

                var unreadCount = await context.ChatMessages
                    .Where(m => m.ChatRoomId == participation.ChatRoomId &&
                           m.SenderId != userId &&
                           m.SentAt > lastRead &&
                           !m.IsRead)
                    .CountAsync();

                totalUnread += unreadCount;
            }

            return totalUnread;
        }

        public async Task<List<ChatRoomDTO>> GetUserChatRooms(Guid userId)
        {
            var chatRooms = await context.ChatRoomParticipants
                .Where(p => p.UserId == userId)
                .Select(p => p.ChatRoom)
                .ToListAsync();

            var chatRoomDTOs = new List<ChatRoomDTO>();

            foreach (var room in chatRooms)
            {
                chatRoomDTOs.Add(await MapChatRoomToDTO(room, userId));
            }

            return chatRoomDTOs;
        }

        public async Task MarkMessagesAsRead(Guid chatRoomId, Guid userId)
        {
            var participant = await context.ChatRoomParticipants
                .FirstOrDefaultAsync(p => p.ChatRoomId == chatRoomId && p.UserId == userId);

            if (participant == null)
            {
                throw new Exception("Пользователь не является участником этого чата");
            }

            var currentTime = DateTime.UtcNow;

            var unreadMessages = await context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId && m.SenderId != userId && !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            participant.LastRead = currentTime;

            await context.SaveChangesAsync();
        }

        public async Task RemoveUserFromChatRoom(Guid chatRoomId, Guid userId)
        {
            var participant = await context.ChatRoomParticipants
                .FirstOrDefaultAsync(p => p.ChatRoomId == chatRoomId && p.UserId == userId);

            if (participant == null)
            {
                throw new Exception("Пользователь не является участником этого чата");
            }

            context.ChatRoomParticipants.Remove(participant);
            await context.SaveChangesAsync();

            var participantsCount = await context.ChatRoomParticipants
                .Where(p => p.ChatRoomId == chatRoomId)
                .CountAsync();

            if (participantsCount == 0)
            {
                var chatRoom = await context.ChatRooms.FindAsync(chatRoomId);
                if (chatRoom != null)
                {
                    context.ChatRooms.Remove(chatRoom);
                    await context.SaveChangesAsync();
                }
            }
        }

        public async Task<ChatMessageDTO> SendMessage(CreateMessageDTO messageDTO, Guid senderId)
        {
            var chatRoom = await context.ChatRooms
                .Include(r => r.Participants)
                .FirstOrDefaultAsync(r => r.Id == messageDTO.ChatRoomId);

            if (chatRoom == null)
            {
                throw new Exception("Чат не найден");
            }

            var isParticipant = chatRoom.Participants.Any(p => p.UserId == senderId);
            if (!isParticipant)
            {
                throw new Exception("Пользователь не является участником этого чата");
            }

            var message = new ChatMessageEntity
            {
                Id = Guid.NewGuid(),
                Content = messageDTO.Content,
                SenderId = senderId,
                ChatRoomId = messageDTO.ChatRoomId,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            await context.ChatMessages.AddAsync(message);

            var senderParticipant = await context.ChatRoomParticipants
                .FirstOrDefaultAsync(p => p.ChatRoomId == messageDTO.ChatRoomId && p.UserId == senderId);

            if (senderParticipant != null)
            {
                senderParticipant.LastRead = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();

            var sender = await context.Users.FindAsync(senderId);

            return new ChatMessageDTO
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = message.SenderId,
                SenderName = sender.UserName,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            };
        }
        private async Task<ChatRoomDTO> MapChatRoomToDTO(ChatRoomEntity chatRoom, Guid userId)
        {
            var participants = await context.ChatRoomParticipants
                .Where(p => p.ChatRoomId == chatRoom.Id)
                .Include(p => p.User)
                .ToListAsync();

            var participantDTOs = participants.Select(p => new ParticipantDTO
            {
                UserId = p.UserId,
                UserName = p.User.UserName
            }).ToList();

            var userLastRead = participants
                .FirstOrDefault(p => p.UserId == userId)?.LastRead ?? DateTime.MinValue;

            var unreadCount = await context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoom.Id &&
                       m.SenderId != userId &&
                       m.SentAt > userLastRead &&
                       !m.IsRead)
                .CountAsync();

            return new ChatRoomDTO
            {
                Id = chatRoom.Id,
                Name = chatRoom.Name,
                CreatedAt = chatRoom.CreatedAt,
                WishListId = chatRoom.WishListId,
                Participants = participantDTOs,
                UnreadCount = unreadCount
            };
        }
    }
}

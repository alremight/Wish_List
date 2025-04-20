using Microsoft.EntityFrameworkCore;
using WishList.DataAccess.Postgres.Entity;


namespace WishList.DataAccess.Postgres
{
    public class WishListDbContext : DbContext
    {
        public WishListDbContext(DbContextOptions<WishListDbContext> options)
        : base(options) 
        {
        }
        public DbSet<UserEntity> Users { get; set; }
        public DbSet<WishEntity> Wishes { get; set; }
        public DbSet<WishListEntity> WishLists { get; set; }
        public DbSet<ChatRoomEntity> ChatRooms { get; set; }
        public DbSet<ChatMessageEntity> ChatMessages { get; set; }
        public DbSet<ChatRoomParticipantEntity> ChatRoomParticipants { get; set; }

        public DbSet<WishListInvitationEntity> WishListInvitations { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Существующая конфигурация...

            // Настройка для ChatRoomParticipant
            modelBuilder.Entity<ChatRoomParticipantEntity>()
                .HasKey(p => new { p.ChatRoomId, p.UserId });

            modelBuilder.Entity<ChatRoomParticipantEntity>()
                .HasOne(p => p.ChatRoom)
                .WithMany(r => r.Participants)
                .HasForeignKey(p => p.ChatRoomId);

            modelBuilder.Entity<ChatRoomParticipantEntity>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId);

            // Настройка для ChatMessage
            modelBuilder.Entity<ChatMessageEntity>()
                .HasOne(m => m.ChatRoom)
                .WithMany(r => r.Messages)
                .HasForeignKey(m => m.ChatRoomId);

            modelBuilder.Entity<ChatMessageEntity>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId);

            modelBuilder.Entity<ChatMessageEntity>()
                .Property(m => m.IsRead)
                .HasDefaultValue(false);
        }

    }
}
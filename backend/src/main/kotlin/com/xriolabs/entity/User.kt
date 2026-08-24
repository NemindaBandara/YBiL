@Entity
@Table(name = "users")
class User(
        @Id @GeneratedValue(strategy = GenerationType.UUID)
        val id: UUID? = null,

        @Column(unique = true, nullable = false)
        var username: String,

        @Column(name = "password_hash", nullable = false)
        var passwordHash: String,

        @Enumerated(EnumType.STRING)
        var role: Role = Role.PASSENGER,

        @Column(name = "created_at")
        var createdAt: Instant = Instant.now()
)

enum class Role { PASSENGER, CONDUCTOR, ADMIN }
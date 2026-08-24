@Service
class JwtService(
        @Value("\${jwt.secret}") secret: String,
        @Value("\${jwt.access-expiry-minutes}") private val accessExpiryMinutes: Long
) {
    private val key = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateAccessToken(userId: UUID, role: Role): String =
            Jwts.builder()
                    .subject(userId.toString())
                    .claim("role", role.name)
                    .issuedAt(Date())
                    .expiration(Date(System.currentTimeMillis() + accessExpiryMinutes * 60_000))
                    .signWith(key)
                    .compact()

    fun validateAndGetUserId(token: String): UUID? = try {
        val claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).payload
        UUID.fromString(claims.subject)
    } catch (e: JwtException) {
        null // invalid or expired token
    }
}
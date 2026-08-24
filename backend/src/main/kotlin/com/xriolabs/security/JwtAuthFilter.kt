@Component
class JwtAuthFilter(
        private val jwtService: JwtService,
        private val userRepository: UserRepository
) : OncePerRequestFilter() {

    override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val token = header.removePrefix("Bearer ")
            val userId = jwtService.validateAndGetUserId(token)
            if (userId != null) {
                val user = userRepository.findById(userId).orElse(null)
                if (user != null) {
                    val auth = UsernamePasswordAuthenticationToken(
                            user, null, listOf(SimpleGrantedAuthority("ROLE_${user.role}"))
                    )
                    SecurityContextHolder.getContext().authentication = auth
                }
            }
        }
        filterChain.doFilter(request, response)
    }
}
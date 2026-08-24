@RestController
@RequestMapping("/api/auth")
class AuthController(
        private val userRepository: UserRepository,
        private val passwordEncoder: PasswordEncoder,
        private val jwtService: JwtService
) {
    @PostMapping("/register")
    fun register(@Valid @RequestBody req: RegisterRequest): ResponseEntity<*> {
        if (userRepository.findByUsername(req.username) != null) {
            return ResponseEntity.status(409).body("Username taken")
        }
        val user = User(
                username = req.username,
                passwordHash = passwordEncoder.encode(req.password)
        )
        userRepository.save(user)
        return ResponseEntity.ok(AuthResponse(jwtService.generateAccessToken(user.id!!, user.role)))
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody req: LoginRequest): ResponseEntity<*> {
        val user = userRepository.findByUsername(req.username)
                ?: return ResponseEntity.status(401).body("Invalid credentials")
        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            return ResponseEntity.status(401).body("Invalid credentials")
        }
        return ResponseEntity.ok(AuthResponse(jwtService.generateAccessToken(user.id!!, user.role)))
    }
}
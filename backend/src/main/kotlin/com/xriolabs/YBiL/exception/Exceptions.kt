package com.xriolabs.YBiL.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

// Custom domain exceptions
class UsernameAlreadyExistsException(message: String) : RuntimeException(message)
class InvalidCredentialsException(message: String) : RuntimeException(message)
class InvalidTokenException(message: String) : RuntimeException(message)

// Structured error response envelope
data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: Instant = Instant.now(),
    val validationErrors: Map<String, String>? = null
)

@RestControllerAdvice
class GlobalExceptionHandler {

    // Handles validation failures triggered by @Valid
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = mutableMapOf<String, String>()
        ex.bindingResult.allErrors.forEach { error ->
            val fieldName = (error as? FieldError)?.field ?: "field"
            val errorMessage = error.defaultMessage ?: "Invalid value"
            errors[fieldName] = errorMessage
        }

        val response = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Validation Failed",
            message = "One or more input fields are invalid",
            validationErrors = errors
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    // Handles duplicate registration
    @ExceptionHandler(UsernameAlreadyExistsException::class)
    fun handleUsernameConflict(ex: UsernameAlreadyExistsException): ResponseEntity<ErrorResponse> {
        val response = ErrorResponse(
            status = HttpStatus.CONFLICT.value(),
            error = "Conflict",
            message = ex.message ?: "Resource already exists"
        )
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response)
    }

    // Handles incorrect password or missing user
    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleBadCredentials(ex: InvalidCredentialsException): ResponseEntity<ErrorResponse> {
        val response = ErrorResponse(
            status = HttpStatus.UNAUTHORIZED.value(),
            error = "Unauthorized",
            message = ex.message ?: "Invalid authentication credentials"
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
    }

    // Handles expired or forged tokens
    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidToken(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        val response = ErrorResponse(
            status = HttpStatus.UNAUTHORIZED.value(),
            error = "Unauthorized",
            message = ex.message ?: "Invalid or expired token"
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response)
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalState(ex: IllegalStateException): ResponseEntity<ErrorResponse> {
        val response = ErrorResponse(
            status = HttpStatus.CONFLICT.value(),
            error = "Conflict / Invalid State",
            message = ex.message ?: "Operation violates current business state"
        )
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response)
    }
}
package com.xriolabs.YBiL.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun customOpenAPI(): OpenAPI {
        val securitySchemeName = "BearerAuthentication"

        return OpenAPI()
            .info(
                Info()
                    .title("YBiL Bus Tracking & Timetable API")
                    .version("1.0.0")
                    .description("REST API backend for YBiL bus schedule synchronization, trip tracking, and administration.")
                    .contact(
                        Contact()
                            .name("XrioLabs")
                            .email("zriolabs@gmail.com")
                    )
            )
            .addSecurityItem(SecurityRequirement().addList(securitySchemeName))
            .components(
                Components().addSecuritySchemes(
                    securitySchemeName,
                    SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter your JWT token in the format: Bearer <token>")
                )
            )
    }
}
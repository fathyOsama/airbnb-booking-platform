package fr.codecake.airbnbclone.user.application.dto;

import java.util.UUID;
import java.util.Set;

public record ReadUserDTO(UUID publicId,
                          String firstName,
                          String lastName,
                          String email,
                          String imageUrl,
                          Set<String> authorities) {
}

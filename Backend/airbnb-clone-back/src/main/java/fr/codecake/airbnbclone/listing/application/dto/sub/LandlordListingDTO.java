package fr.codecake.airbnbclone.listing.application.dto.sub;

import jakarta.validation.constraints.NotNull;

public record LandlordListingDTO(@NotNull String firstName,
                                 @NotNull String imageUrl) {

}

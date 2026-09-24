import api from "./axios";

export const searchLocations = async (
  input,
  sessionToken
) => {
  if (
    !input ||
    input.trim().length < 2
  ) {
    return [];
  }

  const response = await api.get(
    "/api/locations/autocomplete",
    {
      params: {
        input: input.trim(),
        sessionToken,
      },
    }
  );

  return response.data;
};

export const getLocationDetails = async (
  placeId,
  sessionToken
) => {
  if (!placeId) {
    throw new Error(
      "Place ID is required"
    );
  }

  const response = await api.get(
    `/api/locations/details/${encodeURIComponent(
      placeId
    )}`,
    {
      params: {
        sessionToken,
      },
    }
  );

  return response.data;
};
package com.example.profiles;

public class ProfileService {

  // returns a fully built immutable profile
  public UserProfile createMinimal(String id, String email) {
    return new UserProfile.Builder(id, email).build();
  }

  // Now instead of mutating, we rebuild with new displayName
  public UserProfile updateDisplayName(UserProfile p, String displayName) {
    return new UserProfile.Builder(p.getId(), p.getEmail())
        .phone(p.getPhone())
        .address(p.getAddress())
        .marketingOptIn(p.isMarketingOptIn())
        .twitter(p.getTwitter())
        .github(p.getGithub())
        .displayName(displayName)
        .build();
  }
}

export function linkToChallengesPage() {
  return "/challenges";
}

export function linkToCreateChallenge() {
  return `${linkToChallengesPage()}/create`;
}

export function linkToAddChallengeCoverPhotoDialog() {
  return `${linkToCreateChallenge()}/addphoto`;
}

export function linkToChallenge(challengeId: string = ":challengeId") {
  return `${linkToChallengesPage()}/${challengeId}`;
}

export function linkToManagePendingMembers(
  challengeId: string = ":challengeId"
) {
  return `${linkToChallengesPage()}/approve/${challengeId}`;
}

export function linkToEditChallenge(challengeId: string = ":challengeId") {
  return `${linkToChallengesPage()}/edit/${challengeId}`;
}

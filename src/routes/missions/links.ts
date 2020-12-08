export function linkToMissionsPage() {
  return "/missions";
}

export function linkToCreateMission() {
  return `${linkToMissionsPage()}/create`;
}

export function linkToAddMissionCoverPhotoDialog() {
  return `${linkToCreateMission()}/addphoto`;
}

export function linkToMission(missionId: string = ":missionId") {
  return `${linkToMissionsPage()}/${missionId}`;
}

export function linkToManagePendingMembers(missionId: string = ":missionId") {
  return `${linkToMissionsPage()}/approve/${missionId}`;
}

export function linkToEditMission(missionId: string = ":missionId") {
  return `${linkToMissionsPage()}/edit/${missionId}`;
}

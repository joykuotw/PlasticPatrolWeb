import { ChallengeId } from "./Challenges";

class User {
  id: string;
  displayName: string;
  isModerator: boolean;
  email: string;
  isAnonymous: boolean;
  phoneNumber: string;
  photoURL: string;
  description: string;
  location: any;
  profileURL: string;
  challenges: ChallengeId[];

  constructor(
    id: string,
    displayName: string,
    isModerator: boolean,
    email: string,
    isAnonymous: boolean,
    phoneNumber: string,
    photoURL: string,
    description: string,
    location: any,
    profileURL: string,
    challenges: ChallengeId[]
) {
    this.id = id;
    this.displayName = displayName;
    this.isModerator = isModerator;
    this.email = email;
    this.isAnonymous = isAnonymous;
    this.phoneNumber = phoneNumber;
    this.photoURL = photoURL;
    this.description = description;
    this.location = location;
    this.profileURL = profileURL;
    this.challenges = challenges;
  }
}

export default User;

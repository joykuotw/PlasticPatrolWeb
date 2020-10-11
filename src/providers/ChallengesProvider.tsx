import { Challenge } from "../types/Challenges";
import exampleImage from "assets/images/example.jpeg";
import { ImageMetadata } from "../types/Photo";

export const FakeChallenge: Challenge = {
    id: "123",
    name: "This is the CHALLENGE",
    description: "this is the description of the challenge omg I hate plastic",
    coverPhoto: {
        imgSrc: exampleImage,
        imgExif: undefined,
        imgLocation: "not online",
        imgIptc: undefined
    } as ImageMetadata,
    startTime: 1,
    endTime: 4,
    targetPieces: 10,
    isPrivate: false,

    ownerUserId: "123",
    totalPieces: 4,
    totalUserPieces: [
        {uid: "123", pieces: 3},
        {uid: "456", pieces: 45}
    ],
    pendingUserIds: [
        "adsfasdf",
        "awe",
        "gr",
    ],
};

export const useChallenges = (): Challenge[] => {
    // const [challenges, setChallenges] = useState<Challenge[]>([]);
    // useEffect(
    //    setChallenges(FakeChallenges)
    // );
    return [FakeChallenge, FakeChallenge, FakeChallenge, FakeChallenge, FakeChallenge, FakeChallenge];
};

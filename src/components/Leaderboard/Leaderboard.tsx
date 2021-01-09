import React from "react";

import PageWrapper from "../PageWrapper";
import { StatsUser } from "types/Stats";
import { UserPieceRankTable } from "./index";

type Props = {
  usersLeaderboard: StatsUser[];
  user: { id?: string };
  handleClose: () => void;
  label: string;
};

export default function Leaderboard({
  user,
  usersLeaderboard,
  handleClose,
  label
}: Props) {
  return (
    <PageWrapper navigationHandler={{ handleClose }} label={label}>
      <UserPieceRankTable usersLeaderboard={usersLeaderboard} user={user} />
    </PageWrapper>
  );
}
